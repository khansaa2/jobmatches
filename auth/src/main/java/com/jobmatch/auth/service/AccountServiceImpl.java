package com.jobmatch.auth.service;

import com.jobmatch.auth.entities.AppRole;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.repository.AppRoleRepository;
import com.jobmatch.auth.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountServiceImpl implements AccountService {
    private final AppUserRepository appUserRepository;
    private final AppRoleRepository appRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountServiceImpl(AppUserRepository appUserRepository, 
                            AppRoleRepository appRoleRepository,
                            PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.appRoleRepository = appRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AppUser addUser(AppUser appUser) {
        appUser.setPassword(passwordEncoder.encode(appUser.getPassword()));
        return appUserRepository.save(appUser);
    }

    @Override
    public AppRole addRole(AppRole appRole) {
        return appRoleRepository.save(appRole);
    }

    @Override
    public void addRoleToUser(String username, String rolename) {
        AppUser appUser = appUserRepository.findByUsername(username);
        AppRole appRole = appRoleRepository.findByRoleName(rolename);
        appUser.getAppRoles().add(appRole);
        appUserRepository.save(appUser);
    }

    @Override
    public AppUser loadUserByUsername(String username) {
        return appUserRepository.findByUsername(username);
    }

    @Override
    public List<AppUser> listUsers() {
        return appUserRepository.findAll();
    }

    @Override
    public AppRole findRoleByName(String roleName) {
        return appRoleRepository.findByRoleName(roleName);
    }
}
