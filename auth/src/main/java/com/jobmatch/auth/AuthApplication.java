package com.jobmatch.auth;

import com.jobmatch.auth.entities.AppRole;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.service.AccountService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.ArrayList;

@SpringBootApplication
public class AuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }

    @Bean
    CommandLineRunner start(AccountService accountService) {
        return args -> {
            if (accountService.findRoleByName("ADMIN") == null) {
                accountService.addRole(new AppRole(null, "ADMIN", new ArrayList<>()));
            }
            if (accountService.findRoleByName("USER") == null) {
                accountService.addRole(new AppRole(null, "USER", new ArrayList<>()));
            }
        };
    }

}
