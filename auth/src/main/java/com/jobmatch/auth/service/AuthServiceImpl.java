package com.jobmatch.auth.service;

import com.jobmatch.auth.dto.AuthResponse;
import com.jobmatch.auth.dto.LoginRequest;
import com.jobmatch.auth.dto.RegisterRequest;
import com.jobmatch.auth.entities.AppRole;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountService accountService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        // Create new user
        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user = accountService.addUser(user);

        // Add role to user
        accountService.addRoleToUser(request.getUsername(), request.getRole());

        // Generate token
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(request.getRole())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // Get user details
        AppUser user = accountService.loadUserByUsername(request.getUsername());
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        // Generate token
        String token = jwtService.generateToken(user);

        // Get user's role
        String role = user.getAppRoles().isEmpty() ? "USER" : 
                     user.getAppRoles().get(0).getRoleName();

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(role)
                .build();
    }

    @Override
    public void validateToken(String token) {
        jwtService.validateToken(token);
    }
} 