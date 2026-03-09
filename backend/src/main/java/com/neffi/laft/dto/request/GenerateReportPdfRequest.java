package com.neffi.laft.dto.request;

import java.util.List;

import com.neffi.laft.dto.RestrictiveListEntry;
import com.neffi.laft.dto.ValidateClientDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class GenerateReportPdfRequest {
    private ValidateClientDto clientInfo;
    private List<RestrictiveListEntry> data;
}