package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * Clase que representa el formato de respuesta de la API externa para listas de palabras clave
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class KeywordListResponse {
    private List<KeywordResponse.KeywordData> data;

    public List<KeywordResponse.KeywordData> getData() {
        return data;
    }

    public void setData(List<KeywordResponse.KeywordData> data) {
        this.data = data;
    }
}
