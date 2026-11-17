import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { site } from '@/config/site';
import { useTheme } from '@/providers/ThemeProvider';
import './map.css';

const pinIcon = (label) =>
  L.divIcon({
    className: 'aurelia-pin',
    html: `<span class="aurelia-pin__pulse"></span><span class="aurelia-pin__body"><img src="/assets/alphalogo-removebg-preview.png" alt="" width="28" height="27" style="width:28px;height:27px"></span><span class="aurelia-pin__label">${label}</span>`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    tooltipAnchor: [0, -44],
  });

const placeIcon = (name) =>
  L.divIcon({
    className: 'aurelia-place',
    html: `<span class="aurelia-place__body"><img src="/assets/alphalogo-removebg-preview.png" alt="" width="20" height="19" style="width:20px;height:19px"></span><span class="aurelia-place__label">${name}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    tooltipAnchor: [0, -16],
  });

const dotIcon = (active) =>
  L.divIcon({
    className: `aurelia-dot${active ? ' is-active' : ''}`,
    html: '<span></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 14), { duration: 0.9 });
  }, [map, target]);
  return null;
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
  }, [map, points]);
  return null;
}

const samePoint = (a, b) => Math.abs(a[0] - b[0]) < 0.0005 && Math.abs(a[1] - b[1]) < 0.0005;

/**
 * Warm-styled Leaflet map (CARTO tiles tinted to the brand palette) with an Alphafour pin,
 * landmark markers and the always-on highlights from `site.mapHighlights` (head office etc.).
 * `active` highlights a landmark and flies to it.
 */
export default function LocationMap({ center, label = site.name, pin = true, landmarks = [], active, onSelect, zoom = 13, className }) {
  const { theme } = useTheme();
  const markerRefs = useRef({});
  // Skip a highlight that is already the main pin (the contact page centres on the office).
  const highlights = useMemo(() => site.mapHighlights.filter((h) => !samePoint(h.coordinates, center)), [center]);
  const points = useMemo(
    () => [center, ...landmarks.filter((l) => l.coordinates).map((l) => l.coordinates), ...highlights.map((h) => h.coordinates)],
    [center, landmarks, highlights],
  );
  const activeLandmark = landmarks.find((l) => l.name === active);

  useEffect(() => {
    if (activeLandmark) markerRefs.current[activeLandmark.name]?.openTooltip();
  }, [activeLandmark]);

  // OpenStreetMap tiles by default (attribution required, fair-use policy). For production
  // traffic set VITE_MAP_TILE_URL to a keyed provider such as MapTiler, Mapbox or Stadia.
  const tiles = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution =
    import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className={className} role="region" aria-label={`Map of ${label} and nearby landmarks`} data-lenis-prevent>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className={`aurelia-map size-full ${theme === 'dark' ? 'is-dark' : ''}`} attributionControl>
        <TileLayer url={tiles} attribution={attribution} maxZoom={19} />
        {pin && <Marker position={center} icon={pinIcon(label)} zIndexOffset={1000} keyboard alt={label} />}
        {highlights.map((place) => (
          <Marker key={place.name} position={place.coordinates} icon={placeIcon(place.name)} zIndexOffset={900} alt={place.name}>
            <Tooltip direction="top" offset={[0, -6]} className="aurelia-tooltip">
              <strong>{place.name}</strong>
              <span>{place.note}</span>
            </Tooltip>
          </Marker>
        ))}
        {landmarks
          .filter((l) => l.coordinates)
          .map((landmark) => (
            <Marker
              key={landmark.name}
              position={landmark.coordinates}
              icon={dotIcon(landmark.name === active)}
              ref={(ref) => {
                if (ref) markerRefs.current[landmark.name] = ref;
              }}
              eventHandlers={{ click: () => onSelect?.(landmark.name) }}
              alt={landmark.name}
            >
              <Tooltip direction="top" offset={[0, -10]} className="aurelia-tooltip">
                <strong>{landmark.name}</strong>
                <span>
                  {landmark.distance} · {landmark.time}
                </span>
              </Tooltip>
            </Marker>
          ))}
        <FitBounds points={points} />
        <FlyTo target={activeLandmark?.coordinates} />
      </MapContainer>
    </div>
  );
}
