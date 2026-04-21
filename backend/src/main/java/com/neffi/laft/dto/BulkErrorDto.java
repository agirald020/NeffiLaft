package com.neffi.laft.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BulkErrorDto {
    private String value;
    private String message;
}
