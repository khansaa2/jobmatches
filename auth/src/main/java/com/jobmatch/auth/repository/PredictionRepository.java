package com.jobmatch.auth.repository;


import com.jobmatch.auth.entities.Prediction;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    Prediction findByCvId(Long cvId);
}
