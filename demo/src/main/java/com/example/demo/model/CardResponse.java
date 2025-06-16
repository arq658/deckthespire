package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Clase que representa el formato de respuesta de la API externa para las tarjetas
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class CardResponse {
    private CardData data;

    public CardData getData() {
        return data;
    }

    public void setData(CardData data) {
        this.data = data;
    }

    /**
     * Estructura interna del objeto data
     */
    public static class CardData {
        private String id;
        private String type;
        private Card attributes;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Card getAttributes() {
            return attributes;
        }

        public void setAttributes(Card attributes) {
            this.attributes = attributes;
        }
    }
}
