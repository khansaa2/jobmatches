package com.jobmatch.auth.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.util.LinkedMultiValueMap;
import reactor.core.publisher.Mono;
import java.util.Map;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.entities.CV;
import com.jobmatch.auth.entities.Prediction;
import com.jobmatch.auth.service.PredictionService;
import com.jobmatch.auth.repository.CVRepository;
import com.jobmatch.auth.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.List;
import com.jobmatch.auth.entities.Recommendation;
import com.jobmatch.auth.repository.RecommendationRepository;

@RestController
@RequestMapping("/api/cv-analysis")
@CrossOrigin(origins = "http://localhost:3000")
public class CVAnalysisController {

    private final WebClient webClient = WebClient.create("http://localhost:8000");
    @Autowired
    private PredictionService predictionService;
    @Autowired
    private CVRepository cvRepository;
    @Autowired
    private AppUserRepository appUserRepository;
    @Autowired
    private RecommendationRepository recommendationRepository;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeCV(@RequestBody Map<String, Object> cvData, @AuthenticationPrincipal UserDetails userDetails) {
        Long cvId = cvData.containsKey("cvId") ? Long.valueOf(cvData.get("cvId").toString()) : null;
        AppUser user = appUserRepository.findByUsername(userDetails.getUsername());
        CV cv;
        if (cvId != null) {
            cv = cvRepository.findById(cvId).orElseThrow(() -> new RuntimeException("CV not found"));
        } else {
            cv = new CV();
            cv.setUser(user);
            cv.setContent(cvData.toString());
            cv.setUploadedAt(java.time.LocalDateTime.now());
            cv = cvRepository.save(cv);
        }
        // Prepare only the required fields for the ML API
        Map<String, Object> mlPayload = Map.of(
            "skills", cvData.getOrDefault("skills", ""),
            "education", cvData.getOrDefault("education", ""),
            "experience", cvData.getOrDefault("experience", ""),
            "summary", cvData.getOrDefault("summary", "")
        );
        try {
            Map mlResponse = webClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(mlPayload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            System.out.println("ML API response: " + mlResponse);
            // Save predictions and recommendations
            List<Map<String, Object>> predictions = (List<Map<String, Object>>) mlResponse.get("top_predictions");
            System.out.println("Saving predictions for user: " + user.getUsername() + ", CV: " + cv.getId());
            System.out.println("Predictions: " + predictions);
            predictionService.savePredictionsAndRecommendations(user, cv, predictions, predictions);
            return ResponseEntity.ok(mlResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "ML API error: " + e.getMessage()));
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadCV(@RequestParam("file") MultipartFile file) {
        LinkedMultiValueMap<String, Object> formData = new LinkedMultiValueMap<>();
        formData.add("file", file.getResource());
        return webClient.post()
                .uri("/upload")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(formData))
                .retrieve()
                .toEntity(Map.class)
                .block();
    }

    @GetMapping("/history")
    public ResponseEntity<List<Prediction>> getPredictionHistory(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser user = appUserRepository.findByUsername(userDetails.getUsername());
        List<Prediction> history = predictionService.getAllPredictionsByUser(user);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<Recommendation>> getUserRecommendations(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser user = appUserRepository.findByUsername(userDetails.getUsername());
        List<Recommendation> recs = recommendationRepository.findByUserId(user.getId());
        return ResponseEntity.ok(recs);
    }

    @GetMapping("/recommendations/{predictionId}")
    public ResponseEntity<List<Recommendation>> getRecommendationsByPrediction(@PathVariable Long predictionId) {
        List<Recommendation> recs = recommendationRepository.findByPredictionId(predictionId);
        return ResponseEntity.ok(recs);
    }
} 