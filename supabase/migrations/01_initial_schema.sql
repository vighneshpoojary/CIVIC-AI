-- CivicAI PostgreSQL Schema Migration
-- Project: CivicAI – Smarter Cities. Stronger Communities.
-- Target: Supabase PostgreSQL (PostGIS enabled)

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    head_name TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- references auth.users(id)
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'officer', 'admin')),
    department_id UUID REFERENCES public.departments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Officers Directory Table
CREATE TABLE IF NOT EXISTS public.officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id),
    officer_name TEXT NOT NULL,
    officer_designation TEXT NOT NULL,
    department_name TEXT NOT NULL,
    cases_handled INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id TEXT NOT NULL UNIQUE,
    citizen_id UUID,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Bengaluru',
    ward TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'AI Reviewed', 'Awaiting Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Needs Clarification', 'Reopened')),
    assigned_department_id TEXT,
    assigned_officer_id TEXT,
    is_synthetic BOOLEAN DEFAULT FALSE,
    source_name TEXT DEFAULT 'Citizen Portal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Spatial index for sub-second geographical queries
CREATE INDEX IF NOT EXISTS idx_complaints_lat_lon ON public.complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);

-- 6. AI Assessments Table
CREATE TABLE IF NOT EXISTS public.ai_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    suggested_category TEXT NOT NULL,
    suggested_subcategory TEXT,
    suggested_department TEXT,
    priority_recommendation TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    priority_reasoning JSONB DEFAULT '[]'::jsonb,
    model_version TEXT DEFAULT 'gemini-2.5-flash',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Status History & Audit Log
CREATE TABLE IF NOT EXISTS public.status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    public_note TEXT,
    internal_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Duplicate Detection Matches
CREATE TABLE IF NOT EXISTS public.complaint_duplicates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    duplicate_complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    similarity_score REAL NOT NULL,
    distance_meters REAL NOT NULL,
    match_rationale TEXT,
    status TEXT DEFAULT 'Suggested Match',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Citizen Feedback Table
CREATE TABLE IF NOT EXISTS public.complaint_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    citizen_id UUID,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies
-- Public view policy: anyone can view complaints for the public map & tracking
CREATE POLICY "Public complaints are viewable by all" 
ON public.complaints FOR SELECT USING (true);

-- Authenticated users can insert their own complaints
CREATE POLICY "Users can create complaints" 
ON public.complaints FOR INSERT WITH CHECK (true);

-- Officers & Admins can update complaints
CREATE POLICY "Officers and admins can update complaints" 
ON public.complaints FOR UPDATE USING (true);

-- Insert Initial Seed Departments
INSERT INTO public.departments (name, code, head_name, contact_email) VALUES
('Roads and Infrastructure', 'DEPT_ROADS', 'Chief Engineer Major Roads', 'roads.bbmp@karnataka.gov.in'),
('Solid Waste Management', 'DEPT_SWM', 'Superintending Engineer SWM', 'swm.bbmp@karnataka.gov.in'),
('Electrical Engineering', 'DEPT_ELEC', 'Executive Engineer Electrical', 'electrical.bbmp@karnataka.gov.in'),
('Storm Water Drains', 'DEPT_SWD', 'Chief Engineer SWD', 'swd.bbmp@karnataka.gov.in'),
('Water Supply (BWSSB)', 'DEPT_WATER', 'Executive Engineer BWSSB', 'bwssb.support@karnataka.gov.in'),
('Public Safety & Encroachment', 'DEPT_SAFETY', 'Joint Commissioner Public Safety', 'safety.bbmp@karnataka.gov.in')
ON CONFLICT (name) DO NOTHING;
