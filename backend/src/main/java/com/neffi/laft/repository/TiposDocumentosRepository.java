package com.neffi.laft.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.neffi.laft.model.TiposDocumentos;

/**
 * Repositorio Spring Data JPA para la entidad TiposDocumentos.
 * Proporciona acceso a datos para la tabla ACCION.TIPOS_DOCUMENTOS.
 */
@Repository
public interface TiposDocumentosRepository extends JpaRepository<TiposDocumentos, Long> {
    /**
     * Busca un tipo de documento por su código de homologación.
     * @param codHomologa
     * @return
     */
    public TiposDocumentos findByCodHomologa(String codHomologa);
}
