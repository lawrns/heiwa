-- 20250102002_create_surf_camp_assignments.sql
-- Create tables for surf camp assignments (clients and rooms)

BEGIN;

-- Table for surf camp client assignments
CREATE TABLE IF NOT EXISTS public.surf_camp_client_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  surf_camp_id UUID NOT NULL REFERENCES public.surf_camps(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no duplicate assignments
  UNIQUE(surf_camp_id, client_id)
);

-- Table for surf camp room assignments
CREATE TABLE IF NOT EXISTS public.surf_camp_room_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  surf_camp_id UUID NOT NULL REFERENCES public.surf_camps(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no duplicate assignments
  UNIQUE(surf_camp_id, room_id)
);

-- Add RLS policies
ALTER TABLE public.surf_camp_client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surf_camp_room_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for client assignments (owners can only see their own properties' assignments)
CREATE POLICY "surf_camp_client_assignments_select" ON public.surf_camp_client_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surf_camps sc
      JOIN public.properties p ON sc.property_id = p.id
      WHERE sc.id = surf_camp_client_assignments.surf_camp_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "surf_camp_client_assignments_insert" ON public.surf_camp_client_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.surf_camps sc
      JOIN public.properties p ON sc.property_id = p.id
      WHERE sc.id = surf_camp_client_assignments.surf_camp_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "surf_camp_client_assignments_delete" ON public.surf_camp_client_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.surf_camps sc
      JOIN public.properties p ON sc.property_id = p.id
      WHERE sc.id = surf_camp_client_assignments.surf_camp_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
      )
    )
  );

-- RLS policies for room assignments (owners can only see their own properties' assignments)
CREATE POLICY "surf_camp_room_assignments_select" ON public.surf_camp_room_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surf_camps sc
      JOIN public.properties p ON sc.property_id = p.id
      WHERE sc.id = surf_camp_room_assignments.surf_camp_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "surf_camp_room_assignments_insert" ON public.surf_camp_room_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.surf_camps sc
      JOIN public.properties p ON sc.property_id = p.id
      WHERE sc.id = surf_camp_room_assignments.surf_camp_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "surf_camp_room_assignments_delete" ON public.surf_camp_room_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.surf_camps sc
      JOIN public.properties p ON sc.property_id = p.id
      WHERE sc.id = surf_camp_room_assignments.surf_camp_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
      )
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_surf_camp_client_assignments_updated_at
  BEFORE UPDATE ON public.surf_camp_client_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surf_camp_room_assignments_updated_at
  BEFORE UPDATE ON public.surf_camp_room_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.surf_camp_client_assignments IS 'Tracks which clients are assigned to which surf camps';
COMMENT ON TABLE public.surf_camp_room_assignments IS 'Tracks which rooms are assigned to which surf camps';

COMMIT;
