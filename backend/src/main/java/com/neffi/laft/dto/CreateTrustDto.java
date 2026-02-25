package com.neffi.laft.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class CreateTrustDto {
    @NotBlank(message = "El código es obligatorio")
    private String code;

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotBlank(message = "El nombre completo es obligatorio")
    private String fullName;

    private String status = "Activo";

    @NotNull(message = "La fecha de constitución es obligatoria")
    private LocalDateTime constitutionDate;

    @NotNull(message = "La vigencia es obligatoria")
    private LocalDateTime validity;

    private List<Map<String, Object>> trustors;
    private List<Map<String, Object>> beneficiaries;
    private Map<String, Object> fiduciary;
}
