# Slay the Spire API Documentation

This document provides information about the available endpoints in the Slay the Spire API.

## Base URL

All endpoints are prefixed with `/api/v1/`

## Authentication

This API does not require authentication.

## Endpoints

### Cards

#### Get all cards

```
GET /api/v1/cards
```

Returns a list of all cards in the game.

**Response example:**

```json
[
  {
    "id": 1,
    "name": "Strike",
    "color": "red",
    "rarity": "basic",
    "type": "attack",
    "cost": 1,
    "description": "Deal 6 damage.",
    "image_url": "http://localhost:3000/rails/active_storage/blobs/..."
  },
  ...
]
```

#### Get a specific card

```
GET /api/v1/cards/:id
```

Returns details for a specific card.

**Parameters:**

- `id` (integer): The ID of the card

**Response example:**

```json
{
  "id": 1,
  "name": "Strike",
  "color": "red",
  "rarity": "basic",
  "type": "attack",
  "cost": 1,
  "description": "Deal 6 damage.",
  "image_url": "http://localhost:3000/rails/active_storage/blobs/..."
}
```

### Relics

#### Get all relics

```
GET /api/v1/relics
```

Returns a list of all relics in the game.

**Response example:**

```json
[
  {
    "id": 1,
    "name": "Burning Blood",
    "tier": "starter",
    "pool": "red",
    "description": "At the end of combat, heal 6 HP.",
    "flavor_text": "Your body's own blood burns with an undying rage.",
    "image_url": "http://localhost:3000/rails/active_storage/blobs/..."
  },
  ...
]
```

#### Get a specific relic

```
GET /api/v1/relics/:id
```

Returns details for a specific relic.

**Parameters:**

- `id` (integer): The ID of the relic

**Response example:**

```json
{
  "id": 1,
  "name": "Burning Blood",
  "tier": "starter",
  "pool": "red",
  "description": "At the end of combat, heal 6 HP.",
  "flavor_text": "Your body's own blood burns with an undying rage.",
  "image_url": "http://localhost:3000/rails/active_storage/blobs/..."
}
```

### Keywords

#### Get all keywords

```
GET /api/v1/keywords
```

Returns a list of all keywords in the game.

**Response example:**

```json
[
  {
    "id": 1,
    "name": "Block",
    "description": "Prevents damage until the start of your next turn.",
    "names": ["Block"]
  },
  ...
]
```

#### Get a specific keyword

```
GET /api/v1/keywords/:id
```

Returns details for a specific keyword.

**Parameters:**

- `id` (integer): The ID of the keyword

**Response example:**

```json
{
  "id": 1,
  "name": "Block",
  "description": "Prevents damage until the start of your next turn.",
  "names": ["Block"]
}
```

## Data Attributes

### Card

| Attribute    | Type   | Description |
|--------------|--------|-------------|
| id           | integer| Unique identifier |
| name         | string | Name of the card |
| color        | string | Color/character class (e.g., "red", "green", "blue", "purple", "colorless") |
| rarity       | string | Card rarity (e.g., "basic", "common", "uncommon", "rare") |
| type         | string | Card type (e.g., "attack", "skill", "power") |
| cost         | integer| Energy cost to play the card |
| description  | text   | Card effect description |
| image_url    | string | URL to the card image |

### Relic

| Attribute    | Type   | Description |
|--------------|--------|-------------|
| id           | integer| Unique identifier |
| name         | string | Name of the relic |
| tier         | string | Relic tier (e.g., "starter", "common", "uncommon", "rare", "boss", "shop", "event") |
| pool         | string | Character class that can obtain this relic (or "shared" for all classes) |
| description  | text   | Relic effect description |
| flavor_text  | text   | Lore text for the relic |
| image_url    | string | URL to the relic image |

### Keyword

| Attribute    | Type   | Description |
|--------------|--------|-------------|
| id           | integer| Unique identifier |
| name         | string | Primary name of the keyword |
| description  | text   | Explanation of what the keyword does |
| names        | array  | List of alternative names for the keyword |

## Errors

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200 OK` - The request was successful
- `404 Not Found` - The requested resource was not found
- `500 Internal Server Error` - Something went wrong on the server