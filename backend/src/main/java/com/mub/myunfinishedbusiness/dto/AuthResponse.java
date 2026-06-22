package com.mub.myunfinishedbusiness.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String displayName;
    private String bio;
    private String quotation;
    private String captureButtonName;
    private String customDisciplines;
    private String role;
}
