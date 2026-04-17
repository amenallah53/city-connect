# Database Schema Migration Guide

## Current Status

✅ **Backend**: Working with current PostgreSQL schema  
✅ **Database**: Operational with 24 tables (see details below)  
✅ **API**: Successfully returning service requests with correct data mapping

---

## Schema Comparison: Current vs. New (city-connect-db-script-1.sql)

### **USERS Table**

| Property | Current Schema | New Schema |
|----------|----------------|-----------|
| **ID** | `INTEGER` (serial) | `UUID` (gen_random_uuid) |
| **Name** | `fullname VARCHAR` | `first_name, last_name VARCHAR` |
| **CIN** | `INTEGER` | `INTEGER` (unique, not null) |
| **Email** | `VARCHAR` | `VARCHAR` (unique) |
| **Phone** | `phone VARCHAR` | `telephone VARCHAR` |
| **Password** | `VARCHAR` | `VARCHAR` |
| **Address** | ❌ Not in table | `adresse VARCHAR` |
| **Birth Date** | ❌ Not in table | `date_naissance DATE` |
| **Role** | `user_role ENUM` (citizen/prestataire/admin) | `role VARCHAR` with CHECK constraint |
| **Timestamps** | `createdat, updatedat` | `created_at` |

### **DEMANDESERVICE Table**

| Property | Current Schema | New Schema |
|----------|----------------|-----------|
| **Table Name** | `demandeservice` | `demande_service` |
| **ID** | `INTEGER` (serial) | `UUID` |
| **CIN** | `INTEGER` | `INTEGER` |
| **Service ID** | `INTEGER` → `service.id` | `UUID` → `service.id` |
| **Status** | `demande_status ENUM` (pending/approved/rejected/completed) | `VARCHAR` with CHECK (en_attente/en_cours/approuvee/rejetee/terminee) |
| **Description** | `requestdescription` | `description` |
| **Created Date** | `requestedat TIMESTAMP` | `date_creation TIMESTAMP` |
| **Uploaded** | ❌ Not present | `upload_date TIMESTAMP` |
| **Extra Fields** | `approvedat, completedat, estimatedcompletiondate, cost, paymentstatus` | None (removed) |

### **SERVICE Table**

| Property | Current Schema | New Schema |
|----------|----------------|-----------|
| **ID** | `INTEGER` (serial) | `UUID` |
| **Name** | `nom VARCHAR` | `name VARCHAR` |
| **Type** | `service_type ENUM` | `VARCHAR` |
| **Description** | `VARCHAR` | `TEXT` |
| **Badges** | `VARCHAR` | `TEXT[]` array |
| **Extra Fields** | `category, requirements, estimateddays, price, imageurl, isactive` | `requirements TEXT, badges TEXT[], type VARCHAR` |

### **DOCUMENTS Table**

| Property | Current Schema | New Schema |
|----------|----------------|-----------|
| **Table Name** | `demandeservice_document` | `demande_service_document` |
| **Foreign Key** | `demandeservice_id` | `demande_id` |
| **File URL** | ❌ Not present | `file_url TEXT` (Backblaze B2 URL) |
| **File Type** | `file_type VARCHAR` | `file_type VARCHAR` |
| **Filename** | `nom VARCHAR` | `nom VARCHAR` |
| **Size** | `taille VARCHAR` | `taille VARCHAR` |

### **NEW Tables in New Schema (not in current DB)**

These tables are defined in the new schema but don't exist in the current database:

- `municipalite` - Municipality master data
- `horaire_service` - Service schedules
- `news` - News/announcements
- `news_article` - News sub-articles
- `plainte_categorie` - Complaint categories
- `plainte` - Complaints/signalements
- `plainte_media` - Complaint attachments
- `plainte_reponse` - Complaint responses
- `certificat_service` - Generated certificates
- `auth_session` - Authentication sessions (JWT)
- `notification` - User notifications
- `prestataire` - Service provider profiles
- `admin` - Admin profiles
- `conversation_session` - Chatbot sessions
- `message` - Chat messages
- `job` - Job postings
- `job_offer` - Job applications
- `faqs` - FAQ entries

