package com.neffi.laft.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad JPA que mapea la tabla ACCION.TIPOS_DOCUMENTOS.
 * Representa los tipos de documentos disponibles en el sistema.
 */
@Entity
@Table(name = "TIPOS_DOCUMENTOS", schema = "ACCION")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TiposDocumentos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODIGO")
    private Long codigo;

    @Column(name = "NOMBRE", length = 50)
    private String nombre;

    @Column(name = "DESCRIPCION", length = 256)
    private String descripcion;

    @Column(name = "COD_HOMOLOGA", length = 4)
    private String codHomologa;

    @Column(name = "COD_HOMOLOGA_SIFI", length = 1)
    private String codHomologaSifi;
}
