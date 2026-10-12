package com.jobmatch.auth.entities;
import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppRole {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique=true)
    private String roleName;

    @ManyToMany(mappedBy = "appRoles")
    private List<AppUser> appUsers;


}
