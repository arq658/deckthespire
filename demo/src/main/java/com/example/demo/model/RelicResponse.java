package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Clase que representa el formato de respuesta de la API externa para las reliquias
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class RelicResponse {
    private RelicData data;

    public RelicData getData() {
        return data;
    }

    public void setData(RelicData data) {
        this.data = data;
    }

    /**
     * Estructura interna del objeto data
     */
    public static class RelicData {
        private String id;
        private String type;
        private Relic attributes;

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

        public Relic getAttributes() {
            return attributes;
        }

        public void setAttributes(Relic attributes) {
            this.attributes = attributes;
        }
    }
}
