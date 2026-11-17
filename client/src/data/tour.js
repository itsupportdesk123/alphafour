/**
 * 360° virtual tour: photographic equirectangular panoramas (Poly Haven, CC0) linked
 * room-to-room. yaw/pitch in degrees (0 = image centre, positive yaw = right, positive pitch = up).
 */
export const TOUR_SCENES = [
  {
    id: 'grand-atrium',
    name: 'Grand Atrium',
    caption: 'Double-height arrival atrium with concierge',
    panorama: '/panoramas/grand-atrium.webp',
    thumbnail: '/panoramas/thumbs/grand-atrium.webp',
    view: { yaw: -40, pitch: 2 },
    links: [
      { to: 'living-room', yaw: -40, pitch: -4 },
      { to: 'clubhouse', yaw: -150, pitch: -18 },
      { to: 'sky-lounge', yaw: 112, pitch: -6 },
    ],
    hotspots: [
      { id: 'sculpture', yaw: -57, pitch: 30, title: 'Suspended light sculpture', description: 'A kinetic installation drifting above the atrium.' },
      { id: 'concierge', yaw: 30, pitch: -6, title: 'Concierge & guest services', description: 'Staffed day and night: valet, deliveries, reservations.' },
      { id: 'gallery', yaw: 22, pitch: 34, title: 'Double-height gallery', description: 'Sculpted balconies frame the arrival hall.' },
    ],
  },
  {
    id: 'living-room',
    name: 'Living Room',
    caption: 'Sky Villa living room opening to a sea-facing balcony',
    panorama: '/panoramas/living-room.webp',
    thumbnail: '/panoramas/thumbs/living-room.webp',
    view: { yaw: 5, pitch: 0 },
    links: [
      { to: 'master-suite', yaw: -152, pitch: -2 },
      { to: 'sea-promenade', yaw: 8, pitch: -10 },
      { to: 'grand-atrium', yaw: 128, pitch: -4 },
    ],
    hotspots: [
      { id: 'glazing', yaw: 5, pitch: 14, title: 'Floor-to-ceiling glazing', description: 'Sliding low-iron glass opens to the balcony.' },
      { id: 'ceiling', yaw: 22, pitch: 62, title: 'Timber-clad ceiling', description: 'Hand-finished battens with concealed lighting.' },
      { id: 'media', yaw: 77, pitch: 4, title: 'Media & bar wall', description: 'Bronze-lacquered joinery hides screen and bar.' },
      { id: 'dining', yaw: -110, pitch: -14, title: 'Dining for ten', description: 'Formal dining flows to the show kitchen.' },
    ],
  },
  {
    id: 'master-suite',
    name: 'Master Suite',
    caption: 'Master suite with dressing area and private study',
    panorama: '/panoramas/master-suite.webp',
    thumbnail: '/panoramas/thumbs/master-suite.webp',
    view: { yaw: 40, pitch: -2 },
    links: [
      { to: 'living-room', yaw: -105, pitch: -6 },
      { to: 'spa-bath', yaw: 158, pitch: -4 },
    ],
    hotspots: [
      { id: 'bed', yaw: 65, pitch: -20, title: 'King bed & silk drapes', description: 'Upholstered headboard with reading lights.' },
      { id: 'windows', yaw: 15, pitch: 12, title: 'Layered window drapes', description: 'Motorised blackout and sheer curtains.' },
      { id: 'desk', yaw: -60, pitch: 0, title: 'Writing desk & media wall', description: 'A quiet corner for correspondence.' },
    ],
  },
  {
    id: 'spa-bath',
    name: 'Spa Bathroom',
    caption: 'Stone-clad spa bathroom with soaking tub',
    panorama: '/panoramas/spa-bath.webp',
    thumbnail: '/panoramas/thumbs/spa-bath.webp',
    view: { yaw: 0, pitch: -8 },
    links: [{ to: 'master-suite', yaw: 110, pitch: -4 }],
    hotspots: [
      { id: 'tub', yaw: 0, pitch: -25, title: 'Soaking tub under a skylight', description: 'Bathe beneath the open sky.' },
      { id: 'shower', yaw: -130, pitch: 10, title: 'Rain shower in stone', description: 'Walk-in shower with thermostatic controls.' },
      { id: 'rails', yaw: -55, pitch: 0, title: 'Heated towel rails', description: 'Warm towels, every morning.' },
    ],
  },
  {
    id: 'clubhouse',
    name: 'Residents’ Clubhouse',
    caption: 'Timber-vaulted clubhouse lounge and games room',
    panorama: '/panoramas/clubhouse.webp',
    thumbnail: '/panoramas/thumbs/clubhouse.webp',
    view: { yaw: -30, pitch: -4 },
    links: [
      { to: 'grand-atrium', yaw: -150, pitch: -6 },
      { to: 'sky-lounge', yaw: 75, pitch: -6 },
    ],
    hotspots: [
      { id: 'lounge', yaw: -45, pitch: -15, title: 'Lounge for twenty', description: 'Deep sofas around the media wall.' },
      { id: 'billiards', yaw: 120, pitch: -20, title: 'Billiards & games room', description: 'Tournament-size table and card tables.' },
      { id: 'vault', yaw: 0, pitch: 55, title: 'Timber vaulted ceiling', description: 'Warm oak, sculpted into a soft vault.' },
    ],
  },
  {
    id: 'sky-lounge',
    name: 'Sky Lounge',
    caption: 'Sky lounge and champagne bar with ocean views',
    panorama: '/panoramas/sky-lounge.webp',
    thumbnail: '/panoramas/thumbs/sky-lounge.webp',
    view: { yaw: 10, pitch: 2 },
    links: [
      { to: 'sea-promenade', yaw: 25, pitch: 2 },
      { to: 'clubhouse', yaw: 128, pitch: -6 },
      { to: 'grand-atrium', yaw: -150, pitch: -6 },
    ],
    hotspots: [
      { id: 'views', yaw: 5, pitch: 14, title: 'Wall-to-wall ocean views', description: 'Uninterrupted horizon from every seat.' },
      { id: 'bar', yaw: -60, pitch: -10, title: 'Champagne bar', description: 'A curated cellar and resident sommelier.' },
      { id: 'chairs', yaw: 55, pitch: -25, title: 'Velvet lounge chairs', description: 'Hand-tufted, in antique gold.' },
    ],
  },
  {
    id: 'sea-promenade',
    name: 'Sea Promenade',
    caption: 'Sunset on the seafront promenade',
    panorama: '/panoramas/sea-promenade.webp',
    thumbnail: '/panoramas/thumbs/sea-promenade.webp',
    view: { yaw: 0, pitch: 4 },
    links: [
      { to: 'sky-lounge', yaw: -120, pitch: -4 },
      { to: 'living-room', yaw: -160, pitch: -4 },
    ],
    hotspots: [
      { id: 'sunset', yaw: 0, pitch: 6, title: 'Sunset over the sea', description: 'The view that greets every evening from the seafront.' },
      { id: 'trail', yaw: 95, pitch: -12, title: 'Seafront walking trail', description: 'Three kilometres of promenade at your door.' },
    ],
  },
];

export const getScene = (id) => TOUR_SCENES.find((s) => s.id === id);
