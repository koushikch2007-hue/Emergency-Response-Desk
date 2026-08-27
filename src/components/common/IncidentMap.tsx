import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Incident } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';

// Fix Leaflet marker icon asset paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createCustomMarkerIcon(priority: string) {
  let colorHex = '#2563eb'; // blue for low
  if (priority === 'critical') colorHex = '#dc2626';
  else if (priority === 'high') colorHex = '#ea580c';
  else if (priority === 'medium') colorHex = '#d97706';

  const svgHtml = `
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.163 24.837 0 16 0Z" fill="${colorHex}"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
}

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedPos: [number, number] | null;
}

const LocationPickerMarker: React.FC<LocationPickerProps> = ({ onLocationSelect, selectedPos }) => {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return selectedPos ? (
    <Marker position={selectedPos} icon={createCustomMarkerIcon('critical')}>
      <Popup>
        <div className="p-1 text-xs">
          <strong>Selected Incident Coordinates:</strong>
          <br />
          {selectedPos[0].toFixed(5)}, {selectedPos[1].toFixed(5)}
        </div>
      </Popup>
    </Marker>
  ) : null;
};

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

interface IncidentMapProps {
  incidents?: Incident[];
  selectedLocation?: [number, number] | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
  interactivePicker?: boolean;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents = [],
  selectedLocation = null,
  onLocationSelect,
  height = '400px',
  center = [37.7749, -122.4194],
  zoom = 12,
  interactivePicker = false,
}) => {
  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden shadow-inner border border-slate-700/60 relative z-0">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {interactivePicker && onLocationSelect && (
          <LocationPickerMarker onLocationSelect={onLocationSelect} selectedPos={selectedLocation} />
        )}

        {!interactivePicker &&
          incidents.map((incident) => {
            if (typeof incident.latitude !== 'number' || typeof incident.longitude !== 'number') return null;
            return (
              <Marker
                key={incident.id}
                position={[incident.latitude, incident.longitude]}
                icon={createCustomMarkerIcon(incident.final_priority)}
              >
                <Popup>
                  <div className="p-2 space-y-2 text-slate-900 max-w-xs">
                    <div className="flex items-center justify-between gap-2">
                      <PriorityBadge priority={incident.final_priority} size="sm" />
                      <StatusBadge status={incident.status} size="sm" />
                    </div>
                    <h4 className="font-bold text-sm leading-tight text-slate-900">{incident.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{incident.description}</p>
                    <p className="text-[11px] font-semibold text-slate-500">
                      📍 {incident.location_description || incident.address || 'Coordinates marked'}
                    </p>
                    <a
                      href={`/authority/incidents/${incident.id}`}
                      className="inline-block text-xs font-bold text-red-600 hover:text-red-700 underline mt-1"
                    >
                      View Operations Detail →
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};
