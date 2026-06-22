package com.mub.myunfinishedbusiness.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(max = 100, message = "Display name cannot exceed 100 characters")
    private String displayName;

    @Size(max = 255, message = "Bio cannot exceed 255 characters")
    private String bio;

    @Size(max = 50, message = "Button name cannot exceed 50 characters")
    private String captureButtonName;

    private String customDisciplines;
}
