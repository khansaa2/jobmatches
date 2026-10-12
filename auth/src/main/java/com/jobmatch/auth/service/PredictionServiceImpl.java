package com.jobmatch.auth.service;

import com.jobmatch.auth.entities.Prediction;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.entities.CV;
import com.jobmatch.auth.entities.Recommendation;
import com.jobmatch.auth.entities.JobOffer;
import com.jobmatch.auth.repository.PredictionRepository;
import com.jobmatch.auth.repository.RecommendationRepository;
import com.jobmatch.auth.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Collections;
import java.time.LocalDateTime;
import java.util.Map;
import com.jobmatch.auth.dto.PredictionWithRecommendationsDTO;

@Service
public class PredictionServiceImpl implements PredictionService {
    @Autowired
    private PredictionRepository predictionRepository;
    @Autowired
    private RecommendationRepository recommendationRepository;
    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Override
    public Prediction generatePrediction(AppUser user, Long jobOfferId) {
        // TODO: Implement prediction logic
        return null;
    }

    @Override
    public List<Prediction> getUserPredictions(AppUser user) {
        // TODO: Implement logic to get user predictions
        return Collections.emptyList();
    }

    @Override
    public Prediction getPrediction(Long id) {
        // TODO: Implement logic to get a prediction by id
        return null;
    }

    @Override
    public void deletePrediction(Long id) {
        // TODO: Implement logic to delete a prediction
    }

    @Override
    public void savePredictionsAndRecommendations(AppUser user, CV cv, java.util.List<Map<String, Object>> predictions, java.util.List<Map<String, Object>> recommendations) {
        for (Map<String, Object> pred : predictions) {
            Prediction prediction = new Prediction();
            prediction.setUser(user);
            prediction.setCv(cv);
            prediction.setPredictedTitle((String) pred.get("title"));
            prediction.setConfidence(Double.valueOf(pred.get("confidence").toString()));
            prediction.setPredictedAt(LocalDateTime.now());
            prediction = predictionRepository.save(prediction);

            // Find matching job offers using the new repository method
            List<JobOffer> matchingOffers = jobOfferRepository.findMatchingJobOffers(prediction.getPredictedTitle());
            
            for (JobOffer jobOffer : matchingOffers) {
                // Calculate a matching score based on multiple factors
                double score = calculateMatchingScore(prediction, jobOffer);
                
                // Create recommendation for all matching offers
                Recommendation recommendation = new Recommendation();
                recommendation.setUser(user);
                recommendation.setPrediction(prediction);
                recommendation.setJobOffer(jobOffer);
                recommendation.setScore(score);
                recommendation.setFeedback("Job matches your predicted role with " + 
                    String.format("%.0f", score * 100) + "% confidence");
                recommendation.setCreatedAt(LocalDateTime.now());
                recommendation.setUpdatedAt(LocalDateTime.now());
                recommendationRepository.save(recommendation);
            }
        }
    }

    private double calculateMatchingScore(Prediction prediction, JobOffer jobOffer) {
        double score = 0.0;
        
        // Title match (40% weight)
        if (jobOffer.getJobTitle().toLowerCase().equals(prediction.getPredictedTitle().toLowerCase())) {
            score += 0.4;
        } else if (jobOffer.getJobTitle().toLowerCase().contains(prediction.getPredictedTitle().toLowerCase()) ||
                  prediction.getPredictedTitle().toLowerCase().contains(jobOffer.getJobTitle().toLowerCase())) {
            score += 0.3;
        }
        
        // Confidence from prediction (30% weight)
        score += prediction.getConfidence() * 0.3;
        
        // Job posting recency (20% weight)
        long daysSincePosting = java.time.temporal.ChronoUnit.DAYS.between(
            jobOffer.getJobPostingDate(), 
            java.time.LocalDate.now()
        );
        score += Math.max(0, 1 - (daysSincePosting / 30.0)) * 0.2;
        
        // Employment type and location (10% weight)
        if (jobOffer.getEmploymentType() != null && jobOffer.getEmploymentType().equals("FULL_TIME")) {
            score += 0.05;
        }
        if (jobOffer.getRemoteOption() != null && jobOffer.getRemoteOption().equals("REMOTE")) {
            score += 0.05;
        }
        
        return Math.min(1.0, score);
    }

    @Override
    public List<Prediction> getAllPredictionsByUser(AppUser user) {
        return predictionRepository.findAll().stream()
            .filter(p -> p.getUser().getId().equals(user.getId()))
            .toList();
    }

    @Override
    public List<PredictionWithRecommendationsDTO> getPredictionsWithRecommendations(AppUser user) {
        List<Prediction> predictions = predictionRepository.findAll().stream()
            .filter(p -> p.getUser().getId().equals(user.getId()))
            .toList();

        return predictions.stream().map(pred -> {
            PredictionWithRecommendationsDTO dto = new PredictionWithRecommendationsDTO();
            dto.setPredictionId(pred.getId());
            dto.setPredictedTitle(pred.getPredictedTitle());
            dto.setPredictedAt(pred.getPredictedAt());

            List<Recommendation> recs = recommendationRepository.findByPredictionId(pred.getId());
            List<PredictionWithRecommendationsDTO.RecommendationDTO> recDtos = recs.stream().map(rec -> {
                PredictionWithRecommendationsDTO.RecommendationDTO r = new PredictionWithRecommendationsDTO.RecommendationDTO();
                r.setRecommendationId(rec.getId());
                r.setScore(rec.getScore());
                r.setCreatedAt(rec.getCreatedAt());
                r.setJobOffer(rec.getJobOffer());
                return r;
            }).toList();

            dto.setRecommendations(recDtos);
            return dto;
        }).toList();
    }
} 