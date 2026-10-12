package com.jobmatch.auth.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "JobOffer")
public class JobOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;

    private String jobTitle;

    @Column(columnDefinition = "TEXT")
    private String jobDescription;

    private String experienceRequired;

    @Column(columnDefinition = "TEXT")
    private String keySkills;

    private String roleCategory;
    private String location;

    private String city;

    private String state;

    private String country;

    private String functionalArea;
    private String industry;
    private String role;

    private Double salaryRangeMin;

    private Double salaryRangeMax;

    private String currency;

    private String remoteOption;

    private LocalDate jobPostingDate;

    private String educationRequirements;

    private String employmentType;

    @Column(columnDefinition = "TEXT")
    private String benefits;
}
