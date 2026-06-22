package com.mub.myunfinishedbusiness.controller;

import com.mub.myunfinishedbusiness.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadAvatar(Authentication authentication, @RequestParam("file") MultipartFile file) {
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        userService.updateAvatar(username, file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{username}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable String username) {
        return userService.getAvatar(username);
    }
}
