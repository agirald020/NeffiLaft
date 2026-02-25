package com.neffi.laft.controller;

import com.neffi.laft.dto.BulkValidateResultDto;
import com.neffi.laft.dto.ValidateClientDto;
import com.neffi.laft.model.RestrictiveListEntry;
import com.neffi.laft.service.RestrictiveListService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/laft/validate")
@RequiredArgsConstructor
public class RestrictiveListController {

    private final RestrictiveListService restrictiveListService;

    @PostMapping
    public ResponseEntity<List<RestrictiveListEntry>> validateClient(
            @RequestBody ValidateClientDto dto) {
        List<RestrictiveListEntry> results = restrictiveListService.validateClient(dto);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> validateBulk(@RequestParam("file") MultipartFile file) {
        try {
            List<BulkValidateResultDto> results = restrictiveListService.validateBulk(file);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error procesando archivo Excel", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error procesando el archivo: " + e.getMessage())
            );
        }
    }
}
