package com.jobmatch.auth.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique=true)
    private String username;
    private String password;
    @ManyToMany(fetch = FetchType.EAGER)
    private List<AppRole> appRoles= new ArrayList<>();

}
