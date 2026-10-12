package com.jobmatch.auth.service;

import com.jobmatch.auth.entities.JobOffer;
import java.util.List;

public interface JobOfferService {
    List<JobOffer> searchJobOffers(String location, String jobTitle, String companyName);
    JobOffer getJobOffer(Long id);
    JobOffer createJobOffer(JobOffer jobOffer);
    JobOffer updateJobOffer(Long id, JobOffer jobOffer);
    void deleteJobOffer(Long id);
    List<JobOffer> findMatchingJobOffers(String title);
} 