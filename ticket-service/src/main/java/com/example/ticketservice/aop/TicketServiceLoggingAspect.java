package com.example.ticketservice.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TicketServiceLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(TicketServiceLoggingAspect.class);

    @Around("execution(* com.example.ticketservice.service..*(..))")
    public Object logServiceExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        long start = System.currentTimeMillis();
        log.info("[AOP-Ticket] >>> {}", method);
        try {
            Object result = joinPoint.proceed();
            log.info("[AOP-Ticket] <<< {} in {}ms", method, System.currentTimeMillis() - start);
            return result;
        } catch (Exception ex) {
            log.error("[AOP-Ticket] ERROR in {}: {}", method, ex.getMessage());
            throw ex;
        }
    }
}
