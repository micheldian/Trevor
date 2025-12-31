# Fix WhatsApp Constraint Issue

## ✅ What's Been Done

1. **Added Poland and Romania** to the country code dropdown in worker registration
   - Poland: +48 🇵🇱
   - Romania: +40 🇷🇴
   - Changes committed and pushed to branch: `claude/trevor-marketplace-roadmap-UumGR`

2. **Created country code dropdown** with 12 European countries:
   - 🇫🇷 France (+33)
   - 🇧🇪 Belgique (+32)
   - 🇱🇺 Luxembourg (+352)
   - 🇨🇭 Suisse (+41)
   - 🇩🇪 Allemagne (+49)
   - 🇮🇹 Italie (+39)
   - 🇪🇸 Espagne (+34)
   - 🇵🇹 Portugal (+351)
   - 🇳🇱 Pays-Bas (+31)
   - 🇬🇧 Royaume-Uni (+44)
   - 🇵🇱 Pologne (+48)
   - 🇷🇴 Roumanie (+40)

3. **Updated database schema** - removed constraint from `database/schema.sql` for future deployments

## ⚠️ Action Required - Remove Database Constraint

The database still has an active constraint that blocks non-French phone numbers. You need to remove it using one of these methods:

### Method 1: Using the Shell Script (Recommended)

```bash
cd /home/user/Trevor
./remove-constraint.sh
```

### Method 2: Direct Docker Command

```bash
docker exec -i trevor-postgres psql -U trevor_user -d trevor_db -c "ALTER TABLE profiles DROP CONSTRAINT IF EXISTS whatsapp_format;"
```

### Method 3: Using SQL File

```bash
docker exec -i trevor-postgres psql -U trevor_user -d trevor_db < remove-constraint.sql
```

## 🧪 Testing After Fix

Once the constraint is removed, test worker registration:

1. Go to http://localhost:3000/register-worker
2. Fill in the form
3. Select a country code from the dropdown (e.g., Poland +48)
4. Enter a phone number (e.g., 612345678)
5. Submit the form

The WhatsApp number will be saved as: `+48612345678`

## 📝 Technical Details

**Problem**: Database had CHECK constraint requiring format `^\+33[0-9]{9}$` (French numbers only)

**Solution**:
- Frontend: Country code dropdown + phone number input = international format
- Backend: Multiple formatting attempts (service layer, DTO transformer)
- Database: Constraint needs to be removed from running database

**Note**: The backend code includes formatting logic, but due to hot reload issues, it may not be active. The dropdown solution works independently of backend formatting.
