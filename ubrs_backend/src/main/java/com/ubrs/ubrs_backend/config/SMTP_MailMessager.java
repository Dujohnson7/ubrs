/*package com.ubrs.ubrs_backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SMTP_MailMessager {

    private final JavaMailSender mailSender;

    public void sendMail(String to, String cc, String subject, String body) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setCc(cc);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);

            mailSender.send(mailMessage);

            log.info("Sent mail message to {}", to);

        } catch (MailException e) {
            log.error("Failed to send mail to {}", to, e);
            throw new RuntimeException("Unable to send email. Please check your network connection and try again.");
        }
    }

    public void sendMail(
            String from,
            String to,
            String cc,
            String subject,
            String body
    ) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setCc(cc);
            mailMessage.setFrom(from);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);

            mailSender.send(mailMessage);

            log.info("Sent mail message from {} to {}", from, to);

        } catch (MailException e) {
            log.error("Failed to send mail to {}", to, e);
            throw new RuntimeException("Unable to send email. Please check your network connection and try again.");
        }
    }

    public void sendMail(String to, String subject, String body) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);

            mailSender.send(mailMessage);

            log.info("Sent mail message to {}", to);

        } catch (MailException e) {
            log.error("Failed to send mail to {}", to, e);
            throw new RuntimeException("Unable to send email. Please check your network connection and try again.");
        }
    }
}
*/