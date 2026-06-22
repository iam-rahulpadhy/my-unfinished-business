package com.mub.myunfinishedbusiness.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Autowired;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetToken(String toEmail, String token) {
        String subject = "My Unfinished Business - Password Reset Request";
        String message = "You have requested to reset your password.\n\n" +
                "Please use the following 6-digit code to reset your password:\n\n" +
                token + "\n\n" +
                "If you did not request this, please ignore this email.";

        log.info("==================================================");
        log.info("MOCK EMAIL SENT TO: {}", toEmail);
        log.info("SUBJECT: {}", subject);
        log.info("BODY:\n{}", message);
        log.info("==================================================");

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom("rahulpadhy58@gmail.com");
            mailMessage.setTo(toEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            
            if (mailSender != null) {
                mailSender.send(mailMessage);
                log.info("Real email successfully dispatched!");
            } else {
                log.warn("JavaMailSender is null. Cannot send real email.");
            }
        } catch (Exception e) {
            log.error("Failed to send real email. Error: {}", e.getMessage(), e);
        }
    }
}
