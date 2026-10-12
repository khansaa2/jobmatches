package com.jobmatch.auth.controller;

import com.jobmatch.auth.entities.CV;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.service.AccountService;
import com.jobmatch.auth.service.CVService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/cvs")
@CrossOrigin("*")
public class CVController {

    private final CVService cvService;
    private final AccountService accountService;

    public CVController(CVService cvService, AccountService accountService) {
        this.cvService = cvService;
        this.accountService = accountService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadCV(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        AppUser user = accountService.loadUserByUsername(authentication.getName());
        CV cv = cvService.saveCV(file, user);
        return ResponseEntity.ok(cv);
    }

    @GetMapping
    public ResponseEntity<List<CV>> getUserCVs(Authentication authentication) {
        AppUser user = accountService.loadUserByUsername(authentication.getName());
        List<CV> cvs = cvService.getUserCVs(user);
        return ResponseEntity.ok(cvs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CV> getCV(@PathVariable Long id) {
        CV cv = cvService.getCV(id);
        return ResponseEntity.ok(cv);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCV(@PathVariable Long id) {
        cvService.deleteCV(id);
        return ResponseEntity.ok().build();
    }
} 