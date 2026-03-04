package com.neffi.laft.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.neffi.laft.dto.ButValidarListasParams;
import com.neffi.laft.dto.RestrictiveListEntry;
import com.neffi.laft.model.RestrictiveListEntryMapping;

@Repository
public interface RestrictiveListRepository extends JpaRepository<RestrictiveListEntryMapping, Long> {

    /**
     * Ejecuta la función BUT_VALIDAR_LISTAS con los parámetros proporcionados y devuelve las coincidencias encontradas.
     * @param params
     * @return
     */
    @Query(value = "SELECT BUT_VALIDAR_LISTAS(" +
            ":#{#params.identificacion}," +
            ":#{#params.nombre1}," +
            ":#{#params.nombre2}," +
            ":#{#params.apellido1}," +
            ":#{#params.apellido2}," +
            ":#{#params.proceso}," +
            ":#{#params.retornaLinf}," +
            ":#{#params.usuario}," +
            ":#{#params.terminal}," +
            ":#{#params.descripcionEvento}) FROM DUAL",
            nativeQuery = true)
    List<RestrictiveListEntry> butValidarListas(@Param("params") ButValidarListasParams params);
}
