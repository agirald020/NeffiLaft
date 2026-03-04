package com.neffi.laft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ValidateClientDto {
    private String p_IDENTIFICACION;
    private String p_NOMBRE_1;
    private String p_NOMBRE_2;
    private String p_APELLIDO_1;
    private String p_APELLIDO_2;
}
