package com.jobmatch.auth.service;

import com.jobmatch.auth.entities.Prediction;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.entities.CV;
import java.util.List;
import java.util.Map;
import com.jobmatch.auth.dto.PredictionWithRecommendationsDTO;

public interface PredictionService {
    Prediction generatePrediction(AppUser user, Long jobOfferId);
    List<Prediction> getUserPredictions(AppUser user);
    Prediction getPrediction(Long id);
    void deletePrediction(Long id);
    void savePredictionsAndRecommendations(AppUser user, CV cv, java.util.List<Map<String, Object>> predictions, java.util.List<Map<String, Object>> recommendations);
    List<Prediction> getAllPredictionsByUser(AppUser user);
    List<PredictionWithRecommendationsDTO> getPredictionsWithRecommendations(AppUser user);
} 