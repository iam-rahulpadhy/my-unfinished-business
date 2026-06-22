package com.mub.myunfinishedbusiness.service;

import com.mub.myunfinishedbusiness.dto.AuthRequest;
import com.mub.myunfinishedbusiness.dto.AuthResponse;
import com.mub.myunfinishedbusiness.dto.ForgotPasswordRequest;
import com.mub.myunfinishedbusiness.dto.ResetPasswordRequest;
import com.mub.myunfinishedbusiness.dto.UpdateProfileRequest;
import com.mub.myunfinishedbusiness.entity.PasswordResetToken;
import com.mub.myunfinishedbusiness.entity.User;
import com.mub.myunfinishedbusiness.repository.PasswordResetTokenRepository;
import com.mub.myunfinishedbusiness.repository.UserRepository;
import com.mub.myunfinishedbusiness.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException(
                "Username '" + request.getUsername() + "' is already taken."
            );
        }

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .displayName(request.getDisplayName() != null && !request.getDisplayName().trim().isEmpty() ? request.getDisplayName().trim() : request.getUsername())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role(User.Role.USER)
            .build();

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getUsername());
        return AuthResponse.builder()
            .token(token)
            .username(user.getUsername())
            .displayName(user.getDisplayName())
            .bio(user.getBio())
            .captureButtonName(user.getCaptureButtonName())
            .customDisciplines(user.getCustomDisciplines())
            .role(user.getRole().name())
            .build();
    }

    public AuthResponse login(AuthRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword()
            )
        );

        String token = tokenProvider.generateToken(auth);

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow();

        return AuthResponse.builder()
            .token(token)
            .username(user.getUsername())
            .displayName(user.getDisplayName())
            .bio(user.getBio())
            .captureButtonName(user.getCaptureButtonName())
            .customDisciplines(user.getCustomDisciplines())
            .role(user.getRole().name())
            .build();
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("No account found with that email address."));

        // Delete any existing unused tokens for this user and flush immediately to avoid unique constraint violations
        tokenRepository.findByUser(user).ifPresent(existingToken -> {
            tokenRepository.delete(existingToken);
            tokenRepository.flush();
        });

        // Generate 6-digit code
        String tokenStr = String.format("%06d", new Random().nextInt(999999));

        PasswordResetToken token = PasswordResetToken.builder()
            .token(tokenStr)
            .user(user)
            .expiryDate(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // 15 mins expiry
            .build();

        tokenRepository.save(token);

        // Send Email
        emailService.sendPasswordResetToken(user.getEmail(), tokenStr);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token."));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Reset token has expired.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Delete token after successful reset
        tokenRepository.delete(resetToken);
    }

    @Transactional
    public AuthResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName().trim().isEmpty() ? null : request.getDisplayName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim().isEmpty() ? null : request.getBio().trim());
        }
        if (request.getCaptureButtonName() != null) {
            user.setCaptureButtonName(request.getCaptureButtonName().trim().isEmpty() ? null : request.getCaptureButtonName().trim());
        }
        if (request.getCustomDisciplines() != null) {
            user.setCustomDisciplines(request.getCustomDisciplines().trim().isEmpty() ? null : request.getCustomDisciplines().trim());
        }
        
        userRepository.save(user);

        return AuthResponse.builder()
            .token(tokenProvider.generateToken(user.getUsername()))
            .username(user.getUsername())
            .displayName(user.getDisplayName())
            .bio(user.getBio())
            .captureButtonName(user.getCaptureButtonName())
            .customDisciplines(user.getCustomDisciplines())
            .role(user.getRole().name())
            .build();
    }
}
