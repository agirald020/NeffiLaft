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
import com.neffi.laft.dto.TiposDocumentosDTO;
import com.neffi.laft.dto.ValidateClientDto;
import com.neffi.laft.dto.request.GenerateReportPdfRequest;
import com.neffi.laft.service.PdfReportService;
import com.neffi.laft.service.RestrictiveListService;
import com.neffi.laft.service.TiposDocumentosService;
import com.neffi.laft.utils.Utils;

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
    private final TiposDocumentosService tiposDocumentosService;

    @Autowired
    private Utils utils;

    @Value("${app.bypass-auth:false}")
    private boolean bypassAuth;

    /**
     * Valida un cliente contra las listas restrictivas ejecutando la función
     * BUT_VALIDAR_LISTAS con los parámetros proporcionados.
     * 
     * @param dto
     * @param request
     * @return
     */
    @PostMapping
    public ResponseEntity<List<RestrictiveListEntry>> validateClient(
            @RequestBody ValidateClientDto dto, HttpServletRequest request) {
        String clientIp = utils.getClientIp(request);
        log.info("Peticion recibida desde IP: {} - Documento: {}, Nombre: {}",
                clientIp, dto.getP_IDENTIFICACION(), dto.getP_NOMBRE_1());

        List<RestrictiveListEntry> results = restrictiveListService.validateClient(dto,
                request.getRequestURL().toString());
        return ResponseEntity.ok(results);
    }

    /**
     * Genera un informe PDF con los resultados de la validación contra las listas
     * restrictivas.
     * 
     * @param request
     * @param jwt
     * @return
     */
    @PostMapping("/report/pdf")
    public ResponseEntity<byte[]> generateReport(
            @RequestBody List<RestrictiveListEntry> data,
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

            TiposDocumentosDTO tiposDocumentos = tiposDocumentosService
                    .getTiposDocumentosByCodHomologa(data.get(0).getTipoDocumento());

            byte[] pdf = pdfReportService.generateValidationReport(
                    data.get(0).getIdentificacion(),
                    tiposDocumentos.getDescripcion(),
                    data.get(0).getSdnName(),
                    userName,
                    data);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=informe_validacion_listas.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            log.error("Error generando informe PDF", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/bulk/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try (Workbook workbook = restrictiveListService.generateBulkTemplate();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.write(out);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=plantilla_validacion_listas.xlsx")
                    .contentType(MediaType
                            .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(out.toByteArray());
        } catch (Exception e) {
            log.error("Error generando plantilla", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> validateBulk(@RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        try {
            String clientIp = utils.getClientIp(request);
            List<BulkValidateResultDto> results = restrictiveListService.validateBulk(file, clientIp);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error procesando archivo Excel", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Genera un informe Excel con los resultados de la validación masiva contra
     * listas restrictivas.
     * Procesa el archivo Excel proporcionado y retorna un Excel con los resultados
     * en dos hojas:
     * una con el resumen de coincidencias y otra con los detalles de las
     * coincidencias encontradas.
     * 
     * @param file    archivo Excel con los datos a validar
     * @param request la solicitud HTTP
     * @return archivo Excel con los resultados de la validación
     */
    @PostMapping("/report/excel")
    public ResponseEntity<byte[]> generateBulkReportExcel(@RequestBody List<BulkValidateResultDto> data,
            HttpServletRequest request) {
        try {
            String clientIp = utils.getClientIp(request);
            log.info("Generando reporte Excel masivo desde IP: {}", clientIp);

            // Generar Excel con resultados
            try (Workbook workbook = restrictiveListService.generateBulkReportExcel(data);
                    ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                workbook.write(out);

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=informe_validacion_listas_masivo.xlsx")
                        .contentType(MediaType
                                .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                        .body(out.toByteArray());
            }
        } catch (Exception e) {
            log.error("Error generando reporte Excel masivo", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
