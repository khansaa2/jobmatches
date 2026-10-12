package com.jobmatch.auth.dto;

import com.jobmatch.auth.entities.JobOffer;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PredictionWithRecommendationsDTO {
    private Long predictionId;
    private String predictedTitle;
    private LocalDateTime predictedAt;
    private List<RecommendationDTO> recommendations;

    @Data
    public static class RecommendationDTO {
        private Long recommendationId;
        private Double score;
        private LocalDateTime createdAt;
        private JobOffer jobOffer;
    }
} 