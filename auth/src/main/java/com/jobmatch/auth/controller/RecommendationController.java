package com.jobmatch.auth.controller;

import com.jobmatch.auth.entities.Recommendation;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.service.AccountService;
import com.jobmatch.auth.service.RecommendationService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin("*")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final AccountService accountService;

    public RecommendationController(RecommendationService recommendationService, AccountService accountService) {
        this.recommendationService = recommendationService;
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<List<Recommendation>> getUserRecommendations(Authentication authentication) {
        AppUser user = accountService.loadUserByUsername(authentication.getName());
        List<Recommendation> recommendations = recommendationService.getUserRecommendations(user);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recommendation> getRecommendation(@PathVariable Long id) {
        Recommendation recommendation = recommendationService.getRecommendation(id);
        return ResponseEntity.ok(recommendation);
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<Recommendation> provideFeedback(
            @PathVariable Long id,
            @RequestBody FeedbackRequest request) {
        Recommendation recommendation = recommendationService.updateFeedback(id, request.getFeedback());
        return ResponseEntity.ok(recommendation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecommendation(@PathVariable Long id) {
        recommendationService.deleteRecommendation(id);
        return ResponseEntity.ok().build();
    }
}

@Data
class FeedbackRequest {
    private String feedback;
} 