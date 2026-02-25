package com.neffi.laft.repository;

import com.neffi.laft.model.Trust;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryTrustRepository {

    private final Map<String, Trust> store = new ConcurrentHashMap<>();

    public InMemoryTrustRepository() {
        initSampleData();
    }

    private void initSampleData() {
        Trust trust1 = Trust.builder()
            .id("trust-1")
            .code("FID-2024-001")
            .name("Fideicomiso Inmobiliario Plaza Central")
            .fullName("Fideicomiso Inmobiliario Plaza Central para el Desarrollo de Proyectos Comerciales")
            .status("Activo")
            .constitutionDate(LocalDateTime.of(2024, 3, 15, 0, 0))
            .validity(LocalDateTime.of(2034, 3, 15, 0, 0))
            .trustors(List.of(
                Map.of("name", "Constructora Plaza Central S.A.S.", "nit", "900.123.456-1",
                       "legalRepresentative", "Juan Carlos Mendoza", "percentage", "75.50000"),
                Map.of("name", "Inversiones Desarrollo Urbano S.A.S.", "nit", "900.987.654-3",
                       "legalRepresentative", "Ana María Gutierrez", "percentage", "24.50000")
            ))
            .beneficiaries(List.of(
                Map.of("name", "Constructora Plaza Central S.A.S.", "nit", "900.123.456-1",
                       "patrimonialPercentage", "60.00000", "usufructPercentage", "65.00000"),
                Map.of("name", "Inversiones Inmobiliarias XYZ", "nit", "900.555.777-8",
                       "patrimonialPercentage", "40.00000", "usufructPercentage", "35.00000")
            ))
            .fiduciary(Map.of("name", "NEFFI Fiduciaria S.A.", "nit", "860.000.000-1"))
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        Trust trust2 = Trust.builder()
            .id("trust-2")
            .code("FID-2024-002")
            .name("Fideicomiso de Garantía Empresarial ABC")
            .fullName("Fideicomiso de Garantía Empresarial ABC para Operaciones Comerciales")
            .status("Activo")
            .constitutionDate(LocalDateTime.of(2024, 1, 22, 0, 0))
            .validity(LocalDateTime.of(2029, 1, 22, 0, 0))
            .trustors(List.of(
                Map.of("name", "Empresa ABC S.A.S.", "nit", "900.456.789-2",
                       "legalRepresentative", "María Elena Rodríguez", "percentage", "100.00000")
            ))
            .beneficiaries(List.of(
                Map.of("name", "Empresa ABC S.A.S.", "nit", "900.456.789-2",
                       "patrimonialPercentage", "100.00000", "usufructPercentage", "100.00000")
            ))
            .fiduciary(Map.of("name", "NEFFI Fiduciaria S.A.", "nit", "860.000.000-1"))
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        store.put(trust1.getId(), trust1);
        store.put(trust2.getId(), trust2);
    }

    public List<Trust> findAll() {
        return new ArrayList<>(store.values());
    }

    public List<Trust> search(String query) {
        String lower = query.toLowerCase();
        return store.values().stream()
            .filter(t -> t.getName().toLowerCase().contains(lower)
                      || t.getCode().toLowerCase().contains(lower))
            .collect(Collectors.toList());
    }

    public Optional<Trust> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    public Trust save(Trust trust) {
        store.put(trust.getId(), trust);
        return trust;
    }

    public boolean deleteById(String id) {
        return store.remove(id) != null;
    }
}
