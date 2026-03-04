package com.neffi.laft.controller;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.neffi.laft.dto.BulkValidateResultDto;
import com.neffi.laft.dto.RestrictiveListEntry;
import com.neffi.laft.dto.ValidateClientDto;
import com.neffi.laft.dto.ValidationReportRequestDto;
import com.neffi.laft.service.PdfReportService;
import com.neffi.laft.service.RestrictiveListService;
import com.neffi.laft.utils.JwtUtils;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/laft/validate")
@RequiredArgsConstructor
public class RestrictiveListController {

    private final RestrictiveListService restrictiveListService;
    private final PdfReportService pdfReportService;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${app.bypass-auth:false}")
    private boolean bypassAuth;

    /**
     * Valida un cliente contra las listas restrictivas ejecutando la función BUT_VALIDAR_LISTAS con los parámetros proporcionados.
     * @param dto
     * @param request
     * @return
     */
    @PostMapping
    public ResponseEntity<List<RestrictiveListEntry>> validateClient(
            @RequestBody ValidateClientDto dto, HttpServletRequest request) {
        String clientIp = jwtUtils.getClientIp(request);
        log.info("Peticion recibida desde IP: {} - Documento: {}, Nombre: {}", 
            clientIp, dto.getP_IDENTIFICACION(), dto.getP_NOMBRE_1());
        
        List<RestrictiveListEntry> results = restrictiveListService.validateClient(dto, request.getRequestURL().toString());
        return ResponseEntity.ok(results);
    }

    //Se usa
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
            // validateDto.setDocumentNumber(request.getDocumentNumber());
            // validateDto.setFullName(fullName);
            // List<RestrictiveListEntry> matches = restrictiveListService.validateClient(validateDto);

            byte[] pdf = pdfReportService.generateValidationReport(
                request.getDocumentNumber(),
                request.getPersonType(),
                fullName,
                userName,
                null
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
