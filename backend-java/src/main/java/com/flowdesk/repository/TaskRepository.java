package com.flowdesk.repository;

import com.flowdesk.entity.Priority;
import com.flowdesk.entity.Project;
import com.flowdesk.entity.Status;
import com.flowdesk.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String>, JpaSpecificationExecutor<Task> {

    List<Task> findByUserId(String userId);

    Optional<Task> findByIdAndUserId(String id, String userId);

    List<Task> findByProjectIdAndUserId(String projectId, String userId);

    long countByUserId(String userId);

    long countByUserIdAndStatus(String userId, Status status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.status != 'COMPLETED' AND t.deadline < :today")
    long countOverdueTasks(@Param("userId") String userId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.deadline = :today")
    long countTodayTasks(@Param("userId") String userId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.priority = :priority")
    long countByUserIdAndPriority(@Param("userId") String userId, @Param("priority") Priority priority);
}
