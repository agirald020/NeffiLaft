package com.neffi.laft.service;

import com.neffi.laft.dto.CreateTrustDto;
import com.neffi.laft.model.Trust;
import com.neffi.laft.repository.InMemoryTrustRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrustService {

    private final InMemoryTrustRepository trustRepository;

    public List<Trust> getAllTrusts() {
        log.debug("Obteniendo todos los fideicomisos");
        return trustRepository.findAll();
    }

    public List<Trust> searchTrusts(String query) {
        log.debug("Buscando fideicomisos con query: {}", query);
        return trustRepository.search(query);
    }

    public Optional<Trust> getTrustById(String id) {
        log.debug("Buscando fideicomiso con id: {}", id);
        return trustRepository.findById(id);
    }

    public Trust createTrust(CreateTrustDto dto) {
        log.info("Creando nuevo fideicomiso: {}", dto.getCode());
        Trust trust = Trust.builder()
            .id(UUID.randomUUID().toString())
            .code(dto.getCode())
            .name(dto.getName())
            .fullName(dto.getFullName())
            .status(dto.getStatus() != null ? dto.getStatus() : "Activo")
            .constitutionDate(dto.getConstitutionDate())
            .validity(dto.getValidity())
            .trustors(dto.getTrustors())
            .beneficiaries(dto.getBeneficiaries())
            .fiduciary(dto.getFiduciary())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        return trustRepository.save(trust);
    }

    public Optional<Trust> updateTrust(String id, CreateTrustDto dto) {
        log.info("Actualizando fideicomiso: {}", id);
        return trustRepository.findById(id).map(existing -> {
            existing.setCode(dto.getCode() != null ? dto.getCode() : existing.getCode());
            existing.setName(dto.getName() != null ? dto.getName() : existing.getName());
            existing.setFullName(dto.getFullName() != null ? dto.getFullName() : existing.getFullName());
            existing.setStatus(dto.getStatus() != null ? dto.getStatus() : existing.getStatus());
            existing.setConstitutionDate(dto.getConstitutionDate() != null ? dto.getConstitutionDate() : existing.getConstitutionDate());
            existing.setValidity(dto.getValidity() != null ? dto.getValidity() : existing.getValidity());
            existing.setTrustors(dto.getTrustors() != null ? dto.getTrustors() : existing.getTrustors());
            existing.setBeneficiaries(dto.getBeneficiaries() != null ? dto.getBeneficiaries() : existing.getBeneficiaries());
            existing.setFiduciary(dto.getFiduciary() != null ? dto.getFiduciary() : existing.getFiduciary());
            existing.setUpdatedAt(LocalDateTime.now());
            return trustRepository.save(existing);
        });
    }
}
