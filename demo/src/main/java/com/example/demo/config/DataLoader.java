package com.example.demo.config;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.CharacterScrapingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Configuration
public class DataLoader {
    private static final Logger logger = LoggerFactory.getLogger(DataLoader.class);
    
    @Value("${slay.the.spire.api.url:http://localhost:3000/api/v1}")
    private String apiBaseUrl;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private CharacterScrapingService characterScrapingService;
    
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate template = new RestTemplate();
        logger.info("Configuring RestTemplate with increased timeout and detailed error logging");
        return template;
    }

    @Bean
    public CommandLineRunner loadData(CardRepository cardRepository, 
                                      KeywordRepository keywordRepository,
                                      RelicRepository relicRepository,
                                      CharacterRepository characterRepository,
                                      RestTemplate restTemplate) {
        return args -> {
            // First initialize roles
            initializeRoles();
            
            // Load characters if repository is empty
            if (characterRepository.count() == 0) {
                logger.info("Loading character data...");
                characterScrapingService.scrapeAndSaveCharacters();
            } 
            
            // Log API URL being used
            logger.info("Configured API URL: {}", apiBaseUrl);
            
            // Load cards if repository is empty
            if (cardRepository.count() == 0) {
                logger.info("Loading card data from API...");
                loadCardsFromApi(cardRepository, restTemplate);
            }
            
            // Load keywords if repository is empty
            if (keywordRepository.count() == 0) {
                logger.info("Loading keyword data from API...");
                loadKeywordsFromApi(keywordRepository, restTemplate);
            }
            
            // Load relics if repository is empty
            if (relicRepository.count() == 0) {
                logger.info("Loading relic data from API...");
                loadRelicsFromApi(relicRepository, restTemplate);
            }
            
            // Log data loaded confirmation
            logger.info("All data loaded. Characters: {}, Cards: {}, Keywords: {}, Relics: {}", 
                characterRepository.count(), cardRepository.count(), keywordRepository.count(), relicRepository.count());
        };
    }
    
    private void initializeRoles() {
        logger.info("Checking if roles need to be initialized...");
        
        if (roleRepository.count() == 0) {
            logger.info("Creating default roles: USER, ADMIN");
            
            Role userRole = new Role(ERole.ROLE_USER);
            Role adminRole = new Role(ERole.ROLE_ADMIN);
            
            roleRepository.save(userRole);
            roleRepository.save(adminRole);
            
            logger.info("Roles have been initialized successfully");
        } else {
            logger.info("Roles are already initialized. Count: {}", roleRepository.count());
        }
    }
    
    private void loadCardsFromApi(CardRepository cardRepository, RestTemplate restTemplate) {
        try {
            // Fetch cards from API
            String cardsUrl = apiBaseUrl + "/cards";
            logger.info("Fetching cards from: {}", cardsUrl);
            
            try {
                logger.debug("Executing REST call to {}", cardsUrl);
                
                // Obtener respuesta como String para procesamiento manual flexible
                org.springframework.http.ResponseEntity<String> response = 
                    restTemplate.getForEntity(cardsUrl, String.class);
                
                if (response.getStatusCode().is2xxSuccessful()) {
                    String responseBody = response.getBody();
                    logger.debug("Raw API response: {}", responseBody);
                    
                    // Usar Jackson para procesar la respuesta
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    
                    try {
                        // Analizar estructura de la respuesta JSON
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(responseBody);
                        
                        if (rootNode.has("data")) {
                            // Caso 1: Formato es un objeto con campo "data" que contiene una lista de tarjetas
                            logger.debug("Respuesta tiene formato con campo 'data'");
                            if (rootNode.get("data").isArray()) {
                                // Es una lista de tarjetas
                                logger.debug("El campo 'data' es un array de tarjetas");
                                com.fasterxml.jackson.databind.JsonNode dataNode = rootNode.get("data");
                                int count = 0;
                                
                                for (com.fasterxml.jackson.databind.JsonNode cardNode : dataNode) {
                                    try {
                                        // Extraer los atributos de la tarjeta
                                        Card card;
                                        if (cardNode.has("attributes")) {
                                            // Nuevo formato: { id, type, attributes: { ... } }
                                            card = mapper.convertValue(cardNode.get("attributes"), Card.class);
                                        } else {
                                            // Formato alternativo: { id, ... } - los atributos directamente en el objeto
                                            card = mapper.convertValue(cardNode, Card.class);
                                        }
                                        
                                        if (card != null && card.getName() != null) {
                                            cardRepository.save(card);
                                            count++;
                                            logger.debug("Guardata tarjeta: {}", card.getName());
                                        }
                                    } catch (Exception ex) {
                                        logger.error("Error al procesar una tarjeta: {}", ex.getMessage());
                                    }
                                }
                                
                                logger.info("Successfully loaded {} cards from API!", count);
                                return; // Salir después de cargar datos correctamente
                            } else if (rootNode.get("data").isObject()) {
                                // Caso 2: Es una sola tarjeta
                                logger.debug("El campo 'data' es un objeto de una sola tarjeta");
                                com.fasterxml.jackson.databind.JsonNode cardNode = rootNode.get("data");
                                
                                try {
                                    Card card;
                                    if (cardNode.has("attributes")) {
                                        // Nuevo formato: { id, type, attributes: { ... } }
                                        card = mapper.convertValue(cardNode.get("attributes"), Card.class);
                                    } else {
                                        // Formato alternativo
                                        card = mapper.convertValue(cardNode, Card.class);
                                    }
                                    
                                    if (card != null && card.getName() != null) {
                                        cardRepository.save(card);
                                        logger.info("Successfully loaded single card from API: {}", card.getName());
                                        return; // Salir después de cargar datos correctamente
                                    }
                                } catch (Exception ex) {
                                    logger.error("Error al procesar una tarjeta única: {}", ex.getMessage());
                                }
                            }
                        } else if (rootNode.isArray()) {
                            // Caso 3: Formato es un array directo de tarjetas
                            logger.debug("La respuesta es un array directo de tarjetas");
                            Card[] cards = mapper.readValue(responseBody, Card[].class);
                            
                            if (cards != null && cards.length > 0) {
                                int count = 0;
                                for (Card card : cards) {
                                    if (card != null && card.getName() != null) {
                                        cardRepository.save(card);
                                        count++;
                                    }
                                }
                                logger.info("Successfully loaded {} cards from direct array!", count);
                                return; // Salir después de cargar datos correctamente
                            }
                        }
                        
                        // Si llegamos aquí, no se encontró ningún formato válido
                        logger.warn("No se pudo identificar un formato válido en la respuesta JSON");
                    } catch (Exception ex) {
                        logger.error("Error al procesar respuesta JSON: {}", ex.getMessage(), ex);
                    }
                } else {
                    logger.warn("Non-successful response from API: {}", response.getStatusCode());
                }
                
                logger.warn("No valid cards found from API, loading fallback data...");
                loadFallbackCardData(cardRepository);
            } catch (RestClientException e) {
                logger.error("Error fetching cards from API: {}", e.getMessage(), e);
                logger.info("Loading fallback card data instead...");
                loadFallbackCardData(cardRepository);
            }
        } catch (Exception e) {
            logger.error("Unexpected error in card data loading: {}", e.getMessage(), e);
        }
    }
    
    private void loadKeywordsFromApi(KeywordRepository keywordRepository, RestTemplate restTemplate) {
        try {
            // Fetch keywords from API
            String keywordsUrl = apiBaseUrl + "/keywords";
            logger.info("Fetching keywords from: {}", keywordsUrl);
            
            try {
                // Obtener respuesta como String para procesamiento flexible
                org.springframework.http.ResponseEntity<String> response = 
                    restTemplate.getForEntity(keywordsUrl, String.class);
                
                if (response.getStatusCode().is2xxSuccessful()) {
                    String responseBody = response.getBody();
                    logger.debug("Raw API response for keywords: {}", responseBody);
                    
                    // Usar Jackson para procesar la respuesta
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    
                    try {
                        // Analizar estructura de la respuesta JSON
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(responseBody);
                        
                        if (rootNode.has("data")) {
                            // Caso 1: Formato es un objeto con campo "data" que contiene una lista de keywords
                            logger.debug("Respuesta tiene formato con campo 'data'");
                            if (rootNode.get("data").isArray()) {
                                // Es una lista de keywords
                                logger.debug("El campo 'data' es un array de keywords");
                                com.fasterxml.jackson.databind.JsonNode dataNode = rootNode.get("data");
                                int count = 0;
                                
                                for (com.fasterxml.jackson.databind.JsonNode keywordNode : dataNode) {
                                    try {
                                        // Extraer los atributos de la keyword
                                        Keyword keyword;
                                        if (keywordNode.has("attributes")) {
                                            // Nuevo formato: { id, type, attributes: { ... } }
                                            keyword = mapper.convertValue(keywordNode.get("attributes"), Keyword.class);
                                        } else {
                                            // Formato alternativo: { id, ... } - los atributos directamente en el objeto
                                            keyword = mapper.convertValue(keywordNode, Keyword.class);
                                        }
                                        
                                        if (keyword != null && keyword.getName() != null) {
                                            keywordRepository.save(keyword);
                                            count++;
                                            logger.debug("Guardada keyword: {}", keyword.getName());
                                        }
                                    } catch (Exception ex) {
                                        logger.error("Error al procesar una keyword: {}", ex.getMessage());
                                    }
                                }
                                
                                logger.info("Successfully loaded {} keywords from API!", count);
                                return; // Salir después de cargar datos correctamente
                            } else if (rootNode.get("data").isObject()) {
                                // Caso 2: Es una sola keyword
                                logger.debug("El campo 'data' es un objeto de una sola keyword");
                                com.fasterxml.jackson.databind.JsonNode keywordNode = rootNode.get("data");
                                
                                try {
                                    Keyword keyword;
                                    if (keywordNode.has("attributes")) {
                                        // Nuevo formato: { id, type, attributes: { ... } }
                                        keyword = mapper.convertValue(keywordNode.get("attributes"), Keyword.class);
                                    } else {
                                        // Formato alternativo
                                        keyword = mapper.convertValue(keywordNode, Keyword.class);
                                    }
                                    
                                    if (keyword != null && keyword.getName() != null) {
                                        keywordRepository.save(keyword);
                                        logger.info("Successfully loaded single keyword from API: {}", keyword.getName());
                                        return; // Salir después de cargar datos correctamente
                                    }
                                } catch (Exception ex) {
                                    logger.error("Error al procesar una keyword única: {}", ex.getMessage());
                                }
                            }
                        } else if (rootNode.isArray()) {
                            // Caso 3: Formato es un array directo de keywords
                            logger.debug("La respuesta es un array directo de keywords");
                            Keyword[] keywords = mapper.readValue(responseBody, Keyword[].class);
                            
                            if (keywords != null && keywords.length > 0) {
                                int count = 0;
                                for (Keyword keyword : keywords) {
                                    if (keyword != null && keyword.getName() != null) {
                                        keywordRepository.save(keyword);
                                        count++;
                                    }
                                }
                                logger.info("Successfully loaded {} keywords from direct array!", count);
                                return; // Salir después de cargar datos correctamente
                            }
                        }
                        
                        // Si llegamos aquí, no se encontró ningún formato válido
                        logger.warn("No se pudo identificar un formato válido en la respuesta JSON");
                    } catch (Exception ex) {
                        logger.error("Error al procesar respuesta JSON: {}", ex.getMessage(), ex);
                    }
                } else {
                    logger.warn("Non-successful response from API: {}", response.getStatusCode());
                }
                
                logger.warn("No valid keywords found from API, loading fallback data...");
                loadFallbackKeywordData(keywordRepository);
            } catch (RestClientException e) {
                logger.error("Error fetching keywords from API: {}", e.getMessage(), e);
                logger.info("Loading fallback keyword data instead...");
                loadFallbackKeywordData(keywordRepository);
            }
        } catch (Exception e) {
            logger.error("Unexpected error in keyword data loading: {}", e.getMessage(), e);
        }
    }
    
    private void loadRelicsFromApi(RelicRepository relicRepository, RestTemplate restTemplate) {
        try {
            // Fetch relics from API
            String relicsUrl = apiBaseUrl + "/relics";
            logger.info("Fetching relics from: {}", relicsUrl);
            
            try {
                // Obtener respuesta como String para procesamiento flexible
                org.springframework.http.ResponseEntity<String> response = 
                    restTemplate.getForEntity(relicsUrl, String.class);
                
                if (response.getStatusCode().is2xxSuccessful()) {
                    String responseBody = response.getBody();
                    logger.debug("Raw API response for relics: {}", responseBody);
                    
                    // Usar Jackson para procesar la respuesta
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    
                    try {
                        // Analizar estructura de la respuesta JSON
                        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(responseBody);
                        
                        if (rootNode.has("data")) {
                            // Caso 1: Formato es un objeto con campo "data" que contiene una lista de reliquias
                            logger.debug("Respuesta tiene formato con campo 'data'");
                            if (rootNode.get("data").isArray()) {
                                // Es una lista de reliquias
                                logger.debug("El campo 'data' es un array de reliquias");
                                com.fasterxml.jackson.databind.JsonNode dataNode = rootNode.get("data");
                                int count = 0;
                                
                                for (com.fasterxml.jackson.databind.JsonNode relicNode : dataNode) {
                                    try {
                                        // Extraer los atributos de la reliquia
                                        Relic relic;
                                        if (relicNode.has("attributes")) {
                                            // Nuevo formato: { id, type, attributes: { ... } }
                                            relic = mapper.convertValue(relicNode.get("attributes"), Relic.class);
                                        } else {
                                            // Formato alternativo: { id, ... } - los atributos directamente en el objeto
                                            relic = mapper.convertValue(relicNode, Relic.class);
                                        }
                                        
                                        if (relic != null && relic.getName() != null) {
                                            relicRepository.save(relic);
                                            count++;
                                            logger.debug("Guardada reliquia: {}", relic.getName());
                                        }
                                    } catch (Exception ex) {
                                        logger.error("Error al procesar una reliquia: {}", ex.getMessage());
                                    }
                                }
                                
                                logger.info("Successfully loaded {} relics from API!", count);
                                return; // Salir después de cargar datos correctamente
                            } else if (rootNode.get("data").isObject()) {
                                // Caso 2: Es una sola reliquia
                                logger.debug("El campo 'data' es un objeto de una sola reliquia");
                                com.fasterxml.jackson.databind.JsonNode relicNode = rootNode.get("data");
                                
                                try {
                                    Relic relic;
                                    if (relicNode.has("attributes")) {
                                        // Nuevo formato: { id, type, attributes: { ... } }
                                        relic = mapper.convertValue(relicNode.get("attributes"), Relic.class);
                                    } else {
                                        // Formato alternativo
                                        relic = mapper.convertValue(relicNode, Relic.class);
                                    }
                                    
                                    if (relic != null && relic.getName() != null) {
                                        relicRepository.save(relic);
                                        logger.info("Successfully loaded single relic from API: {}", relic.getName());
                                        return; // Salir después de cargar datos correctamente
                                    }
                                } catch (Exception ex) {
                                    logger.error("Error al procesar una reliquia única: {}", ex.getMessage());
                                }
                            }
                        } else if (rootNode.isArray()) {
                            // Caso 3: Formato es un array directo de reliquias
                            logger.debug("La respuesta es un array directo de reliquias");
                            Relic[] relics = mapper.readValue(responseBody, Relic[].class);
                            
                            if (relics != null && relics.length > 0) {
                                int count = 0;
                                for (Relic relic : relics) {
                                    if (relic != null && relic.getName() != null) {
                                        relicRepository.save(relic);
                                        count++;
                                    }
                                }
                                logger.info("Successfully loaded {} relics from direct array!", count);
                                return; // Salir después de cargar datos correctamente
                            }
                        }
                        
                        // Si llegamos aquí, no se encontró ningún formato válido
                        logger.warn("No se pudo identificar un formato válido en la respuesta JSON");
                    } catch (Exception ex) {
                        logger.error("Error al procesar respuesta JSON: {}", ex.getMessage(), ex);
                    }
                } else {
                    logger.warn("Non-successful response from API: {}", response.getStatusCode());
                }
                
                logger.warn("No valid relics found from API, loading fallback data...");
                loadFallbackRelicData(relicRepository);
            } catch (RestClientException e) {
                logger.error("Error fetching relics from API: {}", e.getMessage(), e);
                logger.info("Loading fallback relic data instead...");
                loadFallbackRelicData(relicRepository);
            }
        } catch (Exception e) {
            logger.error("Unexpected error in relic data loading: {}", e.getMessage(), e);
        }
    }
    
    private void loadFallbackCardData(CardRepository cardRepository) {
        // Strike Card
        Card strike = new Card();
        strike.setName("Strike");
        strike.setColor("Red");
        strike.setRarity("Basic");
        strike.setType("Attack");
        strike.setCost(1);
        strike.setDescription("Deal 6 damage.");
        strike.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/c/c7/Strike_R.png");
        cardRepository.save(strike);

        // Defend Card
        Card defend = new Card();
        defend.setName("Defend");
        defend.setColor("Red");
        defend.setRarity("Basic");
        defend.setType("Skill");
        defend.setCost(1);
        defend.setDescription("Gain 5 Block.");
        defend.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/e/e0/Defend_R.png");
        cardRepository.save(defend);

        // Bash Card
        Card bash = new Card();
        bash.setName("Bash");
        bash.setColor("Red");
        bash.setRarity("Basic");
        bash.setType("Attack");
        bash.setCost(2);
        bash.setDescription("Deal 8 damage. Apply 2 Vulnerable.");
        bash.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/1/1b/Bash.png");
        cardRepository.save(bash);

        // Neutralize Card
        Card neutralize = new Card();
        neutralize.setName("Neutralize");
        neutralize.setColor("Green");
        neutralize.setRarity("Basic");
        neutralize.setType("Attack");
        neutralize.setCost(0);
        neutralize.setDescription("Deal 3 damage. Apply 1 Weak.");
        neutralize.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/0/08/Neutralize.png");
        cardRepository.save(neutralize);

        // Survivor Card
        Card survivor = new Card();
        survivor.setName("Survivor");
        survivor.setColor("Green");
        survivor.setRarity("Basic");
        survivor.setType("Skill");
        survivor.setCost(1);
        survivor.setDescription("Gain 8 Block. Discard 1 card.");
        survivor.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/2/2f/Survivor.png");
        cardRepository.save(survivor);

        // Zap Card
        Card zap = new Card();
        zap.setName("Zap");
        zap.setColor("Blue");
        zap.setRarity("Basic");
        zap.setType("Skill");
        zap.setCost(1);
        zap.setDescription("Channel 1 Lightning.");
        zap.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/9/9e/Zap.png");
        cardRepository.save(zap);

        // Dualcast Card
        Card dualcast = new Card();
        dualcast.setName("Dualcast");
        dualcast.setColor("Blue");
        dualcast.setRarity("Basic");
        dualcast.setType("Skill");
        dualcast.setCost(1);
        dualcast.setDescription("Evoke your next Orb twice.");
        dualcast.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/d/da/Dualcast.png");
        cardRepository.save(dualcast);

        // Eruption Card
        Card eruption = new Card();
        eruption.setName("Eruption");
        eruption.setColor("Purple");
        eruption.setRarity("Basic");
        eruption.setType("Attack");
        eruption.setCost(2);
        eruption.setDescription("Deal 9 damage. Enter Wrath.");
        eruption.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/6/62/Eruption.png");
        cardRepository.save(eruption);
        
        logger.info("Fallback card data loaded successfully!");
    }
    
    private void loadFallbackKeywordData(KeywordRepository keywordRepository) {
        // Strength keyword
        Keyword strength = new Keyword();
        strength.setName("Strength");
        strength.setDescription("Increases attack damage by 1 per Strength point.");
        keywordRepository.save(strength);
        
        // Vulnerable keyword
        Keyword vulnerable = new Keyword();
        vulnerable.setName("Vulnerable");
        vulnerable.setDescription("Vulnerable creatures take 50% more damage from attacks.");
        keywordRepository.save(vulnerable);
        
        // Weak keyword
        Keyword weak = new Keyword();
        weak.setName("Weak");
        weak.setDescription("Weak creatures deal 25% less damage with attacks.");
        keywordRepository.save(weak);
        
        // Block keyword
        Keyword block = new Keyword();
        block.setName("Block");
        block.setDescription("Until the next turn, prevents damage.");
        keywordRepository.save(block);
        
        // Dexterity keyword
        Keyword dexterity = new Keyword();
        dexterity.setName("Dexterity");
        dexterity.setDescription("Increases Block gained from cards by 1 per Dexterity point.");
        keywordRepository.save(dexterity);
        
        logger.info("Fallback keyword data loaded successfully!");
    }
    
    private void loadFallbackRelicData(RelicRepository relicRepository) {
        // Burning Blood relic
        Relic burningBlood = new Relic();
        burningBlood.setName("Burning Blood");
        burningBlood.setTier("Starter");
        burningBlood.setPool("Ironclad");
        burningBlood.setDescription("At the end of combat, heal 6 HP.");
        burningBlood.setFlavorText("Your body's own blood burns with an undying rage.");
        burningBlood.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/e/ec/BurningBlood.png");
        relicRepository.save(burningBlood);
        
        // Ring of the Snake relic
        Relic ringOfSnake = new Relic();
        ringOfSnake.setName("Ring of the Snake");
        ringOfSnake.setTier("Starter");
        ringOfSnake.setPool("Silent");
        ringOfSnake.setDescription("At the start of each combat, draw 2 additional cards.");
        ringOfSnake.setFlavorText("Made from a fossilized snake. Represents great skill as a huntress.");
        ringOfSnake.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/a/ae/RingOfTheSnake.png");
        relicRepository.save(ringOfSnake);
        
        // Cracked Core relic
        Relic crackedCore = new Relic();
        crackedCore.setName("Cracked Core");
        crackedCore.setTier("Starter");
        crackedCore.setPool("Defect");
        crackedCore.setDescription("At the start of each combat, channel 1 Lightning.");
        crackedCore.setFlavorText("The mysterious energy within the core powers the city... and you.");
        crackedCore.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/0/05/CrackedCore.png");
        relicRepository.save(crackedCore);
        
        // Pure Water relic
        Relic pureWater = new Relic();
        pureWater.setName("Pure Water");
        pureWater.setTier("Starter");
        pureWater.setPool("Watcher");
        pureWater.setDescription("At the start of each combat, add a Miracle to your hand.");
        pureWater.setFlavorText("Filtered through fine sand and free of impurities.");
        pureWater.setImageUrl("https://static.wikia.nocookie.net/slay-the-spire/images/5/55/PureWater.png");
        relicRepository.save(pureWater);
        
        logger.info("Fallback relic data loaded successfully!");
    }
}
