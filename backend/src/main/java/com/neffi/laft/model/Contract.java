package com.neffi.laft.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contract {
    private String id;
    private String trustId;
    private String purpose;
    private String obligations;
    private String remuneration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
