package com.neffi.laft.enums;

import java.util.Arrays;

public enum BulkTemplateColumn {
    NUMERO_DOCUMENTO(0, "Número de Documento"),
    PRIMER_NOMBRE(1, "Primer Nombre"),
    SEGUNDO_NOMBRE(2, "Segundo Nombre"),
    PRIMER_APELLIDO(3, "Primer Apellido"),
    SEGUNDO_APELLIDO(4, "Segundo Apellido"),
    RAZON_SOCIAL(5, "Razon social");

    private final int index;
    private final String header;

    BulkTemplateColumn(int index, String header) {
        this.index = index;
        this.header = header;
    }

    public int index() {
        return index;
    }

    public String header() {
        return header;
    }

    public static String[] headers() {
        return Arrays.stream(values())
                .map(BulkTemplateColumn::header)
                .toArray(String[]::new);
    }
}