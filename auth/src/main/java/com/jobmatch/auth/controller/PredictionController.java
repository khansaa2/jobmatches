package com.jobmatch.auth.controller;

import com.jobmatch.auth.entities.Prediction;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.service.AccountService;
import com.jobmatch.auth.service.PredictionService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@CrossOrigin("*")
public class PredictionController {

    private final PredictionService predictionService;
    private final AccountService accountService;

    public PredictionController(PredictionService predictionService, AccountService accountService) {
        this.predictionService = predictionService;
        this.accountService = accountService;
    }

    @PostMapping("/{jobOfferId}")
    public ResponseEntity<Prediction> generatePrediction(
            @PathVariable Long jobOfferId,
            Authentication authentication) {
        AppUser user = accountService.loadUserByUsername(authentication.getName());
        Prediction prediction = predictionService.generatePrediction(user, jobOfferId);
        return ResponseEntity.ok(prediction);
    }

    @GetMapping
    public ResponseEntity<List<Prediction>> getUserPredictions(Authentication authentication) {
        AppUser user = accountService.loadUserByUsername(authentication.getName());
        List<Prediction> predictions = predictionService.getUserPredictions(user);
        return ResponseEntity.ok(predictions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prediction> getPrediction(@PathVariable Long id) {
        Prediction prediction = predictionService.getPrediction(id);
        return ResponseEntity.ok(prediction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePrediction(@PathVariable Long id) {
        predictionService.deletePrediction(id);
        return ResponseEntity.ok().build();
    }
} 