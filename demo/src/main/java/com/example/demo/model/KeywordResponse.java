package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Clase que representa el formato de respuesta de la API externa para las keywords
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class KeywordResponse {
    private KeywordData data;

    public KeywordData getData() {
        return data;
    }

    public void setData(KeywordData data) {
        this.data = data;
    }

    /**
     * Estructura interna del objeto data
     */
    public static class KeywordData {
        private String id;
        private String type;
        private Keyword attributes;

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

        public Keyword getAttributes() {
            return attributes;
        }

        public void setAttributes(Keyword attributes) {
            this.attributes = attributes;
        }
    }
}
