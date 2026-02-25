package com.neffi.laft.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestrictiveListEntry {
    private String id;
    private String documentType;
    private String documentNumber;
    private String fullName;
    private String listName;
    private String listSource;
    private String matchType;
    private double matchScore;
}
