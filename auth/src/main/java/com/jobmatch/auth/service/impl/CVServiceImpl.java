package com.jobmatch.auth.service.impl;

import com.jobmatch.auth.entities.CV;
import com.jobmatch.auth.entities.AppUser;
import com.jobmatch.auth.repository.CVRepository;
import com.jobmatch.auth.service.CVService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
public class CVServiceImpl implements CVService {
    private final CVRepository cvRepository;

    public CVServiceImpl(CVRepository cvRepository) {
        this.cvRepository = cvRepository;
    }

    @Override
    public CV saveCV(MultipartFile file, AppUser user) {
        CV cv = new CV();
        cv.setUser(user);
        cv.setFileName(file.getOriginalFilename());
        cv.setUploadedAt(java.time.LocalDateTime.now());
        // Optionally: save file content if needed
        return cvRepository.save(cv);
    }

    @Override
    public List<CV> getUserCVs(AppUser user) {
        return cvRepository.findByUserId(user.getId());
    }

    @Override
    public CV getCV(Long id) {
        return cvRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CV not found"));
    }

    @Override
    public void deleteCV(Long id) {
        cvRepository.deleteById(id);
    }
} 