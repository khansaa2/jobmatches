package com.jobmatch.auth.service;

import com.jobmatch.auth.dto.LoginRequest;
import com.jobmatch.auth.dto.RegisterRequest;
import com.jobmatch.auth.dto.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void validateToken(String token);
} 