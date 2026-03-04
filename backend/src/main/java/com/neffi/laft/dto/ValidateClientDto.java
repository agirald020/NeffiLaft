package com.neffi.laft.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateClientDto {
    private String P_IDENTIFICACION;
    private String P_NOMBRE_1;
    private String P_NOMBRE_2;
    private String P_APELLIDO_1;
    private String P_APELLIDO_2;
}
