package com.mub.myunfinishedbusiness.dto;

import com.mub.myunfinishedbusiness.entity.DailyLedger;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DailyLedgerResponse {

    private UUID id;
    private LocalDate entryDate;
    private BigDecimal closingPrice;
    private BigDecimal percentageChange;
    private String summaryText;
    private String completedDisciplines;
    private String tags;
    private LocalDateTime createdAt;

    public static DailyLedgerResponse from(DailyLedger entity) {
        return DailyLedgerResponse.builder()
            .id(entity.getId())
            .entryDate(entity.getEntryDate())
            .closingPrice(entity.getClosingPrice())
            .percentageChange(entity.getPercentageChange())
            .summaryText(entity.getSummaryText())
            .completedDisciplines(entity.getCompletedDisciplines())
            .tags(entity.getTags())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
