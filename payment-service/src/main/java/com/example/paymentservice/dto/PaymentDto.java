package com.example.paymentservice.dto;

import java.math.BigDecimal;

public class PaymentDto {

    public static class CreatePaymentRequest {
        private Long ticketId;
        private BigDecimal amount;
        private String currency = "usd";
        private String eventTitle;

        public Long getTicketId() { return ticketId; }
        public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getEventTitle() { return eventTitle; }
        public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }
    }

    public static class ConfirmPaymentRequest {
        private String paymentIntentId;
        private Long ticketId;

        public String getPaymentIntentId() { return paymentIntentId; }
        public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }

        public Long getTicketId() { return ticketId; }
        public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    }

    public static class PaymentIntentResponse {
        private String clientSecret;
        private String paymentIntentId;
        private String publishableKey;

        public PaymentIntentResponse(String clientSecret, String paymentIntentId, String publishableKey) {
            this.clientSecret = clientSecret;
            this.paymentIntentId = paymentIntentId;
            this.publishableKey = publishableKey;
        }

        public String getClientSecret() { return clientSecret; }
        public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

        public String getPaymentIntentId() { return paymentIntentId; }
        public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }

        public String getPublishableKey() { return publishableKey; }
        public void setPublishableKey(String publishableKey) { this.publishableKey = publishableKey; }
    }

    public static class PaymentResponse {
        private String paymentId;
        private String status;
        private Long ticketId;

        public PaymentResponse(String paymentId, String status, Long ticketId) {
            this.paymentId = paymentId;
            this.status = status;
            this.ticketId = ticketId;
        }

        public String getPaymentId() { return paymentId; }
        public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Long getTicketId() { return ticketId; }
        public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    }
}
