package com.neffi.laft.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ValidateClientDto {
    @NotBlank(message = "El tipo de documento es requerido")
    private String documentType;

    @NotBlank(message = "El número de documento es requerido")
    private String documentNumber;

    private String fullName;
}
