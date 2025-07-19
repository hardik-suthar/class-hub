-- Reset and seed database for development/testing
-- Truncate all tables and restart identity (reset auto-increment IDs)
TRUNCATE TABLE comment, announcement, enrollment, "group", "user", role RESTART IDENTITY CASCADE;

-- Insert roles
to role (id, name) VALUES (1, 'STUDENT'), (2, 'TEACHER');

-- Insert users
INSERT INTO "user" (id, username, password, email, role_id) VALUES
  (1, 'alice', 'password1', 'alice@example.com', 1),
  (2, 'bob', 'password2', 'bob@example.com', 2);

-- Insert groups
INSERT INTO "group" (id, name, join_code, created_at, teacher_id) VALUES
  (1, 'Math 101', 'MATH123', NOW(), 2),
  (2, 'Physics 201', 'PHYS456', NOW(), 2);

-- Insert enrollments
INSERT INTO enrollment (id, user_id, group_id) VALUES
  (1, 1, 1),
  (2, 1, 2);

-- Insert announcements
INSERT INTO announcement (id, title, content, group_id, created_at, user_id) VALUES
  (1, 'Welcome!', 'Welcome to Math 101', 1, NOW(), 2),
  (2, 'First Class', 'First class is on Monday', 2, NOW(), 2);

-- Insert comments
INSERT INTO comment (id, content, announcement_id, user_id, created_at) VALUES
  (1, 'Excited to join!', 1, 1, NOW()),
  (2, 'Looking forward to it!', 2, 1, NOW()); 