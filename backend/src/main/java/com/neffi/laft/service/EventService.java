package com.neffi.laft.service;

import com.neffi.laft.dto.CreateEventDto;
import com.neffi.laft.model.Event;
import com.neffi.laft.repository.InMemoryEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {

    private final InMemoryEventRepository eventRepository;

    public List<Event> getEventsByTrustId(String trustId) {
        log.debug("Obteniendo eventos del fideicomiso: {}", trustId);
        return eventRepository.findByTrustId(trustId);
    }

    public Optional<Event> getEventById(String id) {
        return eventRepository.findById(id);
    }

    public Event createEvent(String trustId, CreateEventDto dto, String userId, String username) {
        log.info("Registrando evento '{}' en fideicomiso: {}", dto.getTitle(), trustId);
        Event event = Event.builder()
            .id(UUID.randomUUID().toString())
            .trustId(trustId)
            .type(dto.getType())
            .title(dto.getTitle())
            .description(dto.getDescription())
            .date(dto.getDate())
            .startTime(dto.getStartTime())
            .endTime(dto.getEndTime())
            .location(dto.getLocation())
            .participants(dto.getParticipants())
            .status(dto.getStatus() != null ? dto.getStatus() : "programado")
            .attachments(dto.getAttachments() != null ? dto.getAttachments() : new ArrayList<>())
            .includeInReport(dto.isIncludeInReport())
            .createdBy(userId)
            .createdByUsername(username)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        return eventRepository.save(event);
    }

    public Optional<Event> updateEvent(String id, CreateEventDto dto) {
        log.info("Actualizando evento: {}", id);
        return eventRepository.findById(id).map(existing -> {
            existing.setType(dto.getType() != null ? dto.getType() : existing.getType());
            existing.setTitle(dto.getTitle() != null ? dto.getTitle() : existing.getTitle());
            existing.setDescription(dto.getDescription() != null ? dto.getDescription() : existing.getDescription());
            existing.setDate(dto.getDate() != null ? dto.getDate() : existing.getDate());
            existing.setStartTime(dto.getStartTime() != null ? dto.getStartTime() : existing.getStartTime());
            existing.setEndTime(dto.getEndTime() != null ? dto.getEndTime() : existing.getEndTime());
            existing.setLocation(dto.getLocation() != null ? dto.getLocation() : existing.getLocation());
            existing.setParticipants(dto.getParticipants() != null ? dto.getParticipants() : existing.getParticipants());
            existing.setStatus(dto.getStatus() != null ? dto.getStatus() : existing.getStatus());
            existing.setAttachments(dto.getAttachments() != null ? dto.getAttachments() : existing.getAttachments());
            existing.setIncludeInReport(dto.isIncludeInReport());
            existing.setUpdatedAt(LocalDateTime.now());
            return eventRepository.save(existing);
        });
    }

    public boolean deleteEvent(String id) {
        log.info("Eliminando evento: {}", id);
        return eventRepository.deleteById(id);
    }
}
