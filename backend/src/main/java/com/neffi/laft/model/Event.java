package com.neffi.laft.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    private String id;
    private String trustId;
    private String type;
    private String title;
    private String description;
    private LocalDateTime date;
    private String startTime;
    private String endTime;
    private String location;
    private String participants;
    private String status;
    private List<Map<String, Object>> attachments;
    private boolean includeInReport;
    private String createdBy;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
