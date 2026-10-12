package com.jobmatch.auth.controller;

import com.jobmatch.auth.dto.PredictionWithRecommendationsDTO;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.service.AccountService;
import com.jobmatch.auth.service.PredictionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserPredictionController {
    private final PredictionService predictionService;
    private final AccountService accountService;

    public UserPredictionController(PredictionService predictionService, AccountService accountService) {
        this.predictionService = predictionService;
        this.accountService = accountService;
    }

    @GetMapping("/predictions-with-recommendations")
    public List<PredictionWithRecommendationsDTO> getPredictionsWithRecommendations(Authentication authentication) {
        AppUser user = accountService.loadUserByUsername(authentication.getName());
        return predictionService.getPredictionsWithRecommendations(user);
    }
} 