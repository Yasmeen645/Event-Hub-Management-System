package com.example.ticketservice.controller;

import com.example.ticketservice.dto.TicketDto;
import com.example.ticketservice.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/book")
    public ResponseEntity<TicketDto.TicketResponse> bookTicket(
            @Valid @RequestBody TicketDto.BookingRequest request,
            @RequestHeader("X-User-Username") String username,
            @RequestHeader(value = "X-User-Id", defaultValue = "0") Long userId) {
        return ResponseEntity.ok(ticketService.bookTicket(request, username, userId));
    }

    @PutMapping("/{id}/confirm-payment")
    public ResponseEntity<TicketDto.TicketResponse> confirmPayment(
            @PathVariable Long id,
            @RequestBody TicketDto.PaymentConfirmRequest request,
            @RequestHeader("X-User-Username") String username) {
        return ResponseEntity.ok(ticketService.confirmPayment(id, request.getPaymentId()));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<List<TicketDto.TicketResponse>> getMyTickets(
            @RequestHeader("X-User-Username") String username) {
        return ResponseEntity.ok(ticketService.getUserTickets(username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDto.TicketResponse> getTicketById(
            @PathVariable Long id,
            @RequestHeader("X-User-Username") String username) {
        return ResponseEntity.ok(ticketService.getTicketById(id, username));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadTicket(
            @PathVariable Long id,
            @RequestHeader("X-User-Username") String username) {
        byte[] pdf = ticketService.downloadTicketPdf(id, username);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ticket_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
