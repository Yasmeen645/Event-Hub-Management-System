package com.example.eventservice.controller;

import com.example.eventservice.dto.EventDto;
import com.example.eventservice.entity.Event;
import com.example.eventservice.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<EventDto.EventResponse>> getApprovedEvents(
            @RequestParam(required = false) Event.EventType type) {
        return ResponseEntity.ok(eventService.getApprovedEvents(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto.EventResponse> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<EventDto.EventResponse> createEvent(
            @Valid @RequestPart("event") EventDto.CreateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestHeader("X-User-Username") String username,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader(value = "X-User-Id", defaultValue = "0") Long userId) throws IOException {

        if (!role.equals("ORGANIZER") && !role.equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(eventService.createEvent(request, username, userId, image));
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<EventDto.EventResponse>> getMyEvents(
            @RequestHeader("X-User-Username") String username,
            @RequestHeader("X-User-Role") String role) {

        if (!role.equals("ORGANIZER") && !role.equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(eventService.getMyEvents(username));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<EventDto.EventResponse> updateEvent(
            @PathVariable Long id,
            @Valid @RequestPart("event") EventDto.CreateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestHeader("X-User-Username") String username) throws IOException {
        return ResponseEntity.ok(eventService.updateEvent(id, request, username, image));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<EventDto.EventResponse>> getPendingEvents(
            @RequestHeader("X-User-Role") String role) {
        if (!role.equals("ADMIN")) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(eventService.getPendingEvents());
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<EventDto.EventResponse>> getAllEventsAdmin(
            @RequestHeader("X-User-Role") String role) {
        if (!role.equals("ADMIN")) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(eventService.getAllEventsAdmin());
    }

    @PutMapping("/{id}/approval")
    public ResponseEntity<EventDto.EventResponse> approveOrReject(
            @PathVariable Long id,
            @RequestBody EventDto.ApprovalRequest request,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Username") String username) {
        if (!role.equals("ADMIN")) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(eventService.approveOrRejectEvent(id, request, username));
    }

    @PutMapping("/{id}/decrement-ticket")
    public ResponseEntity<Boolean> decrementTicket(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.decrementTicket(id));
    }
}
