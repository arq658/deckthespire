package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * Clase que representa el formato de respuesta de la API externa para listas de tarjetas
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class CardListResponse {
    private List<CardResponse.CardData> data;

    public List<CardResponse.CardData> getData() {
        return data;
    }

    public void setData(List<CardResponse.CardData> data) {
        this.data = data;
    }
}
