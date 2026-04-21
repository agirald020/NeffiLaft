package com.neffi.laft.exception;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.neffi.laft.dto.ApiErrorResponseDto;
import com.neffi.laft.exception.custom.ExceptionBulkValidation;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ExceptionBulkValidation.class)
    public ResponseEntity<ApiErrorResponseDto> handleExceptionCustom(ExceptionBulkValidation ex) {
        ApiErrorResponseDto response = ApiErrorResponseDto.builder()
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .errors(ex.getErrors())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponseDto> handleIllegalArgumentException(IllegalArgumentException ex) {
        ApiErrorResponseDto response = ApiErrorResponseDto.builder()
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .errors(List.of())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponseDto> handleGenericException(Exception ex) {
        log.error("Error no controlado", ex);

        ApiErrorResponseDto response = ApiErrorResponseDto.builder()
                .message("Ocurrió un error interno al procesar la solicitud.")
                .timestamp(LocalDateTime.now())
                .errors(List.of())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
