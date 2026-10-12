package com.jobmatch.auth.service;

import com.jobmatch.auth.entities.Recommendation;
import com.jobmatch.auth.entities.AppUser;
import java.util.List;

public interface RecommendationService {
    List<Recommendation> getUserRecommendations(AppUser user);
    Recommendation getRecommendation(Long id);
    Recommendation updateFeedback(Long id, String feedback);
    void deleteRecommendation(Long id);
} 