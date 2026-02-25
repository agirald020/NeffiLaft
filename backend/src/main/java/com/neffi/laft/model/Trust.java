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
public class Trust {
    private String id;
    private String code;
    private String name;
    private String fullName;
    private String status;
    private LocalDateTime constitutionDate;
    private LocalDateTime validity;
    private List<Map<String, Object>> trustors;
    private List<Map<String, Object>> beneficiaries;
    private Map<String, Object> fiduciary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
