package com.jobmatch.auth.repository;

import com.jobmatch.auth.entities.Recommendation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByUserId(Long userId);
    List<Recommendation> findByPredictionId(Long predictionId);
    List<Recommendation> findByJobOfferId(Long jobOfferId);
    List<Recommendation> findByPredictionIdAndJobOfferId(Long predictionId, Long jobOfferId);
    
    // Find recommendations for a prediction with pagination
    Page<Recommendation> findByPredictionId(Long predictionId, Pageable pageable);
    
    // Find recommendations with score above a threshold
    List<Recommendation> findByPredictionIdAndScoreGreaterThanEqual(Long predictionId, Double threshold);
    
    // Find top N recommendations for a prediction
    @Query("SELECT r FROM Recommendation r WHERE r.prediction.id = ?1 ORDER BY r.score DESC")
    List<Recommendation> findTopRecommendations(Long predictionId, Pageable pageable);
} 