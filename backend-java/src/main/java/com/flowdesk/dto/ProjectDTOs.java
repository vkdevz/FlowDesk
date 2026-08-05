package com.flowdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

public class ProjectDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectRequest {
        @NotBlank(message = "Project name is required")
        @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
        private String name;

        private String description;
        private String category;
        private String color;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectResponse {
        private String id;
        private String name;
        private String description;
        private String category;
        private String color;
        private boolean isArchived;
        private int taskCount;
        private int completedTaskCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
