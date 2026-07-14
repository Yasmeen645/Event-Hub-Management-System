package com.example.notificationservice.controller;

import com.example.notificationservice.entity.Notification;
import com.example.notificationservice.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody CreateRequest request) {
        return ResponseEntity.ok(notificationService.createNotification(
                request.getUsername(), request.getEmail(),
                request.getTitle(), request.getMessage(),
                request.getType()));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(
            @RequestHeader("X-User-Username") String username) {
        return ResponseEntity.ok(notificationService.getUserNotifications(username));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("X-User-Username") String username) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(username)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    public static class CreateRequest {
        private String username;
        private String email;
        private String title;
        private String message;
        private Notification.NotificationType type;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public Notification.NotificationType getType() { return type; }
        public void setType(Notification.NotificationType type) { this.type = type; }
    }
}
