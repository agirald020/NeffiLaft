package com.neffi.laft.exception.custom;

import java.util.List;

import com.neffi.laft.dto.BulkValidationRowErrorDto;

import lombok.Getter;

@Getter
public class ExceptionBulkValidation extends RuntimeException {
    private final List<BulkValidationRowErrorDto> errors;

    public ExceptionBulkValidation(String message, List<BulkValidationRowErrorDto> errors) {
        super(message);
        this.errors = errors;
    }
}
