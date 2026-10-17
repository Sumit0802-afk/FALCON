# Falcon — Database

Falcon runs on PostgreSQL. Its tables are made by the Prisma migrations in
`falcon-backend/backend/prisma/migrations`; there is no hand-written SQL to run.

## Local database with Docker

```bash
cd database
cp .env.example .env        # then set POSTGRES_PASSWORD
docker compose up -d
```

The database listens on `127.0.0.1:5432` only. Point the backend at it in
`falcon-backend/backend/.env`:

```
DATABASE_URL=postgresql://falcon:<your password>@localhost:5432/falcon
```

Then make the tables and, if you like, some sample data:

```bash
cd falcon-backend/backend
npx prisma migrate deploy
npm run seed            # a demo account; prints its password once
```

## Without Docker

Install PostgreSQL 14 or newer, create a database named `falcon`, and set
`DATABASE_URL` as above.

## Backups

```bash
pg_dump "$DATABASE_URL" > backups/falcon_$(date +%Y%m%d_%H%M).sql
psql "$DATABASE_URL" < backups/<file>.sql
```

`backups/` is ignored by Git.
