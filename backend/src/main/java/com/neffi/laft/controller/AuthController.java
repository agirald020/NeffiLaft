package com.neffi.laft.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    @Value("${app.bypass-auth:false}")
    private boolean bypassAuth;

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        if (bypassAuth || jwt == null) {
            return ResponseEntity.ok(Map.of(
                "id", "dev-user",
                "username", "dev@bypass",
                "email", "dev@bypass.local",
                "name", "Usuario de Desarrollo",
                "roles", List.of("admin", "user")
            ));
        }

        Map<String, Object> user = Map.of(
            "id", jwt.getSubject(),
            "username", jwt.getClaimAsString("preferred_username"),
            "email", jwt.getClaimAsString("email") != null ? jwt.getClaimAsString("email") : "",
            "name", jwt.getClaimAsString("name") != null ? jwt.getClaimAsString("name") : jwt.getClaimAsString("preferred_username"),
            "roles", jwt.getClaimAsStringList("roles") != null ? jwt.getClaimAsStringList("roles") : List.of()
        );

        return ResponseEntity.ok(user);
    }
}
