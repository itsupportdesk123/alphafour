import { PHOTOS as P } from '@/lib/media';

export const GALLERY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'interior', label: 'Interiors' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'views', label: 'Aerial & Views' },
];

/** `ratio` = width / height of the crop shown in the masonry grid. */
export const GALLERY = [
  { photo: P.towerGlassUp, category: 'exterior', title: 'The tower at golden hour', ratio: 3 / 4 },
  { photo: P.livingStairPool, category: 'interior', title: 'Living room opening to the pool', ratio: 4 / 3 },
  { photo: P.infinityPoolCabanas, category: 'amenities', title: 'Infinity pool at sunset', ratio: 4 / 3 },
  { photo: P.shorelineAerial, category: 'views', title: 'The shoreline from above', ratio: 16 / 10 },
  { photo: P.kitchenWhiteMarble, category: 'interior', title: 'Marble-topped kitchen', ratio: 3 / 4 },
  { photo: P.villaDuskGlow, category: 'exterior', title: 'Garden villa, evening', ratio: 4 / 3 },
  { photo: P.spaTowels, category: 'amenities', title: 'Spa suite', ratio: 1 },
  { photo: P.bedroomDarkModern, category: 'interior', title: 'Master suite in dark timber', ratio: 4 / 3 },
  { photo: P.poolInfinityOcean, category: 'views', title: 'Infinity edge over the Bay of Bengal', ratio: 3 / 4 },
  { photo: P.villaPoolModern, category: 'exterior', title: 'Villa with reflecting pool', ratio: 16 / 10 },
  { photo: P.coworking, category: 'amenities', title: 'Residents’ co-working lounge', ratio: 3 / 4 },
  { photo: P.livingWhiteMinimal, category: 'interior', title: 'Light-filled living room', ratio: 3 / 4 },
  { photo: P.cityAerialNight, category: 'views', title: 'City lights from the sky deck', ratio: 4 / 3 },
  { photo: P.villaWhitePool, category: 'exterior', title: 'White villa and pool', ratio: 4 / 3 },
  { photo: P.poolDeckLoungers, category: 'amenities', title: 'Pool deck and loungers', ratio: 4 / 3 },
  { photo: P.livingDiningView, category: 'interior', title: 'Open living and dining', ratio: 1 },
  { photo: P.seaFirstLight, category: 'views', title: 'The sea at first light', ratio: 16 / 10 },
  { photo: P.houseModernGable, category: 'exterior', title: 'Contemporary house façade', ratio: 3 / 4 },
  { photo: P.gymDumbbells, category: 'amenities', title: 'Fitness atelier', ratio: 4 / 3 },
  { photo: P.bathTub, category: 'interior', title: 'Freestanding bath', ratio: 3 / 4 },
  { photo: P.poolDeckSea, category: 'views', title: 'Sea-view pool deck', ratio: 4 / 3 },
  { photo: P.houseWood, category: 'exterior', title: 'Timber-clad façade', ratio: 3 / 4 },
  { photo: P.poolCourtyardNight, category: 'amenities', title: 'Pool courtyard after dark', ratio: 16 / 10 },
  { photo: P.livingTeal, category: 'interior', title: 'Living room in deep teal', ratio: 4 / 3 },
];
