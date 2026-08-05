package com.flowdesk.repository;

import com.flowdesk.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    List<Project> findByUserIdAndIsArchived(String userId, boolean isArchived);
    List<Project> findByUserId(String userId);
    Optional<Project> findByIdAndUserId(String id, String userId);
}
