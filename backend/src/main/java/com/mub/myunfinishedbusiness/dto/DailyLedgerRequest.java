package com.mub.myunfinishedbusiness.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DailyLedgerRequest {

    @NotNull(message = "Entry date is required")
    private LocalDate entryDate;

    @NotNull(message = "Closing price is required")
    @DecimalMin(value = "0.01", message = "Closing price must be positive")
    @Digits(integer = 8, fraction = 2, message = "Invalid price format")
    private BigDecimal closingPrice;

    @NotBlank(message = "Summary text is required")
    @Size(max = 5000, message = "Summary must be under 5000 characters")
    private String summaryText;

    private String completedDisciplines;

    private String tags;
}
