package com.neffi.laft.service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.neffi.laft.dto.BulkValidateResultDto;
import com.neffi.laft.dto.ButValidarListasParams;
import com.neffi.laft.dto.RestrictiveListEntry;
import com.neffi.laft.dto.TiposDocumentosDTO;
import com.neffi.laft.dto.ValidateClientDto;
import com.neffi.laft.model.TiposDocumentos;
import com.neffi.laft.repository.RestrictiveListRepository;
import com.neffi.laft.utils.Utils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestrictiveListService {

    @Value("${app.restrictiveList.validationProcessName}")
    private String proceso;

    @Value("${app.restrictiveList.validationEventDescription}")
    private String descripcionEvento;

    private final RestrictiveListRepository restrictiveListRepository;

    private final TiposDocumentosService tiposDocumentosService;

    private final Utils utils;

    /**
     * Valida un cliente contra las listas restrictivas ejecutando la función
     * BUT_VALIDAR_LISTAS con los parámetros proporcionados.
     * 
     * @param dto
     * @param requestUrl
     * @return
     */
    public List<RestrictiveListEntry> validateClient(ValidateClientDto dto, String requestUrl) {
        log.info("Validando cliente - Documento: {}, Nombre: {}",
                dto.getP_IDENTIFICACION(), dto.getP_NOMBRE_1());

        ButValidarListasParams params = new ButValidarListasParams(
                dto.getP_IDENTIFICACION(),
                dto.getP_NOMBRE_1(),
                dto.getP_NOMBRE_2(),
                dto.getP_APELLIDO_1(),
                dto.getP_APELLIDO_2(),
                proceso,
                null,
                utils.getCurrentUsername(),
                requestUrl,
                descripcionEvento);

        List<RestrictiveListEntry> results = restrictiveListRepository.butValidarListas(params);

        results.forEach(entry -> {
            if (entry.getTipoDocumento() != null) {
                try {
                    TiposDocumentosDTO tipoDoc = tiposDocumentosService.getTiposDocumentosById(Long.valueOf(entry.getTipoDocumento()));
                    entry.setTipoDocumento(tipoDoc.getCodHomologa());
                } catch (Exception e) {
                    log.warn("No se pudo obtener el nombre del tipo de documento para código: {}",
                            entry.getTipoDocumento(), e);
                }
            }
        });

        log.info("Encontradas {} coincidencias", results.size());
        return results;
    }

    public List<BulkValidateResultDto> validateBulk(MultipartFile file, String requestUrl) throws Exception {
        log.info("Validación masiva - archivo: {}", file.getOriginalFilename());
        List<BulkValidateResultDto> results = new ArrayList<>();

        try (InputStream is = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            int firstDataRow = 1;

            for (int i = firstDataRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                String docNumber = getCellString(row, 0);
                String primerNombre = getCellString(row, 1);
                String segundoNombre = getCellString(row, 2);
                String primerApellido = getCellString(row, 3);
                String segundoApellido = getCellString(row, 4);
                String razonSocial = getCellString(row, 5);

                String fullName;
                if (!razonSocial.isBlank()) {
                    fullName = razonSocial;
                } else {
                    fullName = String.join(" ",
                            java.util.Arrays.stream(
                                    new String[] { primerNombre, segundoNombre, primerApellido, segundoApellido })
                                    .filter(s -> !s.isBlank())
                                    .toArray(String[]::new));
                }

                if (docNumber.isBlank())
                    continue;

                ValidateClientDto dto = ValidateClientDto.builder()
                .p_IDENTIFICACION(docNumber)
                .p_NOMBRE_1(primerNombre)
                .p_NOMBRE_2(segundoNombre)
                .p_APELLIDO_1(primerApellido)
                .p_APELLIDO_2(segundoApellido)
                .build();

                List<RestrictiveListEntry> matches = validateClient(dto, requestUrl);

                results.add(BulkValidateResultDto.builder()
                        .queryDocumentNumber(docNumber)
                        .queryFullName(fullName)
                        .matchCount(matches.size())
                        .matches(matches)
                        .build());
            }
        }

        log.info("Validación masiva completada - {} registros procesados", results.size());
        return results;
    }

    public Workbook generateBulkTemplate() {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Plantilla");

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row header = sheet.createRow(0);
        String[] columns = {
                "Número de Documento", "Primer Nombre", "Segundo Nombre",
                "Primer Apellido", "Segundo Apellido", "Razón Social"
        };
        for (int i = 0; i < columns.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
            sheet.setColumnWidth(i, 5000);
        }

        return workbook;
    }

    /**
     * Genera un Workbook Excel con los resultados de la validación masiva.
     * Incluye dos hojas: Resumen con los datos principales y Detalles con todas las coincidencias.
     * 
     * @param results Lista de resultados de validateBulk
     * @return Workbook Excel con los resultados
     */
    public Workbook generateBulkReportExcel(List<BulkValidateResultDto> results) {
        log.debug("Generando reporte Excel para {} registros", results.size());
        Workbook workbook = new XSSFWorkbook();

        // Crear estilos
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle warningStyle = createWarningStyle(workbook);

        // Crear hoja de Resumen
        Sheet summarySheet = workbook.createSheet("Resumen");
        createSummarySheet(summarySheet, results, headerStyle, warningStyle);

        // Crear hoja de Detalles
        Sheet detailsSheet = workbook.createSheet("Detalles");
        createDetailsSheet(detailsSheet, results, headerStyle, warningStyle);

        return workbook;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle createWarningStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private void createSummarySheet(Sheet sheet, List<BulkValidateResultDto> results, 
            CellStyle headerStyle, CellStyle warningStyle) {
        // Headers
        Row headerRow = sheet.createRow(0);
        String[] headers = { "Número Documento", "Nombre Completo", "Coincidencias" };
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
            sheet.setColumnWidth(i, 5000);
        }

        // Datos
        int rowNum = 1;
        for (BulkValidateResultDto result : results) {
            Row row = sheet.createRow(rowNum++);
            
            Cell docCell = row.createCell(0);
            docCell.setCellValue(result.getQueryDocumentNumber());

            Cell nameCell = row.createCell(1);
            nameCell.setCellValue(result.getQueryFullName());

            Cell matchCell = row.createCell(2);
            matchCell.setCellValue(result.getMatchCount());
            if (result.getMatchCount() > 0) {
                matchCell.setCellStyle(warningStyle);
            }
        }

        // Autoajustar ancho de columnas
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createDetailsSheet(Sheet sheet, List<BulkValidateResultDto> results,
            CellStyle headerStyle, CellStyle warningStyle) {
        // Headers
        Row headerRow = sheet.createRow(0);
        String[] headers = { "Documento Consultado", "Nombre Consultado", "Código Lista", 
                "Nombre (Lista)", "Tipo", "Identificación (Lista)", "Comentarios" };
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
            sheet.setColumnWidth(i, 5000);
        }

        // Datos
        int rowNum = 1;
        for (BulkValidateResultDto result : results) {
            for (RestrictiveListEntry match : result.getMatches()) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(result.getQueryDocumentNumber());
                row.createCell(1).setCellValue(result.getQueryFullName());
                row.createCell(2).setCellValue(match.getCodigoLista() != null ? match.getCodigoLista().toString() : "");
                row.createCell(3).setCellValue(match.getNombre() != null ? match.getNombre() : "");
                row.createCell(4).setCellValue(match.getTipo() != null ? match.getTipo() : "");
                row.createCell(5).setCellValue(match.getIdentificacion() != null ? match.getIdentificacion() : "");
                row.createCell(6).setCellValue(match.getComentarios() != null ? match.getComentarios() : "");
            }
        }

        // Autoajustar ancho de columnas
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null)
            return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val)) {
                    yield String.valueOf((long) val);
                }
                yield String.valueOf(val);
            }
            default -> "";
        };
    }
}
