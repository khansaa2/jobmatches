package com.jobmatch.auth.service;

import com.jobmatch.auth.entities.AppRole;
import com.jobmatch.auth.entities.AppUser;

import java.util.List;

public interface AccountService {
    AppUser addUser(AppUser appUser);
    AppRole addRole(AppRole appRole);
    void addRoleToUser(String username, String rolename);
    AppUser loadUserByUsername(String username);
    List<AppUser> listUsers();
    AppRole findRoleByName(String roleName);
}
