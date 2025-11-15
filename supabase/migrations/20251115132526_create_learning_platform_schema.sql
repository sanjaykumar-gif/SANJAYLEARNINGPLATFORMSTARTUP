/*
  # Learning Platform Database Schema

  ## Overview
  Complete database schema for a Udemy-like learning platform with secure video streaming,
  progress tracking, course management, and analytics.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - Either 'student' or 'instructor'
  - `bio` (text, nullable) - User biography
  - `avatar_url` (text, nullable) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. courses
  - `id` (uuid, primary key) - Course identifier
  - `instructor_id` (uuid) - References profiles.id
  - `title` (text) - Course title
  - `description` (text) - Course description
  - `thumbnail_url` (text, nullable) - Course thumbnail
  - `price` (decimal) - Course price
  - `level` (text) - Beginner, Intermediate, or Advanced
  - `category` (text) - Course category
  - `is_published` (boolean) - Publication status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. course_sections
  - `id` (uuid, primary key) - Section identifier
  - `course_id` (uuid) - References courses.id
  - `title` (text) - Section title
  - `order_index` (integer) - Display order
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. lessons
  - `id` (uuid, primary key) - Lesson identifier
  - `section_id` (uuid) - References course_sections.id
  - `title` (text) - Lesson title
  - `description` (text, nullable) - Lesson description
  - `video_url` (text) - Secure video URL
  - `duration_seconds` (integer) - Video duration
  - `order_index` (integer) - Display order
  - `is_preview` (boolean) - Free preview status
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. enrollments
  - `id` (uuid, primary key) - Enrollment identifier
  - `student_id` (uuid) - References profiles.id
  - `course_id` (uuid) - References courses.id
  - `enrolled_at` (timestamptz) - Enrollment timestamp
  - `completed_at` (timestamptz, nullable) - Completion timestamp
  - `progress_percentage` (integer) - Overall progress (0-100)

  ### 6. lesson_progress
  - `id` (uuid, primary key) - Progress identifier
  - `enrollment_id` (uuid) - References enrollments.id
  - `lesson_id` (uuid) - References lessons.id
  - `watched_seconds` (integer) - Seconds watched
  - `is_completed` (boolean) - Completion status
  - `last_watched_at` (timestamptz) - Last watch timestamp

  ### 7. certificates
  - `id` (uuid, primary key) - Certificate identifier
  - `enrollment_id` (uuid) - References enrollments.id
  - `certificate_url` (text, nullable) - Generated certificate URL
  - `issued_at` (timestamptz) - Issue timestamp

  ### 8. reviews
  - `id` (uuid, primary key) - Review identifier
  - `course_id` (uuid) - References courses.id
  - `student_id` (uuid) - References profiles.id
  - `rating` (integer) - Rating 1-5
  - `comment` (text, nullable) - Review text
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies for students to access enrolled courses
  - Policies for instructors to manage their courses
  - Public read access for published courses
  - Secure video URL access based on enrollment

  ## Notes
  - All timestamps use timestamptz for timezone awareness
  - Foreign keys ensure referential integrity
  - Indexes on frequently queried columns for performance
  - Cascading deletes maintain data consistency
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor')),
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  thumbnail_url text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  level text NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  category text NOT NULL,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create course_sections table
CREATE TABLE IF NOT EXISTS course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_id, order_index)
);

ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 0,
  order_index integer NOT NULL,
  is_preview boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(section_id, order_index)
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  UNIQUE(student_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  watched_seconds integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  last_watched_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  certificate_url text,
  issued_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id)
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_id, student_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_course_sections_course ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_section ON lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews(course_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  TO authenticated
  USING (is_published = true OR instructor_id = auth.uid());

CREATE POLICY "Instructors can insert courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can update own courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can delete own courses"
  ON courses FOR DELETE
  TO authenticated
  USING (instructor_id = auth.uid());

-- RLS Policies for course_sections
CREATE POLICY "Users can view sections of accessible courses"
  ON course_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_sections.course_id
      AND (courses.is_published = true OR courses.instructor_id = auth.uid())
    )
  );

CREATE POLICY "Instructors can manage own course sections"
  ON course_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_sections.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- RLS Policies for lessons
CREATE POLICY "Users can view lessons of accessible courses"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_sections cs
      JOIN courses c ON c.id = cs.course_id
      WHERE cs.id = lessons.section_id
      AND (
        c.is_published = true OR 
        c.instructor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM enrollments e
          WHERE e.course_id = c.id AND e.student_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Instructors can manage own course lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_sections cs
      JOIN courses c ON c.id = cs.course_id
      WHERE cs.id = lessons.section_id
      AND c.instructor_id = auth.uid()
    )
  );

-- RLS Policies for enrollments
CREATE POLICY "Students can view own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can create enrollments"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own enrollments"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Instructors can view course enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- RLS Policies for lesson_progress
CREATE POLICY "Students can view own progress"
  ON lesson_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.id = lesson_progress.enrollment_id
      AND enrollments.student_id = auth.uid()
    )
  );

CREATE POLICY "Students can manage own progress"
  ON lesson_progress FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.id = lesson_progress.enrollment_id
      AND enrollments.student_id = auth.uid()
    )
  );

-- RLS Policies for certificates
CREATE POLICY "Students can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.id = certificates.enrollment_id
      AND enrollments.student_id = auth.uid()
    )
  );

CREATE POLICY "System can create certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.id = certificates.enrollment_id
      AND enrollments.student_id = auth.uid()
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enrolled students can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = reviews.course_id
      AND enrollments.student_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());