package com.example.eventservice.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class EventServiceLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(EventServiceLoggingAspect.class);

    @Around("execution(* com.example.eventservice.service..*(..))")
    public Object logServiceExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        long start = System.currentTimeMillis();
        log.info("[AOP-Event] >>> {}", method);
        try {
            Object result = joinPoint.proceed();
            log.info("[AOP-Event] <<< {} completed in {}ms", method, System.currentTimeMillis() - start);
            return result;
        } catch (Exception ex) {
            log.error("[AOP-Event] ERROR in {}: {}", method, ex.getMessage());
            throw ex;
        }
    }

    @Before("execution(* com.example.eventservice.controller..*(..)) && @annotation(org.springframework.web.bind.annotation.PutMapping)")
    public void logApprovalActions(JoinPoint joinPoint) {
        log.info("[AOP-Audit] Admin action: {} | args count: {}",
                joinPoint.getSignature().getName(), joinPoint.getArgs().length);
    }
}