---

## Migration Strategy

### **Option 1: Maintain Current Database (RECOMMENDED - CURRENT STATE)**

**Pros:**
- ✅ Zero data loss
- ✅ Backward compatible with existing code
- ✅ Can be done incrementally
- ✅ Lower risk of service interruption

**Cons:**
- Schema doesn't match new ER diagram design

**Implementation:** Already done - backend continues using current schema

---

### **Option 2: Full Migration to New Schema (Complex)**

**Required Steps:**

1. **Create new database from city-connect-db-script-1.sql**
   ```sql
   CREATE DATABASE cityconnect_new;
   -- Execute city-connect-db-script-1.sql on new database
   ```

2. **Data Migration with UUID Generation**
   ```sql
   -- Migrate users with new UUID structure
   INSERT INTO cityconnect_new.users (
     id, cin, first_name, last_name, email, password, 
     adresse, telephone, role, created_at
   )
   SELECT 
     gen_random_uuid(), 
     cin, 
     SPLIT_PART(fullname, ' ', 1),
     SPLIT_PART(fullname, ' ', 2),
     email, 
     password,
     NULL,  -- address not in current schema
     phone,
     CASE role 
       WHEN 'citizen' THEN 'citoyen'
       WHEN 'prestataire' THEN 'prestataire'
       WHEN 'admin' THEN 'admin'
     END,
     createdat
   FROM cityconnect.users;
   ```

3. **Update Foreign Key References**
   - Map old user IDs to new UUIDs
   - Update all service requests, complaints, etc.

4. **Update Backend Code**
   - Table names: `demandeservice` → `demande_service`
   - Column names: `requestdescription` → `description`, etc.
   - Status mapping: english → french
   - User lookups: Use UUID instead of CIN

**Risks:**
- ⚠️ Complex data transformation needed
- ⚠️ Risk of data inconsistency during migration
- ⚠️ Service downtime required
- ⚠️ Requires careful testing and rollback plan

---

### **Option 3: Hybrid Approach (RECOMMENDED FOR PRODUCTION)**

Leverage the new schema design while preserving backward compatibility:

1. Keep current database as-is for existing features
2. Create new tables from the new schema (municipalite, news, faqs, etc.)
3. Keep current table names but update backend queries to new column names incrementally
4. Migrate one feature at a time (news → jobs → complaints)

**Implementation Timeline:**
- Phase 1: Add new tables (news, faqs, job management)
- Phase 2: Add auth_session, notification tables
- Phase 3: Refactor demandeservice → demande_service (with data backup)
- Phase 4: Migrate users table  (most complex)

---

## Current Backend Mapping

The backend currently handles these mappings automatically:

### Status Mapping (Frontend ← Database)
```javascript
'en_attente' ← 'pending'
'en_cours' ← 'in_progress'
'approuvee' ← 'approved'
'rejetee' ← 'rejected'
'terminee' ← 'completed'
```

### Response Normalization
- Database `fullname` field is preserved in API responses
- `requestdescription` → `requestdescription` (unchanged)
- `requestedat` → `requestedat` (unchanged)
- Attachments queried from `demandeservice_document` table

---

## Recommended Next Steps

1. **Run full table scan**: Execute inspect-schema.js to document all current table structures
2. **Database backup**: Create snapshot before any migration attempt
3. **Incremental migration**: Start with adding new tables that don't affect existing data
4. **Testing**: Create test database and verify all queries work with both schemas
5. **Documentation**: Update all database diagrams and ER models

---

## Files Referenced

- **Current Backend**: `/backend/services/services-service/src/controllers/demandeServiceController.js`
- **New Schema Definition**: `/database/city-connect-db-script-1.sql`
- **Current Schema Inspection**: `/backend/services/services-service/inspect-schema.js`
- **This Guide**: `/SCHEMA_MIGRATION_GUIDE.md`
