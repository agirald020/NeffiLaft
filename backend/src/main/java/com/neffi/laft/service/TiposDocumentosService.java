package com.neffi.laft.service;

import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.neffi.laft.dto.TiposDocumentosDTO;
import com.neffi.laft.model.TiposDocumentos;
import com.neffi.laft.repository.TiposDocumentosRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Servicio para la gestión de tipos de documentos.
 * Proporciona métodos para consultar y manipular los datos de la tabla TIPOS_DOCUMENTOS.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TiposDocumentosService {

    private final TiposDocumentosRepository tiposDocumentosRepository;

    /**
     * Obtiene un tipo de documento por su código.
     *
     * @param codigo el código del tipo de documento
     * @return DTO del tipo de documento
     * @throws NoSuchElementException si el tipo de documento no existe
     */
    public TiposDocumentosDTO getTiposDocumentosById(Long codigo) {
        log.debug("Buscando tipo de documento con código: {}", codigo);
        TiposDocumentos tiposDocumentos = tiposDocumentosRepository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Tipo de documento no encontrado con código: " + codigo));
        return convertToDTO(tiposDocumentos);
    }

    public TiposDocumentosDTO getTiposDocumentosByCodHomologa(String codHomologa) {
        log.debug("Buscando tipo de documento con código de homologación: {}", codHomologa);
        TiposDocumentos tiposDocumentos = tiposDocumentosRepository.findByCodHomologa(codHomologa);
        if (tiposDocumentos == null) {
            throw new NoSuchElementException("Tipo de documento no encontrado con código de homologación: " + codHomologa);
        }
        return convertToDTO(tiposDocumentos);
     }

    /**
     * Convierte una entidad TiposDocumentos a su correspondiente DTO.
     *
     * @param tiposDocumentos la entidad a convertir
     * @return el DTO resultante
     */
    private TiposDocumentosDTO convertToDTO(TiposDocumentos tiposDocumentos) {
        return TiposDocumentosDTO.builder()
                .codigo(tiposDocumentos.getCodigo())
                .nombre(tiposDocumentos.getNombre())
                .descripcion(tiposDocumentos.getDescripcion())
                .codHomologa(tiposDocumentos.getCodHomologa())
                .codHomologaSifi(tiposDocumentos.getCodHomologaSifi())
                .build();
    }
}
