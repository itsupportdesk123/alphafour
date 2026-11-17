import { Briefcase, GraduationCap, Hospital, Hotel, Landmark, PlaneTakeoff, ShoppingBag, TrainFront, Waves } from 'lucide-react';

export const LANDMARK_ICONS = {
  connectivity: Landmark,
  business: Briefcase,
  school: GraduationCap,
  hospital: Hospital,
  airport: PlaneTakeoff,
  metro: TrainFront,
  shopping: ShoppingBag,
  hotel: Hotel,
  leisure: Waves,
};

/** Location advantages of the flagship (Alphafour Altitude, Perungudi, OMR). Distances are indicative. */
export const FLAGSHIP_LANDMARKS = [
  { name: 'OMR IT Corridor', category: 'business', distance: '0.5 km', time: '2 min', coordinates: [12.9606, 80.2443] },
  { name: 'Perungudi MRTS Station', category: 'metro', distance: '1.4 km', time: '5 min', coordinates: [12.9653, 80.2508] },
  { name: 'Pallikaranai Marshland', category: 'leisure', distance: '2.2 km', time: '6 min', coordinates: [12.9452, 80.2268] },
  { name: 'World Trade Center Chennai', category: 'business', distance: '1.6 km', time: '5 min', coordinates: [12.9581, 80.2449] },
  { name: 'Phoenix Marketcity, Velachery', category: 'shopping', distance: '4.2 km', time: '12 min', coordinates: [12.9915, 80.2168] },
  { name: 'Kauvery Hospital, Radial Road', category: 'hospital', distance: '4.8 km', time: '13 min', coordinates: [12.9561, 80.2056] },
  { name: 'Hyatt Regency Chennai, Sholinganallur', category: 'hotel', distance: '6.5 km', time: '15 min', coordinates: [12.9081, 80.2275] },
  { name: 'Elliot’s Beach, Besant Nagar', category: 'leisure', distance: '7.5 km', time: '20 min', coordinates: [12.9989, 80.2717] },
  { name: 'East Coast Road', category: 'connectivity', distance: '3.5 km', time: '10 min', coordinates: [12.9706, 80.2588] },
  { name: 'Chennai Int’l Airport', category: 'airport', distance: '14 km', time: '30 min', coordinates: [12.9941, 80.1709] },
  { name: 'IIT Madras', category: 'school', distance: '6 km', time: '16 min', coordinates: [12.9916, 80.2336] },
];

/** Neighbourhood landmarks for the other residences (detail page map). */
export const AREA_LANDMARKS = {
  neelankarai: [
    { name: 'Neelankarai Beach', category: 'leisure', distance: '0.3 km', time: '3 min walk' },
    { name: 'East Coast Road', category: 'connectivity', distance: '0.6 km', time: '2 min' },
    { name: 'OMR IT Corridor, Sholinganallur', category: 'business', distance: '4.5 km', time: '12 min' },
    { name: 'Global Hospitals, Perumbakkam', category: 'hospital', distance: '7 km', time: '18 min' },
    { name: 'Chennai Int’l Airport', category: 'airport', distance: '18 km', time: '40 min' },
  ],
  guindy: [
    { name: 'Madras Gymkhana Golf Course', category: 'leisure', distance: '0.4 km', time: '2 min' },
    { name: 'Guindy National Park', category: 'leisure', distance: '1.5 km', time: '5 min' },
    { name: 'Olympia Tech Park', category: 'business', distance: '1.8 km', time: '6 min' },
    { name: 'Guindy Metro', category: 'metro', distance: '1.1 km', time: '4 min' },
    { name: 'Chennai Int’l Airport', category: 'airport', distance: '9 km', time: '20 min' },
  ],
  vandalur: [
    { name: 'Vandalur Reserve Forest', category: 'leisure', distance: '1.2 km', time: '4 min' },
    { name: 'Arignar Anna Zoological Park', category: 'leisure', distance: '2.5 km', time: '7 min' },
    { name: 'Grand Southern Trunk Road', category: 'connectivity', distance: '1.8 km', time: '5 min' },
    { name: 'Chennai Int’l Airport', category: 'airport', distance: '17 km', time: '30 min' },
  ],
  'anna-nagar': [
    { name: 'Anna Nagar Tower Park', category: 'leisure', distance: '0.8 km', time: '3 min' },
    { name: 'VR Chennai Mall', category: 'shopping', distance: '2.6 km', time: '8 min' },
    { name: 'Anna Nagar Tower Metro', category: 'metro', distance: '1.0 km', time: '4 min' },
    { name: 'Chennai Int’l Airport', category: 'airport', distance: '19 km', time: '40 min' },
  ],
  'poes-garden': [
    { name: 'Semmozhi Poonga', category: 'leisure', distance: '1.4 km', time: '5 min' },
    { name: 'Anna Salai (Mount Road)', category: 'business', distance: '1.6 km', time: '6 min' },
    { name: 'Apollo Hospitals, Greams Road', category: 'hospital', distance: '2.3 km', time: '8 min' },
    { name: 'Chennai Int’l Airport', category: 'airport', distance: '16 km', time: '38 min' },
  ],
  kovalam: [
    { name: 'Kovalam (Covelong) Beach', category: 'leisure', distance: '0.2 km', time: '3 min walk' },
    { name: 'Muttukadu Boat House', category: 'leisure', distance: '5 km', time: '10 min' },
    { name: 'East Coast Road', category: 'connectivity', distance: '0.5 km', time: '2 min' },
    { name: 'Chennai Int’l Airport', category: 'airport', distance: '40 km', time: '55 min' },
  ],
  'boat-club': [
    { name: 'Madras Boat Club', category: 'leisure', distance: '0.5 km', time: '2 min' },
    { name: 'Anna Salai (Mount Road)', category: 'business', distance: '3.1 km', time: '10 min' },
    { name: 'Apollo Hospitals, Greams Road', category: 'hospital', distance: '4.0 km', time: '12 min' },
    { name: 'Chennai Int’l Airport', category: 'airport', distance: '15 km', time: '35 min' },
  ],
  perungudi: FLAGSHIP_LANDMARKS,
  'cathedral-road': [
    { name: 'Khader Nawaz Khan Road', category: 'shopping', distance: '1.0 km', time: '4 min' },
    { name: 'Semmozhi Poonga', category: 'leisure', distance: '0.6 km', time: '3 min walk' },
    { name: 'Thousand Lights Metro', category: 'metro', distance: '1.3 km', time: '5 min' },
    { name: 'Chennai Int’l Airport', category: 'airport', distance: '17 km', time: '40 min' },
  ],
  mahabalipuram: [
    { name: 'Shore Temple, Mahabalipuram', category: 'leisure', distance: '2 km', time: '6 min' },
    { name: 'Mahabalipuram Beach', category: 'leisure', distance: '0.3 km', time: '3 min walk' },
    { name: 'East Coast Road', category: 'connectivity', distance: '0.8 km', time: '3 min' },
    { name: 'Chennai Int’l Airport', category: 'airport', distance: '58 km', time: '75 min' },
  ],
  kotturpuram: [
    { name: 'Adyar River & Tree Park', category: 'leisure', distance: '0.4 km', time: '2 min walk' },
    { name: 'Anna Centenary Library', category: 'school', distance: '0.9 km', time: '3 min' },
    { name: 'IIT Madras', category: 'school', distance: '2.2 km', time: '7 min' },
    { name: 'Kotturpuram MRTS Station', category: 'metro', distance: '0.8 km', time: '3 min' },
    { name: 'Chennai Int’l Airport', category: 'airport', distance: '13 km', time: '30 min' },
  ],
};
