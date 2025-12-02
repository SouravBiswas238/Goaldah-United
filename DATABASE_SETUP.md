# PostgreSQL Database Setup for Goaldah United

## Prerequisites
You need PostgreSQL installed on your Mac. If you don't have it:

### Install PostgreSQL (if not installed)
```bash
# Using Homebrew
brew install postgresql@16
brew services start postgresql@16
```

## Step 1: Create the Database

### Option A: Using Command Line
```bash
# Create the database
createdb goaldah_united

# Verify it was created
psql -l | grep goaldah_united
```

### Option B: Using psql Interactive Shell
```bash
# Open PostgreSQL shell
psql postgres

# Inside psql, run:
CREATE DATABASE goaldah_united;

# List databases to verify
\l

# Exit psql
\q
```

### Option C: Using pgAdmin 4 (Recommended GUI Method)

#### First Time Setup - Register Your PostgreSQL Server

1. **Launch pgAdmin 4**
   - Open pgAdmin 4 from your Applications folder
   - The pgAdmin interface will open in your web browser

2. **Register Your Local PostgreSQL Server**
   - In the left sidebar (Browser panel), right-click on "Servers"
   - Select "Register" → "Server..."
   
3. **Configure Server Connection**
   
   **General Tab:**
   - **Name**: `Local PostgreSQL` (or any name you prefer)
   
   **Connection Tab:**
   - **Host name/address**: `localhost`
   - **Port**: `5432`
   - **Maintenance database**: `postgres`
   - **Username**: `postgres` (or your Mac username)
   - **Password**: `postgres` (or leave empty if using trust authentication)
   - ☑️ Check "Save password" (optional, for convenience)
   
4. **Click "Save"**
   - Your server should now appear in the left sidebar
   - Click the dropdown arrow to expand it

#### Create the Database

1. **Navigate to Databases**
   - Expand your server (e.g., "Local PostgreSQL")
   - Right-click on "Databases"
   - Select "Create" → "Database..."

2. **Configure Database**
   - **Database**: `goaldah_united`
   - **Owner**: `postgres` (or your username)
   - Click "Save"

3. **Verify Creation**
   - You should now see `goaldah_united` listed under Databases
   - Click on it to expand and explore

#### Managing Your Database with pgAdmin 4

**View Tables** (after running the server):
- Expand: `goaldah_united` → `Schemas` → `public` → `Tables`
- You'll see tables like `members`, `events`, `attendance`, etc.

**Run SQL Queries**:
- Right-click on `goaldah_united`
- Select "Query Tool"
- Type your SQL queries and click the ▶️ (Execute) button

**View Table Data**:
- Right-click on any table (e.g., `members`)
- Select "View/Edit Data" → "All Rows"

**Backup Database**:
- Right-click on `goaldah_united`
- Select "Backup..."
- Choose location and format, then click "Backup"

**Restore Database**:
- Right-click on `goaldah_united`
- Select "Restore..."
- Choose your backup file and click "Restore"

## Step 2: Verify Database Credentials

Your current `server/.env` file has:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/goaldah_united
```

This assumes:
- **Username**: `postgres`
- **Password**: `postgres`
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `goaldah_united`

### Check Your PostgreSQL User & Password

#### Find your PostgreSQL username:
```bash
whoami
```
Usually, the default PostgreSQL user is either `postgres` or your Mac username.

#### Test connection:
```bash
# Try connecting with postgres user
psql -U postgres -d goaldah_united

# OR try with your Mac username
psql -U $(whoami) -d goaldah_united
```

If you get "password authentication failed", you need to:

#### Option 1: Set a password for postgres user
```bash
psql postgres
ALTER USER postgres PASSWORD 'postgres';
\q
```

#### Option 2: Update .env to use your Mac username (no password)
If PostgreSQL is configured for local trust authentication:
```env
DATABASE_URL=postgresql://$(whoami)@localhost:5432/goaldah_united
```

Replace `$(whoami)` with your actual username, for example:
```env
DATABASE_URL=postgresql://sourav12@localhost:5432/goaldah_united
```

## Step 3: Start the Server

After creating the database and verifying credentials:

```bash
cd /Users/sourav12/projects/Village/server
npm run dev
```

The server should now connect successfully and create all tables automatically!

## Troubleshooting

### Error: "database does not exist"
→ Run `createdb goaldah_united`

### Error: "password authentication failed"
→ Update the username/password in `server/.env`

### Error: "connection refused"
→ PostgreSQL is not running. Start it with:
```bash
brew services start postgresql@16
```

### Check if PostgreSQL is running:
```bash
brew services list | grep postgresql
```
