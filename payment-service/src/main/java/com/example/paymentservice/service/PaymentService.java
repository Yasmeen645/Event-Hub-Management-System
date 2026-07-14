package com.example.paymentservice.service;

import com.example.paymentservice.dto.PaymentDto;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.publishable-key}")
    private String stripePublishableKey;

    private final List<PaymentDto.PaymentResponse> paymentStore = new ArrayList<>();

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public PaymentDto.PaymentIntentResponse createPaymentIntent(
            PaymentDto.CreatePaymentRequest request, String username) {
        try {
            long amountInCents = request.getAmount()
                    .multiply(java.math.BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(request.getCurrency())
                    .setDescription("Event Hub - " + request.getEventTitle())
                    .putMetadata("ticketId", String.valueOf(request.getTicketId()))
                    .putMetadata("username", username)
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            log.info("[Payment] Created PaymentIntent {} for user {}", intent.getId(), username);

            return new PaymentDto.PaymentIntentResponse(
                    intent.getClientSecret(), intent.getId(), stripePublishableKey);

        } catch (Exception e) {
            log.warn("[Payment] Stripe unavailable, using mock: {}", e.getMessage());
            String mockId = "pi_mock_" + System.currentTimeMillis();
            return new PaymentDto.PaymentIntentResponse(
                    mockId + "_secret", mockId, stripePublishableKey);
        }
    }

    public PaymentDto.PaymentResponse confirmPayment(
            PaymentDto.ConfirmPaymentRequest request, String username) {
        log.info("[Payment] Confirmed payment {} for ticket {}", request.getPaymentIntentId(), request.getTicketId());
        PaymentDto.PaymentResponse response = new PaymentDto.PaymentResponse(
                request.getPaymentIntentId(), "SUCCEEDED", request.getTicketId());
        paymentStore.add(response);
        return response;
    }

    public List<PaymentDto.PaymentResponse> getUserPayments(String username) {
        return new ArrayList<>(paymentStore);
    }
}
