package com.neffi.laft.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class Utils {
    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken) {
            Jwt jwt = ((JwtAuthenticationToken) auth).getToken();
            return jwt.getClaim("preferred_username");
        }
        return null;
    }

    /**
     * Obtiene el nombre completo del usuario autenticado a partir del JWT de Keycloak.
     * <p>
     * Prioridad de claims:
     * <ol>
     *   <li>{@code name} — nombre completo generado por Keycloak (given_name + family_name).</li>
     *   <li>{@code given_name} + {@code family_name} — concatenados si {@code name} no está presente.</li>
     *   <li>{@code preferred_username} — como último recurso.</li>
     * </ol>
     *
     * @return nombre completo del usuario, o {@code null} si no hay autenticación activa
     */
    public String getCurrentFullName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof JwtAuthenticationToken)) {
            return null;
        }
        Jwt jwt = ((JwtAuthenticationToken) auth).getToken();

        String fullName = jwt.getClaimAsString("name");
        if (fullName != null && !fullName.isBlank()) {
            return fullName.trim();
        }

        String givenName = jwt.getClaimAsString("given_name");
        String familyName = jwt.getClaimAsString("family_name");
        if (givenName != null || familyName != null) {
            return String.join(" ",
                java.util.Arrays.stream(new String[]{ givenName, familyName })
                    .filter(s -> s != null && !s.isBlank())
                    .toArray(String[]::new));
        }

        return jwt.getClaimAsString("preferred_username");
    }

    public String getClientIp(HttpServletRequest request) {
        // Intenta obtener IP desde X-Forwarded-For (si está detrás de proxy)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Si hay múltiples IPs (proxy chain), toma la primera
            return xForwardedFor.split(",")[0].trim();
        }
        
        // Intenta obtener IP desde X-Real-IP (nginx, etc)
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        // Obtiene la IP remota directa del socket
        return request.getRemoteAddr();
    }
}
