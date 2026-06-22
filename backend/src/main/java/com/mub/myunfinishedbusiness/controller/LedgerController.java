package com.mub.myunfinishedbusiness.controller;

import com.mub.myunfinishedbusiness.dto.DailyLedgerRequest;
import com.mub.myunfinishedbusiness.dto.DailyLedgerResponse;
import com.mub.myunfinishedbusiness.service.LedgerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    @GetMapping
    public ResponseEntity<List<DailyLedgerResponse>> getAll() {
        return ResponseEntity.ok(ledgerService.getAllEntries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DailyLedgerResponse> getOne(@PathVariable UUID id) {
        return ResponseEntity.ok(ledgerService.getEntry(id));
    }

    @PostMapping
    public ResponseEntity<DailyLedgerResponse> create(
        @Valid @RequestBody DailyLedgerRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ledgerService.createEntry(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DailyLedgerResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody DailyLedgerRequest request
    ) {
        return ResponseEntity.ok(ledgerService.updateEntry(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ledgerService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}
