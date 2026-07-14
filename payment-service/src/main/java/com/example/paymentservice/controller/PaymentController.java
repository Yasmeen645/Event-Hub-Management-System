package com.example.paymentservice.controller;

import com.example.paymentservice.dto.PaymentDto;
import com.example.paymentservice.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentDto.PaymentIntentResponse> createPaymentIntent(
            @RequestBody PaymentDto.CreatePaymentRequest request,
            @RequestHeader("X-User-Username") String username) {
        return ResponseEntity.ok(paymentService.createPaymentIntent(request, username));
    }

    @PostMapping("/confirm")
    public ResponseEntity<PaymentDto.PaymentResponse> confirmPayment(
            @RequestBody PaymentDto.ConfirmPaymentRequest request,
            @RequestHeader("X-User-Username") String username) {
        return ResponseEntity.ok(paymentService.confirmPayment(request, username));
    }

    @GetMapping("/my-payments")
    public ResponseEntity<?> getMyPayments(@RequestHeader("X-User-Username") String username) {
        return ResponseEntity.ok(paymentService.getUserPayments(username));
    }
}
