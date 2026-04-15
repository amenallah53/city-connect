# Services-Service Backend API

## 📖 Vue d'ensemble

Ce microservice gère tous les services municipaux et les demandes de services. 
Il est responsable de:
- Lister les services disponibles
- Permettre aux utilisateurs de demander des services
- Tracker le statut de chaque demande

## 🚀 Installation et démarrage

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer la base de données
Créez un fichier `.env` (basé sur `.env.example`):
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cityconnect
PORT=3004
```

### 3. Démarrer le serveur
```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

Le serveur sera accessible sur: `http://localhost:3004`

## 📚 API Endpoints

### Services (Les services proposés par la municipalité)

#### GET /api/services
Récupère tous les services disponibles avec pagination et recherche.

**Query Parameters:**
- `page` (défaut: 1) - Numéro de page
- `limit` (défaut: 10) - Nombre d'items par page
- `search` - Rechercher par nom

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "Permis de Construction",
      "type": "permit",
      "description": "Service de permis...",
      "category": "Urbanisme",
      "price": 500,
      "estimatedDays": 30
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45
  }
}
```

#### GET /api/services/:id
Récupère les détails d'un service spécifique.

#### GET /api/services/category/:category
Récupère tous les services d'une catégorie.

#### POST /api/services (Admin)
Crée un nouveau service.

**Body:**
```json
{
  "nom": "Permis de Construction",
  "type": "permit",
  "description": "...",
  "category": "Urbanisme",
  "price": 500,
  "estimatedDays": 30
}
```

### Service Requests (Les demandes des utilisateurs)

#### POST /api/service-requests
L'utilisateur demande un service.

**Body:**
```json
{
  "CIN": 12345678,
  "Service_id": 1,
  "requestDescription": "Je souhaite faire construire une maison..."
}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "CIN": 12345678,
    "Service_id": 1,
    "status": "pending",
    "requestedAt": "2026-04-11T10:30:00Z"
  }
}
```

#### GET /api/service-requests/user/:CIN
Récupère toutes les demandes d'un utilisateur.

#### GET /api/service-requests/:id
Récupère les détails d'une demande.

#### PUT /api/service-requests/:id/status
Met à jour le statut d'une demande.

**Statuts possibles:**
- `pending` - En attente de traitement
- `in_progress` - En cours de traitement
- `approved` - Approuvée
- `rejected` - Rejetée
- `completed` - Complétée

**Body:**
```json
{
  "status": "in_progress",
  "estimatedCompletionDate": "2026-04-25"
}
```

## 🏗️ Architecture du code

```
services-service/
├── src/
│   ├── app.js                 # Point d'entrée Express
│   ├── config/
│   │   └── db.js             # Configuration PostgreSQL
│   ├── controllers/
│   │   ├── serviceController.js         # Logique des services
│   │   └── demandeServiceController.js  # Logique des demandes
│   └── routes/
│       ├── services.js       # Routes HTTP pour services
│       └── demandeService.js # Routes HTTP pour demandes
├── .env                      # Variables d'environnement
├── package.json              # Dépendances npm
└── README.md                 # Cette documentation
```

## 🔍 Concepts importants

### Controllers (Contrôleurs)
- Contiennent la **logique métier**
- Communiquent avec la base de données
- Retournent les réponses au client
- Un contrôleur = Une responsabilité

### Routes
- Définis. Mappage entre URL et contrôleurs
- `GET /api/services` → appelle `getAllServices()`
- `POST /api/service-requests` → appelle `createServiceRequest()`

### Base de données (PostgreSQL)
- `Service` - Les services disponibles
- `DemandeService` - Les demandes des utilisateurs
- Les données sont persistées (sauvegardées)

## 🔐 Sécurité (À implémenter)

À ajouter pour la production:
- ✅ Validation des données entrantes
- ❌ Authentification JWT (JSON Web Tokens)
- ❌ Autorisation (admin vs citizen)
- ❌ Rate limiting (limiter les requêtes)
- ❌ HTTPS

## 🧪 Tests avec cURL ou Postman

### Créer une demande de service
```bash
curl -X POST http://localhost:3004/api/service-requests \
  -H "Content-Type: application/json" \
  -d '{
    "CIN": 12345678,
    "Service_id": 1,
    "requestDescription": "Je veux un permis de construction"
  }'
```

### Récupérer mes demandes
```bash
curl http://localhost:3004/api/service-requests/user/12345678
```

### Récupérer tous les services
```bash
curl http://localhost:3004/api/services
```

## 📝 Exemple de flux utilisateur

1. **Utilisateur cherche les services**
   ```
   GET /api/services?category=Urbanisme
   ```
   Reçoit les services disponibles

2. **Utilisateur demande un service**
   ```
   POST /api/service-requests
   {CIN, Service_id, description}
   ```
   Création de la demande (status = `pending`)

3. **Admin traite la demande**
   ```
   PUT /api/service-requests/:id/status
   {status: "in_progress"}
   ```

4. **Service complété**
   ```
   PUT /api/service-requests/:id/status
   {status: "completed"}
   ```

## 🆘 Dépannage

### Erreur: "relation \"service\" does not exist"
- La base de données n'est pas créée
- Exécutez: `psql -U postgres -d cityconnect -f ../../../database/schema.sql`

### Erreur: "Cannot connect to database"
- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez les paramètres dans `.env`

### Port 3004 déjà utilisé
- Changez `PORT=3005` dans `.env`
- Ou tuez le processus: `lsof -ti:3004 | xargs kill -9`

## 📞 Support

Pour toute question ou problème, consultez:
- Documentation PostgreSQL: https://www.postgresql.org/docs/
- Express.js: https://expressjs.com/
- Node.js: https://nodejs.org/
