-- Add description to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS description TEXT;

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'completed', 'deleted', etc.
  entity_type TEXT NOT NULL, -- 'project', 'task'
  entity_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT ON TABLE public.activity_logs TO authenticated;
GRANT ALL ON TABLE public.activity_logs TO service_role;

-- Policies
CREATE POLICY "Users can view activity in their projects" ON public.activity_logs
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = activity_logs.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own activity" ON public.activity_logs
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);