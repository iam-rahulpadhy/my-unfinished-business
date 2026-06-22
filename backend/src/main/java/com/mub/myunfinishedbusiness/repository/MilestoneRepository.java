package com.mub.myunfinishedbusiness.repository;

import com.mub.myunfinishedbusiness.entity.Milestone;
import com.mub.myunfinishedbusiness.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, UUID> {
    List<Milestone> findByUserOrderByTargetDateAsc(User user);
}
