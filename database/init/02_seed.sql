-- Demo data for local development. Safe to re-run (INSERT IGNORE).
-- Login: demo@falcon.app / password123

USE `falcon`;

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `passwordHash`, `createdAt`, `updatedAt`)
VALUES (
  'usr_demo0000000000000000001',
  'Demo User',
  'demo@falcon.app',
  -- bcrypt hash of "password123" (10 rounds)
  '$2b$10$7EwuzxRXIPuXXZXNt7I3O.txVl1yU99xGOHWkLxpiQHY5Elq9t4S6',
  NOW(3),
  NOW(3)
);

INSERT IGNORE INTO `projects` (`id`, `title`, `thumbnailUrl`, `ownerId`, `createdAt`, `updatedAt`)
VALUES (
  'prj_demo0000000000000000001',
  'Untitled design',
  NULL,
  'usr_demo0000000000000000001',
  NOW(3),
  NOW(3)
);

INSERT IGNORE INTO `pages`
  (`id`, `name`, `width`, `height`, `presetName`, `background`, `elements`, `order`, `projectId`, `createdAt`, `updatedAt`)
VALUES (
  'pg_demo00000000000000000001',
  'Page 1',
  1080,
  1080,
  'Instagram Post',
  '#FFFFFF',
  JSON_ARRAY(),
  0,
  'prj_demo0000000000000000001',
  NOW(3),
  NOW(3)
);
