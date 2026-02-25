package com.neffi.laft.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateContractDto {
    @NotBlank(message = "El objeto del contrato es obligatorio")
    private String purpose;

    @NotBlank(message = "Las obligaciones son obligatorias")
    private String obligations;

    @NotBlank(message = "La remuneración es obligatoria")
    private String remuneration;
}
