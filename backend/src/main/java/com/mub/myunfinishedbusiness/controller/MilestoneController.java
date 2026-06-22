package com.mub.myunfinishedbusiness.controller;

import com.mub.myunfinishedbusiness.dto.MilestoneDto;
import com.mub.myunfinishedbusiness.dto.MilestoneRequest;
import org.springframework.security.core.userdetails.UserDetails;
import com.mub.myunfinishedbusiness.service.MilestoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping
    public ResponseEntity<List<MilestoneDto>> getMilestones(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(milestoneService.getMilestonesByUsername(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<MilestoneDto> createMilestone(@AuthenticationPrincipal UserDetails userDetails,
                                                        @Valid @RequestBody MilestoneRequest request) {
        MilestoneDto created = milestoneService.createMilestone(userDetails.getUsername(), request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MilestoneDto> updateMilestone(@AuthenticationPrincipal UserDetails userDetails,
                                                        @PathVariable UUID id,
                                                        @Valid @RequestBody MilestoneRequest request) {
        return ResponseEntity.ok(milestoneService.updateMilestone(userDetails.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMilestone(@AuthenticationPrincipal UserDetails userDetails,
                                                @PathVariable UUID id) {
        milestoneService.deleteMilestone(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
