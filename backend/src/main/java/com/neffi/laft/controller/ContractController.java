package com.neffi.laft.controller;

import com.neffi.laft.dto.CreateContractDto;
import com.neffi.laft.model.Contract;
import com.neffi.laft.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/laft")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @GetMapping("/{trustId}/contract")
    public ResponseEntity<Contract> getContract(@PathVariable String trustId) {
        return contractService.getContractByTrustId(trustId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{trustId}/contract")
    public ResponseEntity<Contract> saveContract(
            @PathVariable String trustId,
            @Valid @RequestBody CreateContractDto dto) {
        Contract contract = contractService.saveContract(trustId, dto);
        return ResponseEntity.ok(contract);
    }
}
