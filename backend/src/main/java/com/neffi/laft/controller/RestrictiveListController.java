package com.neffi.laft.controller;

import com.neffi.laft.dto.BulkValidateResultDto;
import com.neffi.laft.dto.ValidateClientDto;
import com.neffi.laft.dto.ValidationReportRequestDto;
import com.neffi.laft.model.RestrictiveListEntry;
import com.neffi.laft.service.PdfReportService;
import com.neffi.laft.service.RestrictiveListService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
    private final PdfReportService pdfReportService;

    @Value("${app.bypass-auth:false}")
    private boolean bypassAuth;

    @PostMapping
    public ResponseEntity<List<RestrictiveListEntry>> validateClient(
            @RequestBody ValidateClientDto dto) {
        List<RestrictiveListEntry> results = restrictiveListService.validateClient(dto);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/report")
    public ResponseEntity<byte[]> generateReport(
            @RequestBody ValidationReportRequestDto request,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String userName = "Usuario del sistema";
            if (bypassAuth || jwt == null) {
                userName = "Usuario de Desarrollo";
            } else if (jwt.getClaimAsString("name") != null) {
                userName = jwt.getClaimAsString("name");
            } else if (jwt.getClaimAsString("preferred_username") != null) {
                userName = jwt.getClaimAsString("preferred_username");
            }

            String fullName = buildFullName(request);
            ValidateClientDto validateDto = new ValidateClientDto();
            validateDto.setDocumentNumber(request.getDocumentNumber());
            validateDto.setFullName(fullName);
            List<RestrictiveListEntry> matches = restrictiveListService.validateClient(validateDto);

            byte[] pdf = pdfReportService.generateValidationReport(
                request.getDocumentNumber(),
                request.getPersonType(),
                fullName,
                userName,
                matches
            );
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=informe_validacion_listas.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
        } catch (Exception e) {
            log.error("Error generando informe PDF", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private String buildFullName(ValidationReportRequestDto request) {
        if ("juridica".equalsIgnoreCase(request.getPersonType())) {
            return request.getBusinessName() != null ? request.getBusinessName().trim() : "";
        }
        StringBuilder sb = new StringBuilder();
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) sb.append(request.getFirstName().trim());
        if (request.getSecondName() != null && !request.getSecondName().isBlank()) sb.append(" ").append(request.getSecondName().trim());
        if (request.getFirstLastName() != null && !request.getFirstLastName().isBlank()) sb.append(" ").append(request.getFirstLastName().trim());
        if (request.getSecondLastName() != null && !request.getSecondLastName().isBlank()) sb.append(" ").append(request.getSecondLastName().trim());
        return sb.toString().trim();
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
