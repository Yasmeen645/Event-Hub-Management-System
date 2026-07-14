package com.example.eventservice.service;

import com.example.eventservice.dto.EventDto;
import com.example.eventservice.entity.Event;
import com.example.eventservice.repository.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EventService {

    private static final Logger log = LoggerFactory.getLogger(EventService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final EventRepository eventRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<EventDto.EventResponse> getApprovedEvents(Event.EventType type) {
        List<Event> events;
        if (type != null) {
            events = eventRepository.findByStatusAndTypeOrderByEventDateAsc(Event.EventStatus.APPROVED, type);
        } else {
            events = eventRepository.findByStatusOrderByEventDateAsc(Event.EventStatus.APPROVED);
        }
        return events.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public EventDto.EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return mapToResponse(event);
    }

    public EventDto.EventResponse createEvent(EventDto.CreateRequest request,
                                               String organizerUsername,
                                               Long organizerId,
                                               MultipartFile image) throws IOException {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .location(request.getLocation())
                .eventDate(request.getEventDate())
                .totalTickets(request.getTotalTickets())
                .availableTickets(request.getTotalTickets())
                .price(request.getPrice())
                .imageUrl(imageUrl)
                .status(Event.EventStatus.PENDING)
                .organizerUsername(organizerUsername)
                .organizerId(organizerId)
                .build();

        Event savedEvent = eventRepository.save(event);

        // بعت notification لكل الـ admins
        sendNotificationToAllAdmins(savedEvent,
                "New Event Pending Review",
                "📋 New event submitted by " + organizerUsername + ": \"" + savedEvent.getTitle() + "\" — Please review and approve or reject it.");

        return mapToResponse(savedEvent);
    }

    public List<EventDto.EventResponse> getMyEvents(String organizerUsername) {
        return eventRepository.findByOrganizerUsernameOrderByCreatedAtDesc(organizerUsername)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public EventDto.EventResponse updateEvent(Long id, EventDto.CreateRequest request,
                                               String username, MultipartFile image) throws IOException {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getOrganizerUsername().equals(username)) {
            throw new RuntimeException("Not authorized to edit this event");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setType(request.getType());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setTotalTickets(request.getTotalTickets());
        event.setPrice(request.getPrice());
        event.setStatus(Event.EventStatus.PENDING);

        if (image != null && !image.isEmpty()) {
            event.setImageUrl(saveImage(image));
        }

        return mapToResponse(eventRepository.save(event));
    }

    public List<EventDto.EventResponse> getPendingEvents() {
        return eventRepository.findByStatusOrderByCreatedAtAsc(Event.EventStatus.PENDING)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<EventDto.EventResponse> getAllEventsAdmin() {
        return eventRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public EventDto.EventResponse approveOrRejectEvent(Long id, EventDto.ApprovalRequest request, String adminUsername) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (request.getApproved()) {
            event.setStatus(Event.EventStatus.APPROVED);
            event.setApprovedAt(LocalDateTime.now());
            event.setApprovedBy(adminUsername);
            sendNotification(event, "APPROVED", "Your event has been approved 🎉");
        } else {
            event.setStatus(Event.EventStatus.REJECTED);
            sendNotification(event, "REJECTED", "Your event was rejected ❌");
        }

        return mapToResponse(eventRepository.save(event));
    }

    public boolean decrementTicket(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (event.getAvailableTickets() <= 0) return false;
        event.setAvailableTickets(event.getAvailableTickets() - 1);
        eventRepository.save(event);
        return true;
    }

    private String saveImage(MultipartFile file) throws IOException {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Files.copy(file.getInputStream(), uploadPath.resolve(filename));
        return "http://localhost:8080/api/uploads/events/" + filename;
    }

    private EventDto.EventResponse mapToResponse(Event event) {
        EventDto.EventResponse response = new EventDto.EventResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setType(event.getType().name());
        response.setLocation(event.getLocation());
        response.setEventDate(event.getEventDate());
        response.setTotalTickets(event.getTotalTickets());
        response.setAvailableTickets(event.getAvailableTickets());
        response.setPrice(event.getPrice());
        response.setImageUrl(event.getImageUrl());
        response.setStatus(event.getStatus().name());
        response.setOrganizerUsername(event.getOrganizerUsername());
        response.setCreatedAt(event.getCreatedAt());
        return response;
    }

    // بعت notification للـ organizer لما الـ admin يوافق أو يرفض
    private void sendNotification(Event event, String type, String message) {
        try {
            String url = "http://localhost:8084/api/notifications";
            Map<String, Object> body = new HashMap<>();
            body.put("username", event.getOrganizerUsername());
            body.put("email", "");
            body.put("title", "Event Update");
            body.put("message", message + " - " + event.getTitle());
            body.put("type", "INFO");
            restTemplate.postForObject(url, body, Void.class);
        } catch (Exception e) {
            log.error("Notification to organizer failed", e);
        }
    }

    // بجيب كل الـ admins من user-service وبعت لكل واحد
    private void sendNotificationToAllAdmins(Event event, String title, String message) {
        try {
            String adminsUrl = "http://localhost:8081/api/users/admins";
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    adminsUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            List<Map<String, Object>> admins = response.getBody();
            if (admins == null || admins.isEmpty()) {
                log.warn("No admins found to notify");
                return;
            }

            for (Map<String, Object> admin : admins) {
                String adminUsername = (String) admin.get("username");
                try {
                    String notifUrl = "http://localhost:8084/api/notifications";
                    Map<String, Object> body = new HashMap<>();
                    body.put("username", adminUsername);
                    body.put("email", "");
                    body.put("title", title);
                    body.put("message", message);
                    body.put("type", "INFO");
                    restTemplate.postForObject(notifUrl, body, Void.class);
                    log.info("Notification sent to admin: {}", adminUsername);
                } catch (Exception e) {
                    log.error("Failed to notify admin: {}", adminUsername, e);
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch admins for notification", e);
        }
    }
}
