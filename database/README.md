# Falcon — Database

Local MySQL setup for Falcon, plus raw SQL and backup/restore tooling. The
source of truth for the schema is `falcon-backend/prisma/schema.prisma`
(Prisma manages migrations from there) — `init/01_schema.sql` here is a
plain-SQL mirror of the same three tables, for quick manual bootstrap or
review without needing the Prisma CLI.

## Folder structure

```
docker-compose.yml   MySQL 8.4 + Adminer (DB browser UI), for local dev
init/
  01_schema.sql       CREATE TABLE for users, projects, pages (mirrors Prisma schema)
  02_seed.sql          Demo user + starter project (demo@falcon.app / password123)
scripts/
  backup.sh            mysqldump -> backups/falcon_<timestamp>.sql
  restore.sh            Load a .sql dump back into the database
backups/               Where dumps land (git-ignored, .gitkeep keeps the folder)
.env.example            Credentials used by docker-compose.yml
```

## Option A — Docker (recommended for local dev)

```bash
cp .env.example .env
docker compose up -d
```

This starts MySQL on `localhost:3306` and, **only on the very first boot**
(empty data volume), automatically runs `init/01_schema.sql` then
`init/02_seed.sql` — so you get the schema and a demo login for free.

Adminer (a web DB browser) is at `http://localhost:8080` — system: MySQL,
server: `mysql`, user/password from `.env`, database: `falcon`.

Point `falcon-backend/.env`'s `DATABASE_URL` at it:
```
DATABASE_URL="mysql://falcon:falcon@localhost:3306/falcon"
```

## Option B — Your own MySQL install

```bash
mysql -u root -p < init/01_schema.sql
mysql -u root -p < init/02_seed.sql   # optional demo data
```

## Option C — Let Prisma manage it

If you'd rather Prisma create the tables (recommended once you're past
initial setup, since it also tracks migration history):
```bash
cd ../falcon-backend
npm run prisma:migrate
npm run seed
```
Do **not** run both the raw SQL init scripts and `prisma migrate` against
the same empty database — pick one path so Prisma's migration history
matches what's actually in the database.

## Backups

```bash
./scripts/backup.sh                                   # dumps the local docker-compose DB
DB_HOST=your-host DB_USER=you DB_PASSWORD=*** ./scripts/backup.sh   # dumps anywhere else

./scripts/restore.sh backups/falcon_20260909_120000.sql
```
