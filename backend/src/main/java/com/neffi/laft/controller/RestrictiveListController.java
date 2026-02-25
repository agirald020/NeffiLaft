package com.neffi.laft.controller;

import com.neffi.laft.dto.ValidateClientDto;
import com.neffi.laft.model.RestrictiveListEntry;
import com.neffi.laft.service.RestrictiveListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/laft/validate")
@RequiredArgsConstructor
public class RestrictiveListController {

    private final RestrictiveListService restrictiveListService;

    @PostMapping
    public ResponseEntity<List<RestrictiveListEntry>> validateClient(
            @Valid @RequestBody ValidateClientDto dto) {
        List<RestrictiveListEntry> results = restrictiveListService.validateClient(dto);
        return ResponseEntity.ok(results);
    }
}
