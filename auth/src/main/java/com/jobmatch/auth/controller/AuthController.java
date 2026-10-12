package com.jobmatch.auth.controller;

import com.jobmatch.auth.dto.AuthResponse;
import com.jobmatch.auth.dto.LoginRequest;
import com.jobmatch.auth.dto.RegisterRequest;
import com.jobmatch.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/validate")
    public ResponseEntity<Void> validateToken(@RequestHeader("Authorization") String token) {
        authService.validateToken(token.substring(7)); // Remove "Bearer " prefix
        return ResponseEntity.ok().build();
    }
} 