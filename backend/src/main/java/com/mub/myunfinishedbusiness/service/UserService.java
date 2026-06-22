package com.mub.myunfinishedbusiness.service;

import com.mub.myunfinishedbusiness.entity.User;
import com.mub.myunfinishedbusiness.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional
    public void updateAvatar(String username, MultipartFile file) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            user.setAvatar(file.getBytes());
            user.setAvatarContentType(file.getContentType());
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload avatar", e);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> getAvatar(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getAvatar() == null || user.getAvatarContentType() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, user.getAvatarContentType())
                .body(user.getAvatar());
    }
}
