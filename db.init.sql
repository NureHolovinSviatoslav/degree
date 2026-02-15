-- =========================================
-- ІНІЦІАЛІЗАЦІЯ БАЗИ ДАНИХ ДЛЯ
-- "Веб-система для мікрольорнінгу
-- з елементами гейміфікації"
-- =========================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================
-- 1. USERS
-- =========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    phone VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 2. GAMIFICATION SETTINGS
-- Персональні налаштування користувача
-- =========================================
CREATE TABLE gamification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    badges_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    streaks_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_gamification_settings_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- 3. COURSES
-- =========================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_courses_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- =========================================
-- 4. LESSONS
-- =========================================
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(1000) NOT NULL,
    transcription TEXT NOT NULL,
    position INT NOT NULL CHECK (position > 0),

    CONSTRAINT fk_lessons_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_lessons_course_position UNIQUE (course_id, position)
);

-- =========================================
-- 5. TEST QUESTIONS
-- =========================================
CREATE TABLE test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL,
    question_text TEXT NOT NULL,

    CONSTRAINT fk_test_questions_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- 6. ANSWER OPTIONS
-- =========================================
CREATE TABLE answer_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL,
    option_text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_answer_options_question
        FOREIGN KEY (question_id)
        REFERENCES test_questions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- 7. ENROLLMENTS
-- =========================================
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'completed')),
    completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0
        CHECK (completion_percent >= 0 AND completion_percent <= 100),
    last_activity_at TIMESTAMP,

    CONSTRAINT fk_enrollments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_enrollments_user_course UNIQUE (user_id, course_id)
);

-- =========================================
-- 8. LESSON PROGRESS
-- =========================================
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    is_viewed BOOLEAN NOT NULL DEFAULT FALSE,
    test_score NUMERIC(5,2) NOT NULL DEFAULT 0
        CHECK (test_score >= 0 AND test_score <= 100),
    completed_at TIMESTAMP,

    CONSTRAINT fk_lesson_progress_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_lesson_progress_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_lesson_progress_user_lesson UNIQUE (user_id, lesson_id)
);

-- =========================================
-- 9. ACTIVITY STREAKS
-- =========================================
CREATE TABLE activity_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    current_count INT NOT NULL DEFAULT 0 CHECK (current_count >= 0),
    last_active_date DATE,

    CONSTRAINT fk_activity_streaks_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- 10. BADGES
-- =========================================
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    condition_type VARCHAR(50) NOT NULL CHECK (
        condition_type IN ('course_completion', 'activity_streak')
    )
);

-- =========================================
-- 11. USER BADGES
-- =========================================
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL,
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_badges_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_user_badges_badge
        FOREIGN KEY (badge_id)
        REFERENCES badges(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_user_badges_user_badge UNIQUE (user_id, badge_id)
);

-- =========================================
-- 12. NOTIFICATIONS
-- =========================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('whatsapp')),
    message TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================================
-- ІНДЕКСИ
-- =========================================
CREATE INDEX idx_gamification_settings_user_id ON gamification_settings(user_id);
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_test_questions_lesson_id ON test_questions(lesson_id);
CREATE INDEX idx_answer_options_question_id ON answer_options(question_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

-- =========================================
-- ПОЧАТКОВІ БЕЙДЖІ
-- =========================================
INSERT INTO badges (name, description, condition_type)
VALUES
    ('First Completed Course', 'Надається за завершення першого курсу', 'course_completion'),
    ('3-Day Streak', 'Надається за 3 дні безперервної активності', 'activity_streak'),
    ('7-Day Streak', 'Надається за 7 днів безперервної активності', 'activity_streak');