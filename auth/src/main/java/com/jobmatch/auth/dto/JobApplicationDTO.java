package com.jobmatch.auth.dto;

import com.jobmatch.auth.entities.JobApplication;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class JobApplicationDTO {
    private Long id;
    private Long userId;
    private Long jobOfferId;
    private LocalDateTime appliedAt;
    private JobApplication.ApplicationStatus status;
    private String coverLetter;
    private String feedback;
    
    // Additional fields for response
    private String userName;
    private String jobTitle;
    private String companyName;
} 