package com.neffi.laft.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateClientDto {
    private String documentNumber;
    private String fullName;
}
