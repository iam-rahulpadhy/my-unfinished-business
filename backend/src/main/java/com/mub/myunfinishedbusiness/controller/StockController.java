package com.mub.myunfinishedbusiness.controller;

import com.mub.myunfinishedbusiness.dto.DailyLedgerResponse;
import com.mub.myunfinishedbusiness.dto.StockSummaryResponse;
import com.mub.myunfinishedbusiness.service.LedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final LedgerService ledgerService;

    /**
     * Returns current price, daily % change, 7-day SMA, ATH, ATL, total entries.
     * Used by the trading terminal top bar.
     */
    @GetMapping("/summary")
    public ResponseEntity<StockSummaryResponse> getSummary() {
        return ResponseEntity.ok(ledgerService.getStockSummary());
    }

    /**
     * Returns time-series chart data filtered by range: 1W | 1M | ALL
     * Used by the TradingView chart component.
     */
    @GetMapping("/chart")
    public ResponseEntity<List<DailyLedgerResponse>> getChartData(
        @RequestParam(defaultValue = "ALL") String range
    ) {
        return ResponseEntity.ok(ledgerService.getChartData(range));
    }
}
