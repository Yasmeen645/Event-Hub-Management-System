package com.example.gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Reactive-compatible request logger.
 * Replaces the previous Spring AOP aspect which does not work
 * on Spring WebFlux (reactive) applications.
 */
@Component
public class GatewayLoggingAspect implements WebFilter {

    private static final Logger log = LoggerFactory.getLogger(GatewayLoggingAspect.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        long start = System.currentTimeMillis();
        String method = exchange.getRequest().getMethod().name();
        String path = exchange.getRequest().getPath().toString();

        log.debug("[Gateway] >>> {} {}", method, path);

        return chain.filter(exchange).doFinally(signal -> {
            long duration = System.currentTimeMillis() - start;
            int status = exchange.getResponse().getStatusCode() != null
                    ? exchange.getResponse().getStatusCode().value() : 0;
            log.debug("[Gateway] <<< {} {} | status={} | {}ms", method, path, status, duration);
        });
    }
}
