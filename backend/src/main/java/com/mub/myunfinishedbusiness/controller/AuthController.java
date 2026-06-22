package com.mub.myunfinishedbusiness.controller;

import com.mub.myunfinishedbusiness.dto.AuthRequest;
import com.mub.myunfinishedbusiness.dto.AuthResponse;
import com.mub.myunfinishedbusiness.dto.ForgotPasswordRequest;
import com.mub.myunfinishedbusiness.dto.ResetPasswordRequest;
import com.mub.myunfinishedbusiness.dto.UpdateProfileRequest;
import com.mub.myunfinishedbusiness.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok("If that email is registered, a password reset code has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password reset successful.");
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(authService.updateProfile(userDetails.getUsername(), request));
    }
}
