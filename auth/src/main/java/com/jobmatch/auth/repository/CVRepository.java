package com.jobmatch.auth.repository;

import com.jobmatch.auth.entities.CV;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CVRepository extends JpaRepository<CV, Long> {
    List<CV> findByUserId(Long userId);
}