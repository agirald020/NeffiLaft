package com.neffi.laft.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BulkValidationRowErrorDto {
    private int rowNumber;
    private List<BulkErrorDto> errors;
}
