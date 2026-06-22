package com.mub.myunfinishedbusiness.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateDisplayNameRequest {
    @Size(max = 100, message = "Display name cannot exceed 100 characters")
    private String displayName;
}
