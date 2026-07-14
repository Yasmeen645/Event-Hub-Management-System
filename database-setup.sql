-- ============================================================
-- EventHub - SQL Server Database Setup Script
-- Run this on your SQL Server instance before starting services
-- ============================================================

-- Create databases
CREATE DATABASE eventHub_users;
CREATE DATABASE eventHub_events;
CREATE DATABASE eventHub_tickets;
CREATE DATABASE eventHub_notifications;
CREATE DATABASE eventHub_payments;
GO

-- ============================================================
-- eventHub_users database
-- ============================================================
USE eventHub_users;
GO

CREATE TABLE users (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    username    NVARCHAR(50)  NOT NULL UNIQUE,
    email       NVARCHAR(150) NOT NULL UNIQUE,
    password    NVARCHAR(255) NOT NULL,
    role        NVARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN','ORGANIZER','PARTICIPANT')),
    is_active   BIT           NOT NULL DEFAULT 1,
    created_at  DATETIME2     DEFAULT GETDATE()
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, role, is_active)
VALUES (
    'admin',
    'admin@eventhub.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwMwHaKFmEJy',
    'ADMIN',
    1
);
GO

-- ============================================================
-- eventHub_events database
-- ============================================================
USE eventHub_events;
GO

CREATE TABLE events (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    title               NVARCHAR(200)  NOT NULL,
    description         NVARCHAR(MAX),
    type                NVARCHAR(30)   NOT NULL,
    location            NVARCHAR(200)  NOT NULL,
    event_date          DATETIME2      NOT NULL,
    total_tickets       INT            NOT NULL,
    available_tickets   INT            NOT NULL,
    price               DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    image_url           NVARCHAR(500),
    status              NVARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
    organizer_username  NVARCHAR(50)   NOT NULL,
    organizer_id        BIGINT,
    created_at          DATETIME2      DEFAULT GETDATE(),
    approved_at         DATETIME2,
    approved_by         NVARCHAR(50)
);

CREATE INDEX idx_events_status      ON events(status);
CREATE INDEX idx_events_type        ON events(type);
CREATE INDEX idx_events_organizer   ON events(organizer_username);
GO

-- ============================================================
-- eventHub_tickets database
-- ============================================================
USE eventHub_tickets;
GO

CREATE TABLE tickets (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    ticket_number   NVARCHAR(30)   NOT NULL UNIQUE,
    event_id        BIGINT         NOT NULL,
    event_title     NVARCHAR(200)  NOT NULL,
    event_date      DATETIME2,
    event_location  NVARCHAR(200),
    user_id         BIGINT         NOT NULL,
    user_username   NVARCHAR(50)   NOT NULL,
    price           DECIMAL(10,2)  NOT NULL,
    status          NVARCHAR(20)   NOT NULL DEFAULT 'PENDING_PAYMENT'
                    CHECK (status IN ('PENDING_PAYMENT','PAID','CANCELLED')),
    payment_id      NVARCHAR(200),
    qr_code_data    NVARCHAR(200),
    created_at      DATETIME2      DEFAULT GETDATE()
);

CREATE INDEX idx_tickets_user    ON tickets(user_username);
CREATE INDEX idx_tickets_event   ON tickets(event_id);
GO

-- ============================================================
-- eventHub_notifications database
-- ============================================================
USE eventHub_notifications;
GO

CREATE TABLE notifications (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    recipient_username  NVARCHAR(50)  NOT NULL,
    recipient_email     NVARCHAR(150),
    title               NVARCHAR(200) NOT NULL,
    message             NVARCHAR(MAX),
    type                NVARCHAR(30),
    is_read             BIT           NOT NULL DEFAULT 0,
    created_at          DATETIME2     DEFAULT GETDATE()
);

CREATE INDEX idx_notif_user ON notifications(recipient_username);
GO

-- ============================================================
-- eventHub_payments database
-- ============================================================
USE eventHub_payments;
GO

CREATE TABLE payments (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    payment_intent_id   NVARCHAR(200) UNIQUE,
    ticket_id       BIGINT         NOT NULL,
    amount          DECIMAL(10,2)  NOT NULL,
    currency        NVARCHAR(10)   NOT NULL DEFAULT 'usd',
    status          NVARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    username        NVARCHAR(50)   NOT NULL,
    created_at      DATETIME2      DEFAULT GETDATE()
);
GO

PRINT 'All EventHub databases and tables created successfully!';
