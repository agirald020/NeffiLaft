package com.neffi.laft.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestrictiveListEntry {
    private Long codigoLista;
    private String nombre;
    private String tipo;
    private Long prioridadValidacion;
    private String permiteIdentificacion;
    private String permiteHomonimia;
    private Long tipoDocumento;
    private String identificacion;
    private String sdnName;
    private String usuario;
    private LocalDateTime fechaActualizacion;
    private String comentarios;
    private String comentarios2;
    private Long entNum;
    private String tipoLista;
    private String descriTipoLista;
}
