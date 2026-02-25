package com.neffi.laft.controller;

import com.neffi.laft.dto.CreateTrustDto;
import com.neffi.laft.model.Trust;
import com.neffi.laft.service.TrustService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/laft")
@RequiredArgsConstructor
public class TrustController {

    private final TrustService trustService;

    @GetMapping
    public ResponseEntity<List<Trust>> getTrusts(@RequestParam(required = false) String search) {
        List<Trust> trusts = (search != null && !search.isBlank())
            ? trustService.searchTrusts(search)
            : trustService.getAllTrusts();
        return ResponseEntity.ok(trusts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trust> getTrust(@PathVariable String id) {
        return trustService.getTrustById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Trust> createTrust(@Valid @RequestBody CreateTrustDto dto) {
        Trust trust = trustService.createTrust(dto);
        return ResponseEntity.ok(trust);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trust> updateTrust(@PathVariable String id, @RequestBody CreateTrustDto dto) {
        return trustService.updateTrust(id, dto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
