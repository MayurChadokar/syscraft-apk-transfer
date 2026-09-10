-- ================================================================
-- SYSCRAFT APK TRANSFER — SUPABASE MIGRATION
-- Part 1: Run this in Supabase → SQL Editor → New Query → Run
-- ================================================================

-- ---------------------------------------------------------------
-- STEP 1: Create apk_files table
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.apk_files (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name           TEXT         NOT NULL,
  slug               TEXT         UNIQUE NOT NULL,
  original_file_name TEXT         NOT NULL,
  storage_path       TEXT         NOT NULL,
  file_size          BIGINT,
  uploaded_by        UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ  DEFAULT now(),
  expires_at         TIMESTAMPTZ  NOT NULL,
  download_count     INTEGER      DEFAULT 0,
  status             TEXT         DEFAULT 'active',
  platform           TEXT         DEFAULT 'android'
);


-- ---------------------------------------------------------------
-- STEP 2: Indexes for fast lookups
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_apk_slug        ON public.apk_files(slug);
CREATE INDEX IF NOT EXISTS idx_apk_user        ON public.apk_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_apk_expires     ON public.apk_files(expires_at);
CREATE INDEX IF NOT EXISTS idx_apk_status      ON public.apk_files(status);

-- ---------------------------------------------------------------
-- STEP 3: Enable Row Level Security
-- ---------------------------------------------------------------
ALTER TABLE public.apk_files ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- STEP 4: RLS Policies for apk_files table
-- ---------------------------------------------------------------

-- Drop old policies if re-running
DROP POLICY IF EXISTS "auth_select_own"            ON public.apk_files;
DROP POLICY IF EXISTS "auth_insert_own"            ON public.apk_files;
DROP POLICY IF EXISTS "auth_delete_own"            ON public.apk_files;
DROP POLICY IF EXISTS "public_select_for_download" ON public.apk_files;

-- Logged-in users: read their own APKs
CREATE POLICY "auth_select_own"
  ON public.apk_files FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Logged-in users: upload their own APKs
CREATE POLICY "auth_insert_own"
  ON public.apk_files FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- Logged-in users: delete their own APKs
CREATE POLICY "auth_delete_own"
  ON public.apk_files FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Public (anyone): read APK info for the download page
CREATE POLICY "public_select_for_download"
  ON public.apk_files FOR SELECT
  TO anon
  USING (true);

-- ---------------------------------------------------------------
-- STEP 5: Download counter function (race-condition safe)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_download(p_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.apk_files
  SET download_count = download_count + 1
  WHERE slug = p_slug
    AND expires_at > NOW();
END;
$$;

-- Allow public download page to call this function
GRANT EXECUTE ON FUNCTION public.increment_download(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_download(TEXT) TO authenticated;

-- ---------------------------------------------------------------
-- STEP 6: Storage Bucket Policies
-- (Only run AFTER creating bucket manually — see Part 2 below)
-- ---------------------------------------------------------------

-- Drop old storage policies if re-running
DROP POLICY IF EXISTS "auth_upload_own_folder"   ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_own_files"    ON storage.objects;
DROP POLICY IF EXISTS "auth_select_own_files"    ON storage.objects;
DROP POLICY IF EXISTS "allow_signed_url_creation" ON storage.objects;

-- Authenticated users can upload to their own folder
CREATE POLICY "auth_upload_own_folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'apk-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own files
CREATE POLICY "auth_delete_own_files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'apk-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can read their own files
CREATE POLICY "auth_select_own_files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'apk-files');

-- Public can access files to generate signed download URLs
CREATE POLICY "allow_signed_url_creation"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'apk-files');

-- ================================================================
-- DONE! Table + RLS + Function + Storage Policies are ready.
-- ================================================================
