-- Stage 5 · migrate the three destinations that were hardcoded in lib/content.ts.

insert into public.destinations (
  slug,
  name,
  region,
  hero_image,
  hero_image_alt,
  summary,
  description,
  highlights,
  suitable_for,
  featured,
  display_order,
  inquiry_destination_value
)
values
  (
    'cebu',
    'Cebu',
    'Central Visayas',
    '/destinations/cebu.webp',
    'A whale shark swimming beneath a snorkeller in clear blue water',
    'Island energy, heritage, and ocean adventures in one flexible program.',
    'A flexible starting point for island adventures, heritage, and well-paced group programs.',
    array['Whale shark encounters', 'Heritage and city experiences', 'Island and ocean adventures'],
    array['FIT', 'GIT', 'MICE'],
    true,
    1,
    'cebu'
  ),
  (
    'bohol',
    'Bohol',
    'Central Visayas',
    '/destinations/bohol.webp',
    'Visitors exploring the clear underground pool inside Hinagdanan Cave',
    'Caves, coastlines, countryside, and easy-going group experiences.',
    'A relaxed mix of countryside, coast, and memorable experiences that works across travel styles.',
    array['Cave and countryside visits', 'Coastal downtime', 'Easy-going group experiences'],
    array['FIT', 'GIT', 'MICE'],
    true,
    2,
    'bohol'
  ),
  (
    'boracay',
    'Boracay',
    'Western Visayas',
    '/destinations/boracay.webp',
    'Aerial view of palm trees and a bright white beach beside turquoise water',
    'A polished island escape built around beaches, water, and downtime.',
    'A polished island escape for travellers who want beautiful beaches, water, and room to reset.',
    array['White Beach and island time', 'Water activities', 'Restful group downtime'],
    array['FIT', 'GIT', 'MICE'],
    true,
    3,
    'boracay'
  );
