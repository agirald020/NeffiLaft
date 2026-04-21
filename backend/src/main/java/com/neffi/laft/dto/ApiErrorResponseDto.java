package com.neffi.laft.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApiErrorResponseDto {
    private String message;
    private LocalDateTime timestamp;
    private List<BulkValidationRowErrorDto> errors;
}
