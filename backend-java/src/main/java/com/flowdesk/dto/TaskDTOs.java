package com.flowdesk.dto;

import com.flowdesk.entity.Priority;
import com.flowdesk.entity.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class TaskDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubtaskDTO {
        private String id;
        private String title;
        private boolean completed;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskRequest {
        @NotBlank(message = "Task title is required")
        private String title;

        private String description;

        @NotNull(message = "Priority is required")
        private Priority priority;

        @NotNull(message = "Status is required")
        private Status status;

        @NotNull(message = "Deadline is required")
        private LocalDate deadline;

        @NotBlank(message = "Project ID is required")
        private String projectId;

        private List<SubtaskDTO> subtasks;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TaskResponse {
        private String id;
        private String title;
        private String description;
        private Priority priority;
        private Status status;
        private LocalDate deadline;
        private String projectId;
        private String projectName;
        private String projectColor;
        private List<SubtaskDTO> subtasks;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
