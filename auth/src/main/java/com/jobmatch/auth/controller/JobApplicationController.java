package com.jobmatch.auth.controller;

import com.jobmatch.auth.dto.JobApplicationDTO;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.service.JobApplicationService;
import com.jobmatch.auth.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final AppUserRepository appUserRepository;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<JobApplicationDTO> createApplication(
            @RequestBody JobApplicationDTO applicationDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        AppUser user = appUserRepository.findByUsername(userDetails.getUsername());
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Force the logged-in user's ID, ignore client-sent userId
        applicationDTO.setUserId(user.getId());

        JobApplicationDTO createdApplication = jobApplicationService.createApplication(applicationDTO);
        return ResponseEntity.ok(createdApplication);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<JobApplicationDTO>> getUserApplications(@PathVariable Long userId) {
        return ResponseEntity.ok(jobApplicationService.getUserApplications(userId));
    }

    @GetMapping("/job/{jobOfferId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<JobApplicationDTO>> getJobOfferApplications(@PathVariable Long jobOfferId) {
        return ResponseEntity.ok(jobApplicationService.getJobOfferApplications(jobOfferId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<JobApplicationDTO> getApplication(@PathVariable Long id) {
        return ResponseEntity.ok(jobApplicationService.getApplication(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<JobApplicationDTO> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(jobApplicationService.updateApplicationStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        jobApplicationService.deleteApplication(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> getApplicationStats() {
        return ResponseEntity.ok(jobApplicationService.getApplicationStats());
    }

    // Return logged-in user's applications, no userId in path
    @GetMapping("/history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<JobApplicationDTO>> getUserApplicationHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        AppUser user = appUserRepository.findByUsername(userDetails.getUsername());
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        List<JobApplicationDTO> history = jobApplicationService.getUserApplications(user.getId());
        return ResponseEntity.ok(history);
    }
}
