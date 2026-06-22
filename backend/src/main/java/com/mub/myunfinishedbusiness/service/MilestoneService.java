package com.mub.myunfinishedbusiness.service;

import com.mub.myunfinishedbusiness.dto.MilestoneDto;
import com.mub.myunfinishedbusiness.dto.MilestoneRequest;
import com.mub.myunfinishedbusiness.entity.Milestone;
import com.mub.myunfinishedbusiness.entity.User;
import com.mub.myunfinishedbusiness.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.mub.myunfinishedbusiness.repository.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final UserRepository userRepository;

    public List<MilestoneDto> getMilestonesByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return milestoneRepository.findByUserOrderByTargetDateAsc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MilestoneDto createMilestone(String username, MilestoneRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Milestone milestone = Milestone.builder()
                .user(user)
                .title(request.getTitle())
                .targetDate(request.getTargetDate())
                .isCompleted(request.isCompleted())
                .build();
        
        Milestone saved = milestoneRepository.save(milestone);
        return mapToDto(saved);
    }

    public MilestoneDto updateMilestone(String username, UUID id, MilestoneRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Milestone not found"));

        if (!milestone.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Milestone not found"); // Avoid 403 leaks
        }

        milestone.setTitle(request.getTitle());
        milestone.setTargetDate(request.getTargetDate());
        milestone.setCompleted(request.isCompleted());

        Milestone updated = milestoneRepository.save(milestone);
        return mapToDto(updated);
    }

    public void deleteMilestone(String username, UUID id) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Milestone not found"));

        if (!milestone.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Milestone not found");
        }

        milestoneRepository.delete(milestone);
    }

    private MilestoneDto mapToDto(Milestone milestone) {
        return MilestoneDto.builder()
                .id(milestone.getId().toString())
                .title(milestone.getTitle())
                .targetDate(milestone.getTargetDate())
                .isCompleted(milestone.isCompleted())
                .createdAt(milestone.getCreatedAt())
                .build();
    }
}
