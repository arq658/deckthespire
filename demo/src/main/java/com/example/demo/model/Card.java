package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@JsonIgnoreProperties(ignoreUnknown = true)
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String color;
    private String rarity;
    
    @Column(name = "card_type")
    @JsonProperty("card_type")
    private String type; // This maps to card_type in JSON
    
    private Integer cost;
    private String description;
    
    @Column(name = "keyword_description")
    @JsonProperty("keyword_description")
    private String keywordDescription;
    
    @JsonProperty("image")
    private String imageUrl;
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public String getRarity() { return rarity; }
    public void setRarity(String rarity) { this.rarity = rarity; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Integer getCost() { return cost; }
    public void setCost(Integer cost) { this.cost = cost; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getKeywordDescription() { return keywordDescription; }
    public void setKeywordDescription(String keywordDescription) { this.keywordDescription = keywordDescription; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
