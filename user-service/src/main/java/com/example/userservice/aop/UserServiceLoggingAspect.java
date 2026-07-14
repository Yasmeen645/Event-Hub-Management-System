package com.example.userservice.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class UserServiceLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(UserServiceLoggingAspect.class);

    @Around("execution(* com.example.userservice.service..*(..))")
    public Object logServicePerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        log.info("[AOP] Entering: {} | Args: {}", method, Arrays.toString(joinPoint.getArgs()));
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            log.info("[AOP] Completed: {} | Duration: {}ms", method, duration);
            return result;
        } catch (Exception ex) {
            log.error("[AOP] Exception in: {} | Error: {}", method, ex.getMessage());
            throw ex;
        }
    }

    @Before("execution(* com.example.userservice.controller..*(..))")
    public void logControllerEntry(JoinPoint joinPoint) {
        log.debug("[AOP] Controller called: {}", joinPoint.getSignature().getName());
    }

    @AfterReturning(pointcut = "execution(* com.example.userservice.controller..*(..))", returning = "result")
    public void logControllerReturn(JoinPoint joinPoint, Object result) {
        log.debug("[AOP] Controller returned: {}", joinPoint.getSignature().getName());
    }

    @AfterThrowing(pointcut = "execution(* com.example.userservice..*(..))", throwing = "ex")
    public void logException(JoinPoint joinPoint, Exception ex) {
        log.error("[AOP-EXCEPTION] Method: {} | Exception: {} | Message: {}",
                joinPoint.getSignature().toShortString(),
                ex.getClass().getSimpleName(),
                ex.getMessage());
    }
}
