package com.neffi.laft.controller;

import com.neffi.laft.dto.BusinessHoursResponseDto;
import com.neffi.laft.dto.ResponseBase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    @Value("${app.bypass-auth:false}")
    private boolean bypassAuth;

    @Value("${keycloak.auth-server-url}")
    private String keycloakUrl;

    @Value("${app.businessHours.start}")
    private String businessHourStart;

    @Value("${app.businessHours.end}")
    private String businessHourEnd;

    //Se usa
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

    @GetMapping("/keycloak-config")
    public Map<String, Object> getKeycloakConfig() {
        return Map.of(
                "url", keycloakUrl,
                "realm", "neffiLaft",
                "clientId", "neffiLaft-app",
                "bypassActive", bypassAuth);
    }

    /**
     * Evalua si la hora actual del servidor esta dentro del horario laboral
     * configurado por variables de entorno.
     * <p>
     * El horario se interpreta en formato de 24 horas (`HH:mm`) y se toma desde:
     * `app.businessHours.start` y `app.businessHours.end`.
     * </p>
     *
     * @return respuesta estandar con el resultado booleano y las horas
     *         parametrizadas.
     */
    @GetMapping("/business-hours")
    public ResponseEntity<ResponseBase<BusinessHoursResponseDto>> isBusinessHours() {
        LocalTime startTime = LocalTime.parse(businessHourStart);
        LocalTime endTime = LocalTime.parse(businessHourEnd);
        LocalTime now = LocalTime.now();

        boolean inBusinessHours = !now.isBefore(startTime) && !now.isAfter(endTime);

        BusinessHoursResponseDto data = BusinessHoursResponseDto.builder()
            .isBusinessHours(inBusinessHours)
            .startHour(businessHourStart)
            .endHour(businessHourEnd)
            .build();

        return ResponseEntity.ok(ResponseBase.success(data));
    }
}
