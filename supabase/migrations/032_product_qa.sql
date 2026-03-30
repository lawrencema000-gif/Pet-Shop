-- 032: Product Q&A system (ported from YIWU)

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) >= 10),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'rejected')),
  answer_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_admin_answer boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_product ON questions(product_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_question_answers_question ON question_answers(question_id);

-- Auto-update answer_count
CREATE OR REPLACE FUNCTION update_question_answer_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE questions SET answer_count = (
    SELECT COUNT(*) FROM question_answers
    WHERE question_id = COALESCE(NEW.question_id, OLD.question_id)
  ) WHERE id = COALESCE(NEW.question_id, OLD.question_id);
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_question_answer_count
  AFTER INSERT OR UPDATE OR DELETE ON question_answers
  FOR EACH ROW EXECUTE FUNCTION update_question_answer_count();

-- RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;

-- Published questions: anyone can read
CREATE POLICY "Anyone can read published questions"
  ON questions FOR SELECT USING (status = 'published');

-- Users can read their own (any status)
CREATE POLICY "Users read own questions"
  ON questions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can ask questions
CREATE POLICY "Auth users can ask questions"
  ON questions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all questions
CREATE POLICY "Admins manage questions"
  ON questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- Anyone can read answers
CREATE POLICY "Anyone can read answers"
  ON question_answers FOR SELECT USING (true);

-- Authenticated users can post answers
CREATE POLICY "Auth users can answer"
  ON question_answers FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can manage answers
CREATE POLICY "Admins manage answers"
  ON question_answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

NOTIFY pgrst, 'reload schema';
