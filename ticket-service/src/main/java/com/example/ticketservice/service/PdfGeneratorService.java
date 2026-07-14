package com.example.ticketservice.service;

import com.example.ticketservice.entity.Ticket;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.image.ImageDataFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service

public class PdfGeneratorService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PdfGeneratorService.class);

    public byte[] generateTicketPdf(Ticket ticket) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            DeviceRgb primaryColor = new DeviceRgb(79, 70, 229);
            DeviceRgb lightBg = new DeviceRgb(238, 242, 255);

            // Header
            Paragraph header = new Paragraph("🎫 EVENT HUB TICKET")
                    .setFontSize(24)
                    .setBold()
                    .setFontColor(primaryColor)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(10);
            document.add(header);

            // Divider
            document.add(new Paragraph("─────────────────────────────────────────")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10));

            // Ticket Number
            Paragraph ticketNum = new Paragraph("Ticket #: " + ticket.getTicketNumber())
                    .setFontSize(14)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBackgroundColor(lightBg)
                    .setPadding(8)
                    .setMarginTop(10)
                    .setMarginBottom(10);
            document.add(ticketNum);

            // Event Details Table
            Table table = new Table(UnitValue.createPercentArray(new float[]{35, 65}));
            table.setWidth(UnitValue.createPercentValue(100));

            addTableRow(table, "Event", ticket.getEventTitle(), primaryColor);
            addTableRow(table, "Date", ticket.getEventDate() != null ?
                    ticket.getEventDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")) : "TBD", primaryColor);
            addTableRow(table, "Location", ticket.getEventLocation() != null ? ticket.getEventLocation() : "TBD", primaryColor);
            addTableRow(table, "Attendee", ticket.getUserUsername(), primaryColor);
            addTableRow(table, "Price", String.format("$%.2f", ticket.getPrice().doubleValue()), primaryColor);
            addTableRow(table, "Status", ticket.getStatus().name(), primaryColor);

            document.add(table);

            // QR Code
            try {
                byte[] qrImage = generateQrCode(ticket.getQrCodeData(), 200, 200);
                Image qrImg = new Image(ImageDataFactory.create(qrImage));
                qrImg.setHorizontalAlignment(HorizontalAlignment.CENTER);
                qrImg.setMarginTop(20);
                document.add(qrImg);

                document.add(new Paragraph("Scan QR code at the event entrance")
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontSize(10)
                        .setFontColor(ColorConstants.GRAY));
            } catch (Exception e) {
                log.warn("Could not generate QR code: {}", e.getMessage());
            }

            // Footer
            document.add(new Paragraph("\nThank you for using Event Hub!")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10)
                    .setFontColor(ColorConstants.GRAY)
                    .setMarginTop(20));

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating PDF ticket: {}", e.getMessage());
            throw new RuntimeException("Failed to generate ticket PDF", e);
        }
    }

    private void addTableRow(Table table, String label, String value, DeviceRgb primaryColor) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setBold().setFontColor(primaryColor))
                .setPadding(8);
        Cell valueCell = new Cell()
                .add(new Paragraph(value))
                .setPadding(8);
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private byte[] generateQrCode(String content, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
        return baos.toByteArray();
    }
}
