package com.jobmatch.auth.service;

import com.jobmatch.auth.dto.JobApplicationDTO;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.entities.JobApplication;
import com.jobmatch.auth.entities.JobOffer;
import com.jobmatch.auth.mapper.JobApplicationMapper;
import com.jobmatch.auth.repository.AppUserRepository;
import com.jobmatch.auth.repository.JobApplicationRepository;
import com.jobmatch.auth.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobApplicationMapper jobApplicationMapper;
    private final AppUserRepository appUserRepository;
    private final JobOfferRepository jobOfferRepository;

    @Override
    public JobApplicationDTO createApplication(JobApplicationDTO applicationDTO) {
        AppUser user = appUserRepository.findById(applicationDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        JobOffer jobOffer = jobOfferRepository.findById(applicationDTO.getJobOfferId())
                .orElseThrow(() -> new RuntimeException("Job offer not found"));

        // Prevent duplicate applications
        if (jobApplicationRepository.existsByUserIdAndJobOfferId(user.getId(), jobOffer.getId())) {
            throw new RuntimeException("You have already applied to this job offer.");
        }

        JobApplication application = JobApplication.builder()
                .user(user)
                .jobOffer(jobOffer)
                .coverLetter(applicationDTO.getCoverLetter())
                .build();

        return jobApplicationMapper.toDTO(jobApplicationRepository.save(application));
    }

    @Override
    public List<JobApplicationDTO> getUserApplications(Long userId) {
        return jobApplicationRepository.findByUserId(userId).stream()
                .map(jobApplicationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobApplicationDTO> getJobOfferApplications(Long jobOfferId) {
        return jobApplicationRepository.findByJobOfferId(jobOfferId).stream()
                .map(jobApplicationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public JobApplicationDTO getApplication(Long id) {
        return jobApplicationMapper.toDTO(
                jobApplicationRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Application not found"))
        );
    }

    @Override
    public JobApplicationDTO updateApplicationStatus(Long id, String status) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(JobApplication.ApplicationStatus.valueOf(status.toUpperCase()));
        return jobApplicationMapper.toDTO(jobApplicationRepository.save(application));
    }

    @Override
    public void deleteApplication(Long id) {
        jobApplicationRepository.deleteById(id);
    }

    @Override
    public Object getApplicationStats() {
        List<JobApplication> allApplications = jobApplicationRepository.findAll();
        
        Map<JobApplication.ApplicationStatus, Long> statusCounts = allApplications.stream()
                .collect(Collectors.groupingBy(
                        JobApplication::getStatus,
                        Collectors.counting()
                ));

        return Map.of(
                "totalApplications", allApplications.size(),
                "statusBreakdown", statusCounts
        );
    }
} 