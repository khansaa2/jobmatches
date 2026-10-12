package com.jobmatch.auth.security;

import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.repository.AppUserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AppUserRepository appUserRepository;

    public CustomUserDetailsService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser appUser = appUserRepository.findByUsername(username);
        if (appUser == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return new User(
                appUser.getUsername(),
                appUser.getPassword(),
                appUser.getAppRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getRoleName()))
                        .collect(Collectors.toList())
        );
    }
} 