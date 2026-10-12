package com.jobmatch.auth.repository;

import com.jobmatch.auth.entities.JobOffer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    @Query("SELECT DISTINCT j FROM JobOffer j WHERE " +
           "LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.jobDescription) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<JobOffer> findByJobTitleContainingOrCompanyNameContainingOrJobDescriptionContaining(
            @Param("search") String search, Pageable pageable);

    Page<JobOffer> findByCityContainingOrStateContainingOrCountryContaining(
            String city, String state, String country, Pageable pageable);

    Page<JobOffer> findByEmploymentType(String employmentType, Pageable pageable);

    @Query("SELECT j FROM JobOffer j WHERE j.salaryRangeMin >= :minSalary AND j.salaryRangeMax <= :maxSalary")
    Page<JobOffer> findBySalaryRange(@Param("minSalary") double minSalary, @Param("maxSalary") double maxSalary, Pageable pageable);

    List<JobOffer> findTop10ByOrderByJobPostingDateDesc();

    @Query("SELECT j FROM JobOffer j WHERE " +
           "LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :title, '%')) OR " +
           "LOWER(:title) LIKE LOWER(CONCAT('%', j.jobTitle, '%'))")
    List<JobOffer> findMatchingJobOffers(@Param("title") String title);
}
