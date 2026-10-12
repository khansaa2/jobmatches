package com.jobmatch.auth.service.impl;

import com.jobmatch.auth.entities.Recommendation;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.repository.RecommendationRepository;
import com.jobmatch.auth.service.RecommendationService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RecommendationServiceImpl implements RecommendationService {
    private final RecommendationRepository recommendationRepository;

    public RecommendationServiceImpl(RecommendationRepository recommendationRepository) {
        this.recommendationRepository = recommendationRepository;
    }

    @Override
    public List<Recommendation> getUserRecommendations(AppUser user) {
        return recommendationRepository.findByUserId(user.getId());
    }

    @Override
    public Recommendation getRecommendation(Long id) {
        return recommendationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));
    }

    @Override
    public Recommendation updateFeedback(Long id, String feedback) {
        Recommendation recommendation = getRecommendation(id);
        recommendation.setFeedback(feedback);
        return recommendationRepository.save(recommendation);
    }

    @Override
    public void deleteRecommendation(Long id) {
        recommendationRepository.deleteById(id);
    }
} 