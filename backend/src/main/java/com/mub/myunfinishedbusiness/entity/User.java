package com.mub.myunfinishedbusiness.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "username"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(unique = true)
    private String email;

    @Column(name = "display_name", nullable = true, length = 100)
    private String displayName;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "bio", length = 255)
    private String bio;

    @Column(name = "capture_button_name", length = 50)
    private String captureButtonName;

    @Column(name = "custom_disciplines", columnDefinition = "TEXT")
    private String customDisciplines;

    @Column(name = "avatar", columnDefinition = "bytea")
    private byte[] avatar;

    @Column(name = "avatar_content_type", length = 50)
    private String avatarContentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum Role {
        USER, ADMIN
    }
}
