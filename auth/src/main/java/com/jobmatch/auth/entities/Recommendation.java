package com.jobmatch.auth.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne
    @JoinColumn(name = "prediction_id", nullable = false)
    private Prediction prediction;

    @ManyToOne
    @JoinColumn(name = "job_offer_id", nullable = false)
    private JobOffer jobOffer;

    @Column(nullable = false)
    private Double score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
