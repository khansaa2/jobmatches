package com.jobmatch.auth.service;

import com.jobmatch.auth.entities.CV;
import com.jobmatch.auth.entities.AppUser;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface CVService {
    CV saveCV(MultipartFile file, AppUser user);
    List<CV> getUserCVs(AppUser user);
    CV getCV(Long id);
    void deleteCV(Long id);
} 