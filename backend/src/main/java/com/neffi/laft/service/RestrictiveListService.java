package com.neffi.laft.service;

import com.neffi.laft.dto.ValidateClientDto;
import com.neffi.laft.model.RestrictiveListEntry;
import com.neffi.laft.repository.InMemoryRestrictiveListRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestrictiveListService {

    private final InMemoryRestrictiveListRepository repository;

    public List<RestrictiveListEntry> validateClient(ValidateClientDto dto) {
        log.info("Validando cliente - Tipo: {}, Documento: {}", dto.getDocumentType(), dto.getDocumentNumber());

        List<RestrictiveListEntry> results = repository.findByDocumentTypeAndNumber(
            dto.getDocumentType(), dto.getDocumentNumber()
        );

        if (results.isEmpty() && dto.getDocumentNumber() != null) {
            results = repository.findByDocumentNumber(dto.getDocumentNumber());
        }

        log.info("Encontradas {} coincidencias para documento {}", results.size(), dto.getDocumentNumber());
        return results;
    }
}
