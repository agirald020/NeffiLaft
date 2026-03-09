package com.neffi.laft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para representar los tipos de documentos en las respuestas HTTP.
 * Se utiliza para transferencia de datos entre la capa de servicio y los controladores.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TiposDocumentosDTO {
    private Long codigo;
    private String nombre;
    private String descripcion;
    private String codHomologa;
    private String codHomologaSifi;
}
