package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * Clase que representa el formato de respuesta de la API externa para listas de reliquias
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class RelicListResponse {
    private List<RelicResponse.RelicData> data;

    public List<RelicResponse.RelicData> getData() {
        return data;
    }

    public void setData(List<RelicResponse.RelicData> data) {
        this.data = data;
    }
}
