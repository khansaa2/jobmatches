from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import re
import nltk
import pandas as pd
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from PyPDF2 import PdfReader
from docx import Document
import io
from typing import Dict, List
import logging

# Download required NLTK data
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML models
try:
    model = joblib.load('cv_rf_predictor.pkl')
    encoder = joblib.load('rf_label_encoder.pkl')
except Exception as e:
    logger.error(f"Error loading models: {str(e)}")
    raise

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

class CVInput(BaseModel):
    skills: str
    education: str
    experience: str
    summary: str

def preprocess(text: str) -> str:
    if pd.isna(text):
        return ""
    text = text.lower()
    # Keep alphanumeric characters, spaces, and common punctuation
    text = re.sub(r'[^a-z0-9\s\.,]', ' ', text)
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    words = text.split()
    words = [lemmatizer.lemmatize(w) for w in words if w not in stop_words]
    return ' '.join(words)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        pdf = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
        if not text.strip():
            raise Exception("No text could be extracted from the PDF")
        return text
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        text = ""
        # Extract text from paragraphs
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        # Extract text from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    text += cell.text + " "
                text += "\n"
        if not text.strip():
            raise Exception("No text could be extracted from the DOCX file")
        return text
    except Exception as e:
        logger.error(f"DOCX extraction error: {str(e)}")
        raise Exception(f"Error extracting text from DOCX: {str(e)}")

def extract_sections(text: str) -> Dict[str, str]:
    sections = {
        'skills': '',
        'education': '',
        'experience': '',
        'summary': ''
    }
    
    # Enhanced section markers with more variations
    markers = {
        'skills': [
            'skills', 'technical skills', 'core competencies', 'expertise',
            'technologies', 'programming languages', 'tools', 'software',
            'key skills', 'professional skills', 'competencies'
        ],
        'education': [
            'education', 'academic background', 'qualifications', 'academic qualifications',
            'educational background', 'academic history', 'degrees', 'certifications',
            'academic achievements', 'educational qualifications'
        ],
        'experience': [
            'experience', 'work experience', 'professional experience', 'employment history',
            'work history', 'career history', 'professional background', 'relevant experience',
            'employment experience', 'job history', 'professional summary'
        ],
        'summary': [
            'summary', 'profile', 'objective', 'about me', 'professional summary',
            'career objective', 'personal statement', 'introduction', 'overview',
            'career profile', 'professional profile'
        ]
    }
    
    # Convert text to lowercase and split into lines
    lines = text.split('\n')
    current_section = 'summary'
    section_content = []
    
    for i, line in enumerate(lines):
        line_lower = line.strip().lower()
        
        # Check if line is a section header
        found_header = False
        for section, headers in markers.items():
            # Check for exact matches or headers that start with these phrases
            if any(line_lower.startswith(header) for header in headers):
                if section_content:
                    sections[current_section] += ' '.join(section_content)
                current_section = section
                section_content = []
                found_header = True
                break
        
        if not found_header and line.strip():
            # Skip lines that are too short (likely noise)
            if len(line.strip()) > 3:
                section_content.append(line.strip())
    
    # Add the last section's content
    if section_content:
        sections[current_section] += ' '.join(section_content)
    
    # Clean up sections
    for section in sections:
        sections[section] = re.sub(r'\s+', ' ', sections[section]).strip()
    
    # If summary is empty, use first non-empty paragraph
    if not sections['summary'].strip():
        paragraphs = [p for p in text.split('\n\n') if p.strip()]
        if paragraphs:
            sections['summary'] = paragraphs[0].strip()
    
    # If skills section is empty, try to extract skills from experience
    if not sections['skills'].strip() and sections['experience'].strip():
        # Common skill-related keywords
        skill_indicators = ['proficient in', 'experience with', 'knowledge of', 'skilled in',
                          'expertise in', 'familiar with', 'using', 'developed', 'implemented']
        skill_text = []
        exp_sentences = nltk.sent_tokenize(sections['experience'].lower())
        for sent in exp_sentences:
            if any(indicator in sent for indicator in skill_indicators):
                skill_text.append(sent)
        if skill_text:
            sections['skills'] = ' '.join(skill_text)
    
    return sections

@app.post("/predict")
def predict(data: CVInput):
    try:
        combined = ' '.join([
            preprocess(data.skills),
            preprocess(data.education),
            preprocess(data.experience),
            preprocess(data.summary)
        ])
        prediction = model.predict([combined])[0]
        top3 = model.predict_proba([combined])[0].argsort()[-3:][::-1]
        top_labels = encoder.inverse_transform(top3).tolist()
        confidences = [float(model.predict_proba([combined])[0][i]) for i in top3]

        return {
            "top_predictions": [
                {"title": title, "confidence": conf}
                for title, conf in zip(top_labels, confidences)
            ]
        }
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # Extract text based on file type
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(contents)
        elif file.filename.endswith('.docx'):
            text = extract_text_from_docx(contents)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF or DOCX file.")
        
        # Extract sections from the CV
        sections = extract_sections(text)
        
        # Create input for prediction
        input_data = CVInput(**sections)
        
        # Get predictions
        predictions = predict(input_data)
        
        return {
            "message": "CV processed successfully",
            "predictions": predictions
        }
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
