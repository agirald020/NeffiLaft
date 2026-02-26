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
                String name = getCellString(row, 1);

                if (docNumber.isBlank() && name.isBlank()) continue;

                ValidateClientDto dto = new ValidateClientDto(docNumber, name);
                List<RestrictiveListEntry> matches = validateClient(dto);

                results.add(BulkValidateResultDto.builder()
                    .queryDocumentNumber(docNumber)
                    .queryFullName(name)
                    .matchCount(matches.size())
                    .matches(matches)
                    .build());
            }
        }

        log.info("Validación masiva completada - {} registros procesados", results.size());
        return results;
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
