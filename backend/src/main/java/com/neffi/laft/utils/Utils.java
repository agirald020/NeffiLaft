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
