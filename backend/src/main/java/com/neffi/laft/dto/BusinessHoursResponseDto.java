package com.neffi.laft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para exponer el estado del horario laboral
 * y el rango horario configurado.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessHoursResponseDto {

    private Boolean isBusinessHours;
    private String startHour;
    private String endHour;
}
