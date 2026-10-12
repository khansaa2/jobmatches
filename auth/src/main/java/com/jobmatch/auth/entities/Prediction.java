package com.jobmatch.auth.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Prediction")
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne
    private CV cv;

    private String predictedTitle;
    private Double confidence;
    private LocalDateTime predictedAt;
}

