package com.neffi.laft.repository;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import org.hibernate.dialect.OracleTypes;
import org.springframework.stereotype.Repository;

import com.neffi.laft.dto.ButValidarListasParams;
import com.neffi.laft.dto.RestrictiveListEntry;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class RestrictiveListRepositoryImpl implements RestrictiveListRepositoryCustom {

    private final DataSource dataSource;

    /**
     * Ejecuta la función BUT_VALIDAR_LISTAS usando JDBC directamente
     * Oracle retorna un REF CURSOR que procesamos con JDBC
     */
    @Override
    public List<RestrictiveListEntry> butValidarListas(ButValidarListasParams params) {
        try (Connection connection = dataSource.getConnection()) {

            // SQL para llamar la función: { ? = call BUT_VALIDAR_LISTAS(...) }
            String sql = "{ ? = call BUT_VALIDAR_LISTAS(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) }";

            try (CallableStatement cs = connection.prepareCall(sql)) {
                // Registrar el parámetro de retorno como REF CURSOR
                cs.registerOutParameter(1, OracleTypes.CURSOR);

                // Establecer parámetros de entrada (posiciones 2-11)
                cs.setString(2, params.getIdentificacion());
                cs.setString(3, params.getNombre1());
                cs.setString(4, params.getNombre2());
                cs.setString(5, params.getApellido1());
                cs.setString(6, params.getApellido2());
                cs.setString(7, params.getProceso());
                cs.setString(8, params.getRetornaLinf());
                cs.setString(9, params.getUsuario());
                cs.setString(10, params.getTerminal());
                cs.setString(11, params.getDescripcionEvento());

                // Ejecutar
                cs.execute();

                // Obtener el cursor (posición 1) y procesar con try-with-resources
                List<RestrictiveListEntry> results = new ArrayList<>();
                try (ResultSet resultSet = (ResultSet) cs.getObject(1)) {
                    if (resultSet != null) {
                        while (resultSet.next()) {
                            try {
                                RestrictiveListEntry entry = RestrictiveListEntry.builder()
                                        .codigoLista(resultSet.getLong("CODIGO_LISTA"))
                                        .nombre(resultSet.getString("NOMBRE"))
                                        .tipo(resultSet.getString("TIPO"))
                                        .prioridadValidacion(resultSet.getLong("PRIORIDAD_VALIDACION"))
                                        .permiteIdentificacion(resultSet.getString("PERMITE_IDENTIFICACION"))
                                        .permiteHomonimia(resultSet.getString("PERMITE_HOMONIMIA"))
                                        .tipoDocumento(resultSet.getString("TIPO_DOCUMENTO"))
                                        .identificacion(resultSet.getString("IDENTIFICACION"))
                                        .sdnName(resultSet.getString("SDN_NAME"))
                                        .usuario(resultSet.getString("USUARIO"))
                                        .fechaActualizacion(
                                                resultSet.getObject("FECHA_ACTUALIZACION", LocalDateTime.class))
                                        .comentarios(resultSet.getString("COMENTARIOS"))
                                        .comentarios2(resultSet.getString("COMENTARIOS2"))
                                        .entNum(resultSet.getLong("ENT_NUM"))
                                        .tipoLista(resultSet.getString("TIPO_LISTA"))
                                        .descriTipoLista(resultSet.getString("DESCRI_TIPO_LISTA"))
                                        .build();
                                results.add(entry);
                            } catch (SQLException e) {
                                log.warn("Error procesando fila del resultado", e);
                            }
                        }
                    }
                }
                return results;
            }
        } catch (SQLException e) {
            log.error("Error ejecutando BUT_VALIDAR_LISTAS", e);
            return new ArrayList<>();
        }
    }
}
