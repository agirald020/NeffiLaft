package com.neffi.laft.service;

import com.neffi.laft.dto.CreateContractDto;
import com.neffi.laft.model.Contract;
import com.neffi.laft.repository.InMemoryContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractService {

    private final InMemoryContractRepository contractRepository;

    public Optional<Contract> getContractByTrustId(String trustId) {
        log.debug("Buscando contrato del fideicomiso: {}", trustId);
        return contractRepository.findByTrustId(trustId);
    }

    public Contract saveContract(String trustId, CreateContractDto dto) {
        log.info("Guardando contrato del fideicomiso: {}", trustId);
        Optional<Contract> existing = contractRepository.findByTrustId(trustId);

        if (existing.isPresent()) {
            Contract contract = existing.get();
            contract.setPurpose(dto.getPurpose());
            contract.setObligations(dto.getObligations());
            contract.setRemuneration(dto.getRemuneration());
            contract.setUpdatedAt(LocalDateTime.now());
            return contractRepository.save(contract);
        }

        Contract contract = Contract.builder()
            .id(UUID.randomUUID().toString())
            .trustId(trustId)
            .purpose(dto.getPurpose())
            .obligations(dto.getObligations())
            .remuneration(dto.getRemuneration())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        return contractRepository.save(contract);
    }
}
