insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'destination-images', 'destination-images', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);
