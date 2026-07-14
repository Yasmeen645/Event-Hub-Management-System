package com.example.eventservice.dto;

import com.example.eventservice.entity.Event;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EventDto {

    public static class CreateRequest {
        @NotBlank
        private String title;
        private String description;

        @NotNull
        private Event.EventType type;

        @NotBlank
        private String location;

        @NotNull
        private LocalDateTime eventDate;

        @NotNull
        @Min(1)
        private Integer totalTickets;

        @NotNull
        @DecimalMin("0.0")
        private BigDecimal price;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Event.EventType getType() { return type; }
        public void setType(Event.EventType type) { this.type = type; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public LocalDateTime getEventDate() { return eventDate; }
        public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

        public Integer getTotalTickets() { return totalTickets; }
        public void setTotalTickets(Integer totalTickets) { this.totalTickets = totalTickets; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }

    public static class EventResponse {
        private Long id;
        private String title;
        private String description;
        private String type;
        private String location;
        private LocalDateTime eventDate;
        private Integer totalTickets;
        private Integer availableTickets;
        private BigDecimal price;
        private String imageUrl;
        private String status;
        private String organizerUsername;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public LocalDateTime getEventDate() { return eventDate; }
        public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

        public Integer getTotalTickets() { return totalTickets; }
        public void setTotalTickets(Integer totalTickets) { this.totalTickets = totalTickets; }

        public Integer getAvailableTickets() { return availableTickets; }
        public void setAvailableTickets(Integer availableTickets) { this.availableTickets = availableTickets; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getOrganizerUsername() { return organizerUsername; }
        public void setOrganizerUsername(String organizerUsername) { this.organizerUsername = organizerUsername; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class ApprovalRequest {
        @NotNull
        private Boolean approved;
        private String reason;

        public Boolean getApproved() { return approved; }
        public void setApproved(Boolean approved) { this.approved = approved; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
