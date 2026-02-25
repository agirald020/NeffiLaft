package com.neffi.laft.controller;

import com.neffi.laft.dto.CreateEventDto;
import com.neffi.laft.model.Event;
import com.neffi.laft.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping("/laft/{trustId}/events")
    public ResponseEntity<List<Event>> getEvents(@PathVariable String trustId) {
        return ResponseEntity.ok(eventService.getEventsByTrustId(trustId));
    }

    @PostMapping("/laft/{trustId}/events")
    public ResponseEntity<Event> createEvent(
            @PathVariable String trustId,
            @Valid @RequestBody CreateEventDto dto,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt != null ? jwt.getSubject() : "dev-user";
        String username = jwt != null ? jwt.getClaimAsString("preferred_username") : "dev@bypass";

        Event event = eventService.createEvent(trustId, dto, userId, username);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable String id,
            @RequestBody CreateEventDto dto) {
        return eventService.updateEvent(id, dto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteEvent(@PathVariable String id) {
        boolean deleted = eventService.deleteEvent(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("success", true));
    }
}
