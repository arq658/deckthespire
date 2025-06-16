package com.example.demo.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "characters")
public class Character {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String description;
    
    private Integer startingHp;
    
    @ElementCollection
    @CollectionTable(name = "character_starting_cards", joinColumns = @JoinColumn(name = "character_id"))
    @Column(name = "card_name")
    private List<String> startingDeck;
    
    private String startingRelic;
    
    // Constructors
    public Character() {}
    
    public Character(String name, String description, Integer startingHp, List<String> startingDeck, String startingRelic) {
        this.name = name;
        this.description = description;
        this.startingHp = startingHp;
        this.startingDeck = startingDeck;
        this.startingRelic = startingRelic;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getStartingHp() {
        return startingHp;
    }
    
    public void setStartingHp(Integer startingHp) {
        this.startingHp = startingHp;
    }
    
    public List<String> getStartingDeck() {
        return startingDeck;
    }
    
    public void setStartingDeck(List<String> startingDeck) {
        this.startingDeck = startingDeck;
    }
    
    public String getStartingRelic() {
        return startingRelic;
    }
    
    public void setStartingRelic(String startingRelic) {
        this.startingRelic = startingRelic;
    }
}
