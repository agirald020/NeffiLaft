package com.neffi.laft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ButValidarListasParams {
    private String identificacion;
    private String nombre1;
    private String nombre2;
    private String apellido1;
    private String apellido2;
    private String proceso;
    private String retornaLinf;
    private String usuario;
    private String terminal;
    private String descripcionEvento;
}