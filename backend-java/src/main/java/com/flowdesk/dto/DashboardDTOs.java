package com.flowdesk.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTOs {
    private long totalProjects;
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long overdueTasks;
    private long todayTasks;
    private int completionRate;
    private Map<String, Long> priorityBreakdown;
    private Map<String, Long> statusBreakdown;
}
