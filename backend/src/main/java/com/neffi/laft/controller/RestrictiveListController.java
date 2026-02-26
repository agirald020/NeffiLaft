package com.neffi.laft.controller;

import com.neffi.laft.dto.BulkValidateResultDto;
import com.neffi.laft.dto.ValidateClientDto;
import com.neffi.laft.model.RestrictiveListEntry;
import com.neffi.laft.service.RestrictiveListService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
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

    @GetMapping("/bulk/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try (Workbook workbook = restrictiveListService.generateBulkTemplate();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.write(out);
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=plantilla_validacion_listas.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(out.toByteArray());
        } catch (Exception e) {
            log.error("Error generando plantilla", e);
            return ResponseEntity.internalServerError().build();
        }
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
