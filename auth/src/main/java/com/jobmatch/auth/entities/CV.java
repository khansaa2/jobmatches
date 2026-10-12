package com.jobmatch.auth.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import lombok.Data;
@Entity
@Data
@Table(name = "CV")
public class CV {
    @Id
    @GeneratedValue
    private Long id;

    private String fileName;

    @Column(length = 10000)
    private String content;

    private LocalDateTime uploadedAt;

    @ManyToOne
    private AppUser user;

}
