package com.neffi.laft.service;

import com.neffi.laft.dto.BulkValidateResultDto;
import com.neffi.laft.dto.ValidateClientDto;
import com.neffi.laft.model.RestrictiveListEntry;
import com.neffi.laft.repository.InMemoryRestrictiveListRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestrictiveListService {

    private final InMemoryRestrictiveListRepository repository;

    public List<RestrictiveListEntry> validateClient(ValidateClientDto dto) {
        log.info("Validando cliente - Documento: {}, Nombre: {}",
            dto.getDocumentNumber(), dto.getFullName());

        List<RestrictiveListEntry> results = new ArrayList<>();

        boolean hasDocument = dto.getDocumentNumber() != null && !dto.getDocumentNumber().isBlank();
        boolean hasName = dto.getFullName() != null && !dto.getFullName().isBlank();

        if (hasDocument) {
            results = repository.findByDocumentNumber(dto.getDocumentNumber());
        }

        if (hasName) {
            List<RestrictiveListEntry> nameResults = repository.findByName(dto.getFullName());
            for (RestrictiveListEntry entry : nameResults) {
                if (results.stream().noneMatch(r -> r.getId().equals(entry.getId()))) {
                    results.add(entry);
                }
            }
        }

        log.info("Encontradas {} coincidencias", results.size());
        return results;
    }

    public List<BulkValidateResultDto> validateBulk(MultipartFile file) throws Exception {
        log.info("Validación masiva - archivo: {}", file.getOriginalFilename());
        List<BulkValidateResultDto> results = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            int firstDataRow = 1;

            for (int i = firstDataRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

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
                        java.util.Arrays.stream(new String[]{primerNombre, segundoNombre, primerApellido, segundoApellido})
                            .filter(s -> !s.isBlank())
                            .toArray(String[]::new));
                }

                if (docNumber.isBlank() && fullName.isBlank()) continue;

                ValidateClientDto dto = new ValidateClientDto(docNumber, fullName);
                List<RestrictiveListEntry> matches = validateClient(dto);

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

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
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
