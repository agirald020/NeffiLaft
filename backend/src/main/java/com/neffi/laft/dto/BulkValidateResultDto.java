package com.neffi.laft.dto;

import com.neffi.laft.model.RestrictiveListEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
