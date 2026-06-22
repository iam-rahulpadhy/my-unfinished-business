package com.mub.myunfinishedbusiness.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class StockSummaryResponse {
    private BigDecimal currentPrice;
    private BigDecimal dailyChange;
    private BigDecimal dailyChangePercent;
    private BigDecimal sevenDaySma;
    private BigDecimal allTimeHigh;
    private BigDecimal allTimeLow;
    private long totalEntries;
}
