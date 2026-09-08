-- Last Bench de-Manus foundation: Supabase Auth + Supabase Storage.
--
-- The existing users.openId column is intentionally retained to avoid a
-- destructive product-schema rename. Its value is now the Supabase Auth user
-- UUID (auth.users.id) serialized as text.

COMMENT ON COLUMN public.users."openId" IS
  'External auth subject ID. Current identity authority: Supabase Auth auth.users.id UUID serialized as text.';

-- Private student document bucket. Browser/native clients must present a valid
-- Supabase Auth JWT and can only operate inside their own UUID folder.
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'student-documents',
  'student-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "student_documents_select_own" ON storage.objects;
CREATE POLICY "student_documents_select_own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "student_documents_insert_own" ON storage.objects;
CREATE POLICY "student_documents_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "student_documents_update_own" ON storage.objects;
CREATE POLICY "student_documents_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'student-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "student_documents_delete_own" ON storage.objects;
CREATE POLICY "student_documents_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
