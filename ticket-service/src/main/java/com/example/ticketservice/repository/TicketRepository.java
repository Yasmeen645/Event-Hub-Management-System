package com.example.ticketservice.repository;

import com.example.ticketservice.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUserUsernameOrderByCreatedAtDesc(String username);
    List<Ticket> findByEventIdOrderByCreatedAtDesc(Long eventId);
    Optional<Ticket> findByTicketNumber(String ticketNumber);
    Optional<Ticket> findByPaymentId(String paymentId);
    boolean existsByUserUsernameAndEventIdAndStatusNot(String username, Long eventId, Ticket.TicketStatus status);
}
