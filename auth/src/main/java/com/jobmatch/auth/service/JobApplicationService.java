package com.jobmatch.auth.service;

import com.jobmatch.auth.dto.JobApplicationDTO;
import java.util.List;

public interface JobApplicationService {
    JobApplicationDTO createApplication(JobApplicationDTO applicationDTO);
    List<JobApplicationDTO> getUserApplications(Long userId);
    List<JobApplicationDTO> getJobOfferApplications(Long jobOfferId);
    JobApplicationDTO getApplication(Long id);
    JobApplicationDTO updateApplicationStatus(Long id, String status);
    void deleteApplication(Long id);
    Object getApplicationStats();
} 