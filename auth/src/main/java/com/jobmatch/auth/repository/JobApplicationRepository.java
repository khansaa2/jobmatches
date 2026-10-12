package com.jobmatch.auth.repository;

import com.jobmatch.auth.entities.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    Page<JobApplication> findByUserId(Long userId, Pageable pageable);
    Page<JobApplication> findByJobOfferId(Long jobOfferId, Pageable pageable);
    List<JobApplication> findByUserId(Long userId);
    List<JobApplication> findByJobOfferId(Long jobOfferId);
    boolean existsByUserIdAndJobOfferId(Long userId, Long jobOfferId);
    List<JobApplication> findByUserIdOrderByCreatedAtDesc(Long userId);
} 