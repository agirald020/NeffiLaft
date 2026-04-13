package com.neffi.laft.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkValidateResultDto {
    private String queryDocumentNumber;
    private String queryFullName;
    private int matchCount;
    private List<RestrictiveListEntry> matches;
}
