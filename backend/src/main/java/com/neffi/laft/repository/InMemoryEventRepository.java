package com.neffi.laft.repository;

import com.neffi.laft.model.Event;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryEventRepository {

    private final Map<String, Event> store = new ConcurrentHashMap<>();

    public InMemoryEventRepository() {
        initSampleData();
    }

    private void initSampleData() {
        Event event1 = Event.builder()
            .id("event-1")
            .trustId("trust-1")
            .type("junta")
            .title("Junta de Seguimiento del Proyecto")
            .description("Revisión del avance del proyecto inmobiliario, aprobación de desembolsos para la fase de construcción y análisis de los estados financieros del tercer trimestre.")
            .date(LocalDateTime.of(2024, 10, 25, 10, 0))
            .startTime("10:00")
            .endTime("12:00")
            .location("Oficinas NEFFI - Sala de Juntas 2")
            .participants("Juan Carlos Mendoza, María Fernanda López, Carlos Ruiz")
            .status("realizado")
            .attachments(List.of(
                Map.of("name", "acta-junta-oct-2024.pdf", "url", "/objects/uploads/acta-junta-oct-2024.pdf"),
                Map.of("name", "estados-financieros-q3.xlsx", "url", "/objects/uploads/estados-financieros-q3.xlsx")
            ))
            .includeInReport(true)
            .createdBy("dev-user")
            .createdByUsername("dev@bypass")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        Event event2 = Event.builder()
            .id("event-2")
            .trustId("trust-1")
            .type("comite")
            .title("Comité de Inversiones - Aprobación Fase 2")
            .description("Aprobación de inversión para la segunda fase del proyecto, incluyendo recursos para acabados y áreas comunes por un valor de $800.000.000.")
            .date(LocalDateTime.of(2024, 10, 18, 14, 30))
            .startTime("14:30")
            .endTime("16:30")
            .location("Reunión Virtual - Zoom")
            .participants("Comité de inversiones, Gerente de proyecto, Director técnico")
            .status("realizado")
            .attachments(List.of(
                Map.of("name", "propuesta-fase-2.pdf", "url", "/objects/uploads/propuesta-fase-2.pdf"),
                Map.of("name", "presupuesto-acabados.xlsx", "url", "/objects/uploads/presupuesto-acabados.xlsx")
            ))
            .includeInReport(true)
            .createdBy("dev-user")
            .createdByUsername("dev@bypass")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        store.put(event1.getId(), event1);
        store.put(event2.getId(), event2);
    }

    public List<Event> findByTrustId(String trustId) {
        return store.values().stream()
            .filter(e -> e.getTrustId().equals(trustId))
            .sorted(Comparator.comparing(Event::getDate).reversed())
            .collect(Collectors.toList());
    }

    public Optional<Event> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    public Event save(Event event) {
        store.put(event.getId(), event);
        return event;
    }

    public boolean deleteById(String id) {
        return store.remove(id) != null;
    }
}
