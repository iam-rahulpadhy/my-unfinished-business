package com.mub.myunfinishedbusiness.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class MilestoneDto {
    private String id;
    private String title;
    private LocalDate targetDate;
    private boolean isCompleted;
    private LocalDateTime createdAt;
}
