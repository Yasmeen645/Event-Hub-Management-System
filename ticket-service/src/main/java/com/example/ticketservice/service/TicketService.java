package com.example.ticketservice.service;

import com.example.ticketservice.dto.TicketDto;
import com.example.ticketservice.entity.Ticket;
import com.example.ticketservice.repository.TicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final PdfGeneratorService pdfGeneratorService;
    private final WebClient.Builder webClientBuilder;

    @Value("${services.event-service}")
    private String eventServiceUrl;

    public TicketService(TicketRepository ticketRepository,
                         PdfGeneratorService pdfGeneratorService,
                         WebClient.Builder webClientBuilder) {
        this.ticketRepository = ticketRepository;
        this.pdfGeneratorService = pdfGeneratorService;
        this.webClientBuilder = webClientBuilder;
    }

    public TicketDto.TicketResponse bookTicket(TicketDto.BookingRequest request,
                                                String username, Long userId) {
        if (ticketRepository.existsByUserUsernameAndEventIdAndStatusNot(
                username, request.getEventId(), Ticket.TicketStatus.CANCELLED)) {
            throw new RuntimeException("You have already booked this event");
        }

        Boolean decremented = webClientBuilder.build()
                .put()
                .uri(eventServiceUrl + "/api/events/" + request.getEventId() + "/decrement-ticket")
                .retrieve()
                .bodyToMono(Boolean.class)
                .block();

        if (Boolean.FALSE.equals(decremented)) {
            throw new RuntimeException("No tickets available for this event");
        }

        Ticket ticket = Ticket.builder()
                .eventId(request.getEventId())
                .eventTitle(request.getEventTitle())
                .eventDate(request.getEventDate())
                .eventLocation(request.getEventLocation())
                .userId(userId)
                .userUsername(username)
                .price(request.getPrice())
                .status(Ticket.TicketStatus.PENDING_PAYMENT)
                .build();

        return mapToResponse(ticketRepository.save(ticket));
    }

    public TicketDto.TicketResponse confirmPayment(Long ticketId, String paymentId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(Ticket.TicketStatus.PAID);
        ticket.setPaymentId(paymentId);
        return mapToResponse(ticketRepository.save(ticket));
    }

    public List<TicketDto.TicketResponse> getUserTickets(String username) {
        return ticketRepository.findByUserUsernameOrderByCreatedAtDesc(username)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public TicketDto.TicketResponse getTicketById(Long id, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        if (!ticket.getUserUsername().equals(username)) {
            throw new RuntimeException("Not authorized to view this ticket");
        }
        return mapToResponse(ticket);
    }

    public byte[] downloadTicketPdf(Long id, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        if (!ticket.getUserUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }
        if (ticket.getStatus() != Ticket.TicketStatus.PAID) {
            throw new RuntimeException("Ticket is not paid yet");
        }
        return pdfGeneratorService.generateTicketPdf(ticket);
    }

    private TicketDto.TicketResponse mapToResponse(Ticket ticket) {
        TicketDto.TicketResponse response = new TicketDto.TicketResponse();
        response.setId(ticket.getId());
        response.setTicketNumber(ticket.getTicketNumber());
        response.setEventId(ticket.getEventId());
        response.setEventTitle(ticket.getEventTitle());
        response.setEventDate(ticket.getEventDate());
        response.setEventLocation(ticket.getEventLocation());
        response.setUserUsername(ticket.getUserUsername());
        response.setPrice(ticket.getPrice());
        response.setStatus(ticket.getStatus().name());
        response.setPaymentId(ticket.getPaymentId());
        response.setCreatedAt(ticket.getCreatedAt());
        return response;
    }
}
