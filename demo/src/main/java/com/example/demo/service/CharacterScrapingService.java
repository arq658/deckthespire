package com.example.demo.service;

import com.example.demo.model.Character;
import com.example.demo.repository.CharacterRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class CharacterScrapingService {

    @Autowired
    private CharacterRepository characterRepository;

    public void scrapeAndSaveCharacters() {
        System.out.println("Iniciando scraping de personajes...");
        
        // Crear personajes con datos conocidos de la wiki
        List<Character> characters = createCharactersFromWikiData();
        
        for (Character character : characters) {
            if (!characterRepository.findByName(character.getName()).isPresent()) {
                characterRepository.save(character);
                System.out.println("Guardado personaje: " + character.getName());
            } else {
                System.out.println("Personaje ya existe: " + character.getName());
            }
        }
        
        System.out.println("Scraping de personajes completado.");
    }

    private List<Character> createCharactersFromWikiData() {
        List<Character> characters = new ArrayList<>();
        
        // Ironclad
        Character ironclad = new Character();
        ironclad.setName("Ironclad");
        ironclad.setDescription("The remaining soldier of the Ironclads. Sold his soul to harness demonic energies.");
        ironclad.setStartingHp(80);
        ironclad.setStartingDeck(Arrays.asList(
            "Strike", "Strike", "Strike", "Strike", "Strike",
            "Defend", "Defend", "Defend", "Defend",
            "Bash"
        ));
        ironclad.setStartingRelic("Burning Blood");
        characters.add(ironclad);
        
        // Silent
        Character silent = new Character();
        silent.setName("Silent");
        silent.setDescription("A deadly huntress from the foglands. Eradicates foes with daggers and poisons.");
        silent.setStartingHp(70);
        silent.setStartingDeck(Arrays.asList(
            "Strike", "Strike", "Strike", "Strike", "Strike",
            "Defend", "Defend", "Defend", "Defend", "Defend",
            "Survivor", "Neutralize"
        ));
        silent.setStartingRelic("Ring of the Snake");
        characters.add(silent);
        
        // Defect
        Character defect = new Character();
        defect.setName("Defect");
        defect.setDescription("Combat automaton which became self-aware. Ancient technology allows manipulation of Orbs.");
        defect.setStartingHp(75);
        defect.setStartingDeck(Arrays.asList(
            "Strike", "Strike", "Strike", "Strike",
            "Defend", "Defend", "Defend", "Defend",
            "Zap", "Dualcast"
        ));
        defect.setStartingRelic("Cracked Core");
        characters.add(defect);
        
        // Watcher
        Character watcher = new Character();
        watcher.setName("Watcher");
        watcher.setDescription("A blind ascetic who has come to \"Evaluate\" the Spire. Master of the divine Stances.");
        watcher.setStartingHp(72);
        watcher.setStartingDeck(Arrays.asList(
            "Strike", "Strike", "Strike", "Strike",
            "Defend", "Defend", "Defend", "Defend",
            "Eruption", "Vigilance"
        ));
        watcher.setStartingRelic("Pure Water");
        characters.add(watcher);
        
        return characters;
    }

    public void scrapeCharacterFromWiki(String characterName, String wikiUrl) {
        try {
            System.out.println("Scrapeando datos de " + characterName + " desde " + wikiUrl);
            
            Document doc = Jsoup.connect(wikiUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .get();
            
            // Extraer información del personaje
            String description = extractDescription(doc);
            List<String> startingDeck = extractStartingDeck(doc);
            String startingRelic = extractStartingRelic(doc);
            
            System.out.println("Datos extraídos para " + characterName + ":");
            System.out.println("Descripción: " + description);
            System.out.println("Mazo inicial: " + startingDeck);
            System.out.println("Reliquia inicial: " + startingRelic);
            
        } catch (IOException e) {
            System.err.println("Error al hacer scraping de " + characterName + ": " + e.getMessage());
        }
    }

    private String extractDescription(Document doc) {
        Elements quotes = doc.select("blockquote, .quote, i");
        for (Element quote : quotes) {
            String text = quote.text();
            if (text.length() > 20 && (text.contains("soldier") || text.contains("huntress") || 
                                      text.contains("automaton") || text.contains("ascetic"))) {
                return text.replaceAll("\"", "");
            }
        }
        return "Character description";
    }

    private List<String> extractStartingDeck(Document doc) {
        List<String> deck = new ArrayList<>();
        
        // Buscar la sección "Starting Deck"
        Elements headings = doc.select("h3, h4");
        for (Element heading : headings) {
            if (heading.text().contains("Starting Deck")) {
                Element nextElement = heading.nextElementSibling();
                while (nextElement != null && !nextElement.tagName().startsWith("h")) {
                    if (nextElement.tagName().equals("ul")) {
                        Elements listItems = nextElement.select("li");
                        for (Element li : listItems) {
                            String cardInfo = li.text();
                            // Extraer número y nombre de carta
                            if (cardInfo.matches(".*\\d+.*")) {
                                String[] parts = cardInfo.split("\\s+");
                                if (parts.length >= 2) {
                                    try {
                                        int count = Integer.parseInt(parts[0].replaceAll("[^0-9]", ""));
                                        String cardName = cardInfo.replaceAll("^.*?\\d+\\s*", "")
                                                                   .replaceAll("\\s*\\(.*?\\)", "")
                                                                   .trim();
                                        for (int i = 0; i < count; i++) {
                                            deck.add(cardName);
                                        }
                                    } catch (NumberFormatException e) {
                                        // Si no se puede parsear el número, agregar el nombre de la carta una vez
                                        deck.add(cardInfo);
                                    }
                                }
                            }
                        }
                        break;
                    }
                    nextElement = nextElement.nextElementSibling();
                }
                break;
            }
        }
        
        return deck;
    }

    private String extractStartingRelic(Document doc) {
        // Buscar la sección de reliquias y extraer la reliquia inicial
        Elements text = doc.select("p, li");
        for (Element element : text) {
            String textContent = element.text();
            if (textContent.contains("Starting Relic:")) {
                // Extraer el nombre de la reliquia después de "Starting Relic:"
                String[] parts = textContent.split("Starting Relic:");
                if (parts.length > 1) {
                    return parts[1].trim().split("\\s+")[0]; // Tomar la primera palabra después de ":"
                }
            }
        }
        return "Unknown Relic";
    }
}
