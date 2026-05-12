package com.neffi.laft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Estructura base para respuestas exitosas del API.
 *
 * @param <T> tipo de dato contenido en la propiedad {@code data}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseBase<T> {

    private Integer code;
    private String message;
    private T data;

    /**
     * Crea una respuesta exitosa con codigo 200 y mensaje OK.
     *
     * @param data contenido de la respuesta
     * @param <T>  tipo del contenido
     * @return respuesta exitosa estandarizada
     */
    public static <T> ResponseBase<T> success(T data) {
        return ResponseBase.<T>builder()
                .code(200)
                .message("OK")
                .data(data)
                .build();
    }

    /**
     * Crea una respuesta de error con codigo HTTP y detalle del error.
     *
     * @param code          codigo HTTP de error
     * @param detailMessage detalle del error para diagnostico
     * @return respuesta de error estandarizada
     */
    public static ResponseBase<String> error(Integer code, String detailMessage) {
        return ResponseBase.<String>builder()
                .code(code)
                .message("ERROR")
                .data(detailMessage)
                .build();
    }
}
