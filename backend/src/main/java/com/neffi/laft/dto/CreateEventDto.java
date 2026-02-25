package com.neffi.laft.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class CreateEventDto {
    @NotBlank(message = "El tipo de evento es obligatorio")
    private String type;

    @NotBlank(message = "El título es obligatorio")
    private String title;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDateTime date;

    private String startTime;
    private String endTime;
    private String location;
    private String participants;
    private String status = "programado";
    private List<Map<String, Object>> attachments;
    private boolean includeInReport = true;
}
