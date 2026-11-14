DROP TABLE IF EXISTS quiz_attempts, study_logs, lessons, users, groups, announcements CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL,
  name VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(20) CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  subject VARCHAR(80),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  ai_requests_count INT DEFAULT 0,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  xp_points INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_active_date DATE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  summary JSONB NOT NULL,
  flashcards JSONB NOT NULL,
  quiz JSONB NOT NULL,
  podcast_script JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  score_percent INT NOT NULL,
  wrong_question_indices INT[] DEFAULT '{}',
  tab_switches INT DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  study_date DATE DEFAULT CURRENT_DATE,
  seconds_spent INT DEFAULT 0,
  UNIQUE(student_id, study_date)
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
