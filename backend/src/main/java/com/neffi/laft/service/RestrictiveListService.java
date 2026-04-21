package com.neffi.laft.service;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

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

import com.neffi.laft.dto.BulkErrorDto;
import com.neffi.laft.dto.BulkInputRow;
import com.neffi.laft.dto.BulkValidateResultDto;
import com.neffi.laft.dto.BulkValidationRowErrorDto;
import com.neffi.laft.dto.ButValidarListasParams;
import com.neffi.laft.dto.RestrictiveListEntry;
import com.neffi.laft.dto.TiposDocumentosDTO;
import com.neffi.laft.dto.ValidateClientDto;
import com.neffi.laft.enums.BulkTemplateColumn;
import com.neffi.laft.exception.custom.ExceptionBulkValidation;
import com.neffi.laft.repository.RestrictiveListRepository;
import com.neffi.laft.utils.Utils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestrictiveListService {

    private static final DateTimeFormatter REPORT_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private static final String[] BULK_TEMPLATE_COLUMNS = BulkTemplateColumn.headers();

    private static final Pattern DOCUMENT_NUMBER_PATTERN = Pattern.compile("^[A-Za-z0-9]+$");
    private static final Pattern PERSON_NAME_PATTERN = Pattern.compile("^[\\p{L}]+$");
    private static final Pattern HAS_WHITESPACE_PATTERN = Pattern.compile(".*\\s+.*");

    @Value("${app.restrictiveList.validationProcessName}")
    private String proceso;

    @Value("${app.restrictiveList.validationEventDescription}")
    private String descripcionEvento;

    @Value("${app.restrictiveList.returnsLinf}")
    private String retornaLinf;

    @Value("${app.restrictiveList.maxBulkRecords}")
    private int maxBulkRecords;

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
                retornaLinf,
                utils.getCurrentUsername(),
                requestUrl,
                descripcionEvento);

        List<RestrictiveListEntry> results = restrictiveListRepository.butValidarListas(params);

        results.forEach(entry -> {
            if (entry.getTipoDocumento() != null) {
                try {
                    TiposDocumentosDTO tipoDoc = tiposDocumentosService
                            .getTiposDocumentosById(Long.valueOf(entry.getTipoDocumento()));
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

    /**
     * Procesa la validación masiva desde un archivo Excel.
     *
     * Realiza validaciones de formato y reglas de negocio por cada fila,
     * acumula errores controlados y, si no hay errores, consulta listas
     * restrictivas por cada registro válido.
     *
     * @param file       archivo Excel cargado por el usuario
     * @param requestUrl origen de la solicitud para trazabilidad
     * @return lista de resultados de validación por registro
     * @throws Exception cuando ocurre un error de lectura/procesamiento del archivo
     */
    public List<BulkValidateResultDto> validateBulk(MultipartFile file, String requestUrl) throws Exception {
        log.info("Validación masiva - archivo: {}", file.getOriginalFilename());
        List<BulkValidateResultDto> results = new ArrayList<>();
        List<BulkInputRow> validRows = new ArrayList<>();
        List<BulkValidationRowErrorDto> validationErrors = new ArrayList<>();
        Map<String, Integer> documentNumbersByRow = new HashMap<>();
        int processedDataRows = 0;

        try (InputStream is = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            validateBulkTemplateColumnCount(sheet);
            int firstDataRow = 1;

            for (int i = firstDataRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                processedDataRows++;
                int excelRowNumber = i + 1;
                List<BulkErrorDto> rowErrors = new ArrayList<>();

                String docNumber = getCellString(row, BulkTemplateColumn.NUMERO_DOCUMENTO);
                String primerNombreCol = getCellString(row, BulkTemplateColumn.PRIMER_NOMBRE);
                String segundoNombre = getCellString(row, BulkTemplateColumn.SEGUNDO_NOMBRE);
                String primerApellido = getCellString(row, BulkTemplateColumn.PRIMER_APELLIDO);
                String segundoApellido = getCellString(row, BulkTemplateColumn.SEGUNDO_APELLIDO);
                String razonSocialCol = getCellString(row, BulkTemplateColumn.RAZON_SOCIAL);

                if (processedDataRows > maxBulkRecords) {
                    rowErrors.add(BulkErrorDto.builder()
                            .value("")
                            .message(String.format("Se excede el límite de cargue masivo de %d registros configurado en el aplicativo.", maxBulkRecords))
                            .build());

                    validationErrors.add(BulkValidationRowErrorDto.builder()
                            .rowNumber(excelRowNumber)
                            .errors(rowErrors)
                            .build());
                            
                    throw new ExceptionBulkValidation("Se encontraron errores de validación en el archivo cargado.",
                            validationErrors);
                }

                validateNoWhitespace(docNumber, BulkTemplateColumn.NUMERO_DOCUMENTO, rowErrors);
                validateNoWhitespace(primerNombreCol, BulkTemplateColumn.PRIMER_NOMBRE, rowErrors);
                validateNoWhitespace(segundoNombre, BulkTemplateColumn.SEGUNDO_NOMBRE, rowErrors);
                validateNoWhitespace(primerApellido, BulkTemplateColumn.PRIMER_APELLIDO, rowErrors);
                validateNoWhitespace(segundoApellido, BulkTemplateColumn.SEGUNDO_APELLIDO, rowErrors);

                if (docNumber.isBlank()) {
                    rowErrors.add(BulkErrorDto.builder()
                            .value(docNumber)
                            .message("El campo Número de Documento es obligatorio.")
                            .build());
                } else {
                    if (!DOCUMENT_NUMBER_PATTERN.matcher(docNumber).matches()) {
                        rowErrors.add(BulkErrorDto.builder()
                                .value(docNumber)
                                .message("El campo Número de Documento no acepta caracteres especiales.")
                                .build());
                    }

                    String normalizedDocNumber = docNumber.toUpperCase();
                    Integer duplicateRowNumber = documentNumbersByRow.putIfAbsent(normalizedDocNumber, excelRowNumber);
                    if (duplicateRowNumber != null) {
                        rowErrors.add(BulkErrorDto.builder()
                                .value(docNumber)
                                .message(String.format(
                                        "El campo Número de Documento no permite duplicados. Está repetido con la fila %d.",
                                        duplicateRowNumber))
                                .build());
                    }
                }

                validatePersonNameField(primerNombreCol, BulkTemplateColumn.PRIMER_NOMBRE, rowErrors);
                validatePersonNameField(segundoNombre, BulkTemplateColumn.SEGUNDO_NOMBRE, rowErrors);
                validatePersonNameField(primerApellido, BulkTemplateColumn.PRIMER_APELLIDO, rowErrors);
                validatePersonNameField(segundoApellido, BulkTemplateColumn.SEGUNDO_APELLIDO, rowErrors);

                if (primerNombreCol.isBlank() && razonSocialCol.isBlank()) {
                    rowErrors.add(BulkErrorDto.builder()
                            .value("")
                            .message("Debe diligenciar Primer Nombre o Razón social.")
                            .build());
                }

                if (!rowErrors.isEmpty()) {
                    validationErrors.add(BulkValidationRowErrorDto.builder()
                            .rowNumber(excelRowNumber)
                            .errors(rowErrors)
                            .build());
                    continue;
                }

                String primerNombre;
                if (!primerNombreCol.isBlank()) {
                    log.info("Fila {}: Usando Primer Nombre '{}' para documento {}", excelRowNumber, primerNombreCol,
                            docNumber);
                    primerNombre = primerNombreCol;
                } else {
                    log.info("Fila {}: Usando Razón Social '{}' para documento {}", excelRowNumber, razonSocialCol,
                            docNumber);
                    primerNombre = razonSocialCol;
                }

                String fullName = String.join(" ",
                        java.util.Arrays.stream(
                                new String[] { primerNombre, segundoNombre, primerApellido, segundoApellido })
                                .filter(s -> !s.isBlank())
                                .toArray(String[]::new));

                validRows.add(BulkInputRow.builder()
                        .docNumber(docNumber)
                        .primerNombre(primerNombre)
                        .segundoNombre(segundoNombre)
                        .primerApellido(primerApellido)
                        .segundoApellido(segundoApellido)
                        .fullName(fullName)
                        .build());
            }
        }

        if (!validationErrors.isEmpty()) {
            throw new ExceptionBulkValidation("Se encontraron errores de validación en el archivo cargado.",
                    validationErrors);
        }

        for (BulkInputRow row : validRows) {
            ValidateClientDto dto = ValidateClientDto.builder()
                    .p_IDENTIFICACION(row.getDocNumber())
                    .p_NOMBRE_1(row.getPrimerNombre())
                    .p_NOMBRE_2(row.getSegundoNombre())
                    .p_APELLIDO_1(row.getPrimerApellido())
                    .p_APELLIDO_2(row.getSegundoApellido())
                    .build();

            List<RestrictiveListEntry> matches = validateClient(dto, requestUrl);

            results.add(BulkValidateResultDto.builder()
                    .queryDocumentNumber(row.getDocNumber())
                    .queryFullName(row.getFullName())
                    .matchCount(matches.size())
                    .matches(matches)
                    .build());
        }

        log.info("Validación masiva completada - {} registros procesados", results.size());

        return results;
    }

    /**
     * Valida que un campo no contenga espacios ni saltos de línea.
     *
     * @param value     valor del campo
     * @param field     columna/etiqueta del campo en la plantilla
     * @param rowErrors lista de errores acumulados para la fila
     */
    private void validateNoWhitespace(String value, BulkTemplateColumn field, List<BulkErrorDto> rowErrors) {
        if (!value.isBlank() && HAS_WHITESPACE_PATTERN.matcher(value).matches()) {
            rowErrors.add(
                BulkErrorDto.builder()
                .value(value)
                .message(String.format("El campo %s no debe contener espacios ni saltos de línea.", field.header()))
                .build()
            );
        }
    }

    /**
     * Valida que un campo de nombre de persona solo contenga letras.
     *
     * @param value     valor del campo
     * @param field     columna/etiqueta del campo en la plantilla
     * @param rowErrors lista de errores acumulados para la fila
     */
    private void validatePersonNameField(String value, BulkTemplateColumn field, List<BulkErrorDto> rowErrors) {
        if (!value.isBlank() && !PERSON_NAME_PATTERN.matcher(value).matches()) {
            rowErrors.add(BulkErrorDto.builder()
                    .value(value)
                    .message(String.format("El campo %s no acepta caracteres especiales ni números.", field.header()))
                    .build());
        }
    }

    /**
     * Determina si una fila no contiene información en ninguna columna definida
     * para la plantilla de validación masiva.
     *
     * @param row fila de Excel a validar
     * @return true si todos los campos esperados están vacíos, false en caso
     *         contrario
     */
    private boolean isRowEmpty(Row row) {
        for (BulkTemplateColumn column : BulkTemplateColumn.values()) {
            if (!getCellString(row, column).isBlank()) {
                return false;
            }
        }
        return true;
    }

    /**
     * Metodo para generar la plantilla de validación masiva en Excel.
     * 
     * @return
     */
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
        String[] columns = BULK_TEMPLATE_COLUMNS;
        for (int i = 0; i < columns.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
            sheet.setColumnWidth(i, 5000);
        }

        return workbook;
    }

    /**
     * Metodo para validar que la plantilla de validación masiva tenga el número
     * correcto de columnas.
     * 
     * @param sheet
     */
    private void validateBulkTemplateColumnCount(Sheet sheet) {
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            throw new IllegalArgumentException("El archivo no contiene fila de encabezados.");
        }

        int actualColumns = headerRow.getLastCellNum();
        int expectedColumns = BULK_TEMPLATE_COLUMNS.length;

        if (actualColumns != expectedColumns) {
            throw new IllegalArgumentException(String.format(
                    "La plantilla es inválida. Se esperaban %d columnas y se encontraron %d.",
                    expectedColumns,
                    actualColumns));
        }
    }

    /**
     * Genera un Workbook Excel con los resultados de la validación masiva.
     * Incluye dos hojas: Resumen con los datos principales y Detalles con todas las
     * coincidencias.
     * 
     * @param results Lista de resultados de validateBulk
     * @return Workbook Excel con los resultados
     */
    public Workbook generateBulkReportExcel(List<BulkValidateResultDto> results) {
        log.debug("Generando reporte Excel para {} registros", results.size());
        Workbook workbook = new XSSFWorkbook();

        // Crear estilos
        CellStyle headerStyle = createHeaderStyle(workbook);

        // Crear hoja de Resumen
        Sheet summarySheet = workbook.createSheet("Resumen");
        createSummarySheet(summarySheet, results, headerStyle);

        // Crear hoja de Detalles
        Sheet detailsSheet = workbook.createSheet("Detalles");
        createDetailsSheet(detailsSheet, results, headerStyle);

        return workbook;
    }

    /**
     * Crea el estilo de encabezado utilizado en las hojas de resultados.
     *
     * @param workbook libro de Excel donde se creará el estilo
     * @return estilo de encabezado con fuente blanca y fondo azul
     */
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

    /**
     * Construye la hoja de resumen para el informe de validación masiva.
     *
     * @param sheet       hoja destino
     * @param results     resultados de validación
     * @param headerStyle estilo para encabezados de tabla
     */
    private void createSummarySheet(Sheet sheet, List<BulkValidateResultDto> results,
            CellStyle headerStyle) {
        CellStyle metadataLabelStyle = sheet.getWorkbook().createCellStyle();
        Font metadataLabelFont = sheet.getWorkbook().createFont();
        metadataLabelFont.setBold(true);
        metadataLabelStyle.setFont(metadataLabelFont);

        // Metadatos en A1:B3
        Row processedRow = sheet.createRow(0);
        Cell processedLabelCell = processedRow.createCell(0);
        processedLabelCell.setCellValue("Registros Procesados");
        processedLabelCell.setCellStyle(metadataLabelStyle);
        processedRow.createCell(1).setCellValue(results.size());

        Row reportDateRow = sheet.createRow(1);
        Cell reportDateLabelCell = reportDateRow.createCell(0);
        reportDateLabelCell.setCellValue("Fecha de generación del informe");
        reportDateLabelCell.setCellStyle(metadataLabelStyle);
        reportDateRow.createCell(1).setCellValue(LocalDateTime.now().format(REPORT_DATE_FORMAT));

        Row userRow = sheet.createRow(2);
        Cell userLabelCell = userRow.createCell(0);
        userLabelCell.setCellValue("Usuario generador");
        userLabelCell.setCellStyle(metadataLabelStyle);
        userRow.createCell(1).setCellValue(utils.getCurrentUsername());

        // Headers
        Row headerRow = sheet.createRow(4);
        String[] headers = { "Número Documento", "Nombre Completo", "Coincidencias" };
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
            sheet.setColumnWidth(i, 5000);
        }

        // Datos
        int rowNum = 5;
        for (BulkValidateResultDto result : results) {
            Row row = sheet.createRow(rowNum++);

            Cell docCell = row.createCell(0);
            docCell.setCellValue(result.getQueryDocumentNumber());

            Cell nameCell = row.createCell(1);
            nameCell.setCellValue(result.getQueryFullName());

            Cell matchCell = row.createCell(2);
            matchCell.setCellValue(result.getMatchCount());
        }

        // Autoajustar ancho de columnas
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    /**
     * Construye la hoja de detalles con todas las coincidencias encontradas.
     *
     * @param sheet       hoja destino
     * @param results     resultados de validación
     * @param headerStyle estilo para encabezados de tabla
     */
    private void createDetailsSheet(Sheet sheet, List<BulkValidateResultDto> results,
            CellStyle headerStyle) {
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

                int colNum = 0;

                row.createCell(colNum++).setCellValue(result.getQueryDocumentNumber());
                row.createCell(colNum++).setCellValue(result.getQueryFullName());
                row.createCell(colNum++)
                        .setCellValue(match.getCodigoLista() != null ? match.getCodigoLista().toString() : "");
                row.createCell(colNum++).setCellValue(match.getNombre() != null ? match.getNombre() : "");
                row.createCell(colNum++).setCellValue(match.getTipo() != null ? match.getTipo() : "");
                row.createCell(colNum++)
                        .setCellValue(match.getIdentificacion() != null ? match.getIdentificacion() : "");
                row.createCell(colNum++).setCellValue(match.getComentarios() != null ? match.getComentarios() : "");
            }
        }

        // Autoajustar ancho de columnas
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    /**
     * Obtiene el valor de una celda a partir de la columna definida en el enum.
     *
     * @param row    fila de Excel
     * @param column columna de la plantilla
     * @return valor de la celda como texto
     */
    private String getCellString(Row row, BulkTemplateColumn column) {
        return getCellString(row, column.index());
    }

    /**
     * Convierte el valor de una celda a texto según su tipo.
     *
     * @param row fila de Excel
     * @param col índice de columna
     * @return valor normalizado en texto o cadena vacía si no aplica
     */
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
