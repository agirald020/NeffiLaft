package com.neffi.laft.repository;

import com.neffi.laft.model.RestrictiveListEntry;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class InMemoryRestrictiveListRepository {

    private final List<RestrictiveListEntry> entries = new ArrayList<>();

    @PostConstruct
    public void init() {
        entries.add(RestrictiveListEntry.builder()
            .id(UUID.randomUUID().toString())
            .documentType("CC").documentNumber("1023456789")
            .fullName("CARLOS ANDRÉS MARTÍNEZ LÓPEZ")
            .listName("OFAC - SDN List").listSource("OFAC")
            .matchType("Exacto").matchScore(100.0)
            .build());

        entries.add(RestrictiveListEntry.builder()
            .id(UUID.randomUUID().toString())
            .documentType("CC").documentNumber("1023456789")
            .fullName("CARLOS A. MARTÍNEZ L.")
            .listName("Lista ONU - Resolución 1267").listSource("ONU")
            .matchType("Parcial").matchScore(85.0)
            .build());

        entries.add(RestrictiveListEntry.builder()
            .id(UUID.randomUUID().toString())
            .documentType("CC").documentNumber("80123456")
            .fullName("JUAN PABLO RODRÍGUEZ GARCÍA")
            .listName("Lista Clinton - OFAC").listSource("OFAC")
            .matchType("Exacto").matchScore(100.0)
            .build());

        entries.add(RestrictiveListEntry.builder()
            .id(UUID.randomUUID().toString())
            .documentType("NIT").documentNumber("900123456")
            .fullName("INVERSIONES EL DORADO S.A.S.")
            .listName("OFAC - SDN List").listSource("OFAC")
            .matchType("Exacto").matchScore(100.0)
            .build());

        entries.add(RestrictiveListEntry.builder()
            .id(UUID.randomUUID().toString())
            .documentType("NIT").documentNumber("900123456")
            .fullName("INVERSIONES EL DORADO")
            .listName("Lista UE - Sanciones").listSource("UE")
            .matchType("Parcial").matchScore(90.0)
            .build());

        entries.add(RestrictiveListEntry.builder()
            .id(UUID.randomUUID().toString())
            .documentType("CE").documentNumber("E123456")
            .fullName("MOHAMMAD AL-RASHID HUSSEIN")
            .listName("Lista ONU - Resolución 1988").listSource("ONU")
            .matchType("Exacto").matchScore(100.0)
            .build());

        entries.add(RestrictiveListEntry.builder()
            .id(UUID.randomUUID().toString())
            .documentType("CC").documentNumber("52987654")
            .fullName("MARÍA FERNANDA TORRES VEGA")
            .listName("Procuraduría - Inhabilidades").listSource("PGN")
            .matchType("Exacto").matchScore(100.0)
            .build());

        entries.add(RestrictiveListEntry.builder()
            .id(UUID.randomUUID().toString())
            .documentType("CC").documentNumber("52987654")
            .fullName("MARIA F. TORRES V.")
            .listName("Contraloría - Responsabilidad Fiscal").listSource("CGR")
            .matchType("Parcial").matchScore(88.0)
            .build());

        entries.add(RestrictiveListEntry.builder()
            .id(UUID.randomUUID().toString())
            .documentType("PP").documentNumber("AB1234567")
            .fullName("VIKTOR PETROV SOKOLOV")
            .listName("Lista UE - Sanciones Rusia").listSource("UE")
            .matchType("Exacto").matchScore(100.0)
            .build());

        entries.add(RestrictiveListEntry.builder()
            .id(UUID.randomUUID().toString())
            .documentType("CC").documentNumber("10345678")
            .fullName("PEDRO LUIS RAMÍREZ OCHOA")
            .listName("Policía Nacional - Antecedentes").listSource("DIJIN")
            .matchType("Exacto").matchScore(100.0)
            .build());

        entries.add(RestrictiveListEntry.builder()
            .id(UUID.randomUUID().toString())
            .documentType("CC").documentNumber("10345678")
            .fullName("PEDRO L. RAMÍREZ O.")
            .listName("OFAC - SDN List").listSource("OFAC")
            .matchType("Parcial").matchScore(82.0)
            .build());
    }

    public List<RestrictiveListEntry> findByDocumentNumber(String documentNumber) {
        return entries.stream()
            .filter(e -> e.getDocumentNumber().equalsIgnoreCase(documentNumber.trim()))
            .collect(Collectors.toList());
    }

    public List<RestrictiveListEntry> findByDocumentTypeAndNumber(String documentType, String documentNumber) {
        return entries.stream()
            .filter(e -> e.getDocumentType().equalsIgnoreCase(documentType.trim())
                && e.getDocumentNumber().equalsIgnoreCase(documentNumber.trim()))
            .collect(Collectors.toList());
    }

    public List<RestrictiveListEntry> findByName(String name) {
        String normalized = name.trim().toUpperCase();
        return entries.stream()
            .filter(e -> e.getFullName().toUpperCase().contains(normalized)
                || normalized.contains(e.getFullName().toUpperCase()))
            .collect(Collectors.toList());
    }
}
