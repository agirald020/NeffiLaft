package com.neffi.laft.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationReportRequestDto {
    private String documentNumber;
    private String personType;
    private String firstName;
    private String secondName;
    private String firstLastName;
    private String secondLastName;
    private String businessName;
}
