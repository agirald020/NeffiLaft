package com.neffi.laft.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class BulkInputRow {
    private String docNumber;
    private String primerNombre;
    private String segundoNombre;
    private String primerApellido;
    private String segundoApellido;
    private String fullName;
}
