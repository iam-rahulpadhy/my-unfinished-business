package com.mub.myunfinishedbusiness.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MilestoneRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Target date is required")
    private LocalDate targetDate;
    
    private boolean isCompleted;
}
