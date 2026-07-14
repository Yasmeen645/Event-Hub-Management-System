package com.example.eventservice.repository;

import com.example.eventservice.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Public: approved events with optional type filter
    List<Event> findByStatusOrderByEventDateAsc(Event.EventStatus status);

    List<Event> findByStatusAndTypeOrderByEventDateAsc(Event.EventStatus status, Event.EventType type);

    // Organizer: their own events
    List<Event> findByOrganizerUsernameOrderByCreatedAtDesc(String organizerUsername);

    // Admin: pending events
    List<Event> findByStatusOrderByCreatedAtAsc(Event.EventStatus status);

    @Query("SELECT e FROM Event e WHERE e.status = :status AND e.organizerUsername = :username")
    List<Event> findByStatusAndOrganizer(@Param("status") Event.EventStatus status,
                                          @Param("username") String username);
}
