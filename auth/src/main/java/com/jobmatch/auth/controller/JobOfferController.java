package com.jobmatch.auth.controller;

import com.jobmatch.auth.entities.JobOffer;
import com.jobmatch.auth.service.JobOfferService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-offers")
@CrossOrigin("*")
public class JobOfferController {

    private final JobOfferService jobOfferService;

    public JobOfferController(JobOfferService jobOfferService) {
        this.jobOfferService = jobOfferService;
    }

    @GetMapping
    public ResponseEntity<List<JobOffer>> getAllJobOffers(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobTitle,
            @RequestParam(required = false) String companyName) {
        List<JobOffer> jobOffers = jobOfferService.searchJobOffers(location, jobTitle, companyName);
        return ResponseEntity.ok(jobOffers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOffer> getJobOffer(@PathVariable Long id) {
        JobOffer jobOffer = jobOfferService.getJobOffer(id);
        return ResponseEntity.ok(jobOffer);
    }

    @PostMapping
    public ResponseEntity<JobOffer> createJobOffer(@RequestBody JobOffer jobOffer) {
        JobOffer savedJobOffer = jobOfferService.createJobOffer(jobOffer);
        return ResponseEntity.ok(savedJobOffer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOffer> updateJobOffer(
            @PathVariable Long id,
            @RequestBody JobOffer jobOffer) {
        JobOffer updatedJobOffer = jobOfferService.updateJobOffer(id, jobOffer);
        return ResponseEntity.ok(updatedJobOffer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJobOffer(@PathVariable Long id) {
        jobOfferService.deleteJobOffer(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobOffer>> searchJobOffersByTitle(
            @RequestParam String title) {
        List<JobOffer> jobOffers = jobOfferService.findMatchingJobOffers(title);
        return ResponseEntity.ok(jobOffers);
    }
} 