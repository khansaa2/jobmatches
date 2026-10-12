package com.jobmatch.auth.service.impl;

import com.jobmatch.auth.entities.JobOffer;
import com.jobmatch.auth.repository.JobOfferRepository;
import com.jobmatch.auth.service.JobOfferService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class JobOfferServiceImpl implements JobOfferService {
    private final JobOfferRepository jobOfferRepository;

    public JobOfferServiceImpl(JobOfferRepository jobOfferRepository) {
        this.jobOfferRepository = jobOfferRepository;
    }

    @Override
    public List<JobOffer> searchJobOffers(String location, String jobTitle, String companyName) {
        // TODO: Implement search logic
        return jobOfferRepository.findAll();
    }

    @Override
    public JobOffer getJobOffer(Long id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job offer not found"));
    }

    @Override
    public JobOffer createJobOffer(JobOffer jobOffer) {
        return jobOfferRepository.save(jobOffer);
    }

    @Override
    public JobOffer updateJobOffer(Long id, JobOffer jobOffer) {
        JobOffer existingOffer = getJobOffer(id);
        // TODO: Update fields
        return jobOfferRepository.save(existingOffer);
    }

    @Override
    public void deleteJobOffer(Long id) {
        jobOfferRepository.deleteById(id);
    }

    @Override
    public List<JobOffer> findMatchingJobOffers(String title) {
        return jobOfferRepository.findMatchingJobOffers(title);
    }
} 