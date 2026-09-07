package com.ubrs.ubrs_backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class MailMessager {

    @Value("${mailjet.api-key}")
    private String apiKey;

    @Value("${mailjet.secret-key}")
    private String secretKey;

    @Value("${mailjet.from-email}")
    private String fromEmail;

    @Value("${mailjet.from-name:GovShare}")
    private String fromName;

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://api.mailjet.com")
            .build();


    /**
     * Send email with CC
     */
    public void sendMail(
            String to,
            String cc,
            String subject,
            String body
    ) {

        send(
                fromEmail,
                to,
                cc,
                subject,
                body
        );
    }


    /**
     * Send email with custom From address
     */
    public void sendMail(
            String from,
            String to,
            String cc,
            String subject,
            String body
    ) {

        send(
                from,
                to,
                cc,
                subject,
                body
        );
    }


    /**
     * Send simple email
     */
    public void sendMail(
            String to,
            String subject,
            String body
    ) {

        send(
                fromEmail,
                to,
                null,
                subject,
                body
        );
    }


    /**
     * Internal Mailjet API method
     */
    private void send(
            String from,
            String to,
            String cc,
            String subject,
            String body
    ) {

        try {

            Map<String, Object> message = new HashMap<>();

            // Sender
            Map<String, String> sender = new HashMap<>();
            sender.put("Email", from);
            sender.put("Name", fromName);

            // Recipient
            Map<String, String> recipient = new HashMap<>();
            recipient.put("Email", to);

            message.put("From", sender);
            message.put("To", new Map[]{recipient});
            message.put("Subject", subject);
            message.put("TextPart", body);

            // CC
            if (cc != null && !cc.isBlank()) {

                Map<String, String> ccRecipient = new HashMap<>();
                ccRecipient.put("Email", cc);

                message.put(
                        "Cc",
                        new Map[]{ccRecipient}
                );
            }

            Map<String, Object> request = new HashMap<>();

            request.put(
                    "Messages",
                    new Map[]{message}
            );

            // Mailjet uses Basic Authentication
            String credentials = apiKey + ":" + secretKey;

            String encodedCredentials =
                    Base64.getEncoder()
                            .encodeToString(
                                    credentials.getBytes(StandardCharsets.UTF_8)
                            );

            restClient.post()
                    .uri("/v3.1/send")
                    .header(
                            "Authorization",
                            "Basic " + encodedCredentials
                    )
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();

            log.info(
                    "Email sent successfully to {}",
                    to
            );

        } catch (Exception e) {

            log.error(
                    "Failed to send email to {}",
                    to,
                    e
            );

            throw new RuntimeException(
                    "Unable to send email. Please try again later."
            );
        }
    }
}