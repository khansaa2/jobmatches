package com.jobmatch.auth.mapper;

import com.jobmatch.auth.dto.JobApplicationDTO;
import com.jobmatch.auth.entities.JobApplication;
import org.springframework.stereotype.Component;

@Component
public class JobApplicationMapper {
    
    public JobApplicationDTO toDTO(JobApplication application) {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setId(application.getId());
        dto.setUserId(application.getUser().getId());
        dto.setJobOfferId(application.getJobOffer().getId());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setStatus(application.getStatus());
        dto.setCoverLetter(application.getCoverLetter());
        dto.setFeedback(application.getFeedback());
        
        // Set additional response fields
        dto.setUserName(application.getUser().getUsername());
        dto.setJobTitle(application.getJobOffer().getJobTitle());
        dto.setCompanyName(application.getJobOffer().getCompanyName());
        
        return dto;
    }
    
    public JobApplication toEntity(JobApplicationDTO dto) {
        return JobApplication.builder()
                .id(dto.getId())
                .coverLetter(dto.getCoverLetter())
                .feedback(dto.getFeedback())
                .build();
    }
} 