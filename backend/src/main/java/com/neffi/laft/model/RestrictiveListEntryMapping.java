package com.neffi.laft.model;

import jakarta.persistence.ColumnResult;
import jakarta.persistence.ConstructorResult;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.SqlResultSetMapping;

import com.neffi.laft.dto.RestrictiveListEntry;

/**
 * Entity used solely to declare the SQL result set mapping that converts
 * the rows returned by the Oracle function into {@link RestrictiveListEntry}
 * DTO instances.  This class is never persisted.
 */
@Entity
@SqlResultSetMapping(
    name = "RestrictiveListEntryMapping",
    classes = @ConstructorResult(
        targetClass = com.neffi.laft.dto.RestrictiveListEntry.class,
        columns = {
            @ColumnResult(name = "CODIGO_LISTA", type = Long.class),
            @ColumnResult(name = "NOMBRE", type = String.class),
            @ColumnResult(name = "TIPO", type = String.class),
            @ColumnResult(name = "PRIORIDAD_VALIDACION", type = Long.class),
            @ColumnResult(name = "PERMITE_IDENTIFICACION", type = String.class),
            @ColumnResult(name = "ERMITE_HOMONIMIA", type = String.class),
            @ColumnResult(name = "TIPO_DOCUMENTO", type = Long.class),
            @ColumnResult(name = "IDENTIFICACION", type = String.class),
            @ColumnResult(name = "SDN_NAME", type = String.class),
            @ColumnResult(name = "USUARIO", type = String.class),
            @ColumnResult(name = "FECHA_ACTUALIZACION", type = java.time.LocalDateTime.class),
            @ColumnResult(name = "COMENTARIOS", type = String.class),
            @ColumnResult(name = "COMENTARIOS2", type = String.class),
            @ColumnResult(name = "ENT_NUM", type = Long.class),
            @ColumnResult(name = "TIPO_LISTA", type = String.class),
            @ColumnResult(name = "DESCRI_TIPO_LISTA", type = String.class)
        }
    )
)
public class RestrictiveListEntryMapping {
    // dummy id to satisfy JPA requirement; value is never used
    @Id
    private Long id;
}
