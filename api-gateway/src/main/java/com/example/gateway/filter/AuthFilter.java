package com.example.gateway.filter;

import com.example.gateway.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthFilter extends AbstractGatewayFilterFactory<AuthFilter.Config> {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    public AuthFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getPath().toString();
            log.info("[Gateway] Request: {} {}", exchange.getRequest().getMethod(), path);

            // Skip auth for public paths
            if (config.getSkipPaths() != null) {
                for (String skipPath : config.getSkipPaths().split(",")) {
                    if (path.contains(skipPath.trim())) {
                        return chain.filter(exchange);
                    }
                }
            }

            // Also skip GET /api/events (public listing)
            if (exchange.getRequest().getMethod().name().equals("GET") && path.startsWith("/api/events")) {
                return chain.filter(exchange);
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("[Gateway] Missing or invalid Authorization header for path: {}", path);
                return onUnauthorized(exchange);
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.isTokenValid(token)) {
                log.warn("[Gateway] Invalid JWT token for path: {}", path);
                return onUnauthorized(exchange);
            }

            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);
            String userId = jwtUtil.extractUserId(token);
            log.info("[Gateway] Authenticated user: {} role: {} id: {} -> {}", username, role, userId, path);

            // Forward user info to downstream services
            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(r -> r.header("X-User-Username", username)
                                   .header("X-User-Role", role)
                                   .header("X-User-Id", userId))
                    .build();

            return chain.filter(mutatedExchange);
        };
    }

    private Mono<Void> onUnauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        private String skipPaths;

        public String getSkipPaths() { return skipPaths; }
        public void setSkipPaths(String skipPaths) { this.skipPaths = skipPaths; }
    }
}
