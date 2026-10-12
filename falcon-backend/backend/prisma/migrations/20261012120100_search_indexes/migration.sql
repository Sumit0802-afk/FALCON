-- Full-text search. Prisma cannot describe these for PostgreSQL, so they are written here.
-- Each is built on the exact expression the matching query uses; change one and the other
-- must change with it (services/library.service.ts, services/emailTemplate.service.ts).

CREATE INDEX "library_templates_search" ON "library_templates"
  USING GIN (to_tsvector('simple', "title" || ' ' || "keywords"));

CREATE INDEX "email_templates_search" ON "email_templates"
  USING GIN (to_tsvector('simple', "title" || ' ' || "description" || ' ' || "keywords"));
