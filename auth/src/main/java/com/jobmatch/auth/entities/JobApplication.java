package com.jobmatch.auth.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "job_application")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_offer_id", nullable = false)
    private JobOffer jobOffer;

    private String coverLetter;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime appliedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    public enum ApplicationStatus {
        PENDING,
        REVIEWING,
        SHORTLISTED,
        REJECTED,
        ACCEPTED
    }
} 