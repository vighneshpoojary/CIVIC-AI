import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Complaint, Hotspot } from '../../types';
import { PriorityBadge, StatusBadge } from '../common/StatusBadge';

// Custom SVG icon generator for Leaflet
const createPinIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="${color}" stroke="#FFFFFF" stroke-width="1.5">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-pin',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Roads and Infrastructure': return '#E63946'; // Red
    case 'Waste Management': return '#2A9D8F'; // Teal
    case 'Streetlights': return '#F4A261'; // Amber
    case 'Drainage and Sewage': return '#457B9D'; // Slate blue
    case 'Public Safety': return '#D90429'; // Dark red
    default: return '#102E50'; // Navy
  }
};

interface CivicMapProps {
  complaints?: Complaint[];
  hotspots?: Hotspot[];
  selectedHotspot?: Hotspot | null;
  onSelectComplaint?: (c: Complaint) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showHotspotRings?: boolean;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  complaints = [],
  hotspots = [],
  selectedHotspot,
  onSelectComplaint,
  center = [12.9716, 77.5946],
  zoom = 12,
  height = '480px',
  showHotspotRings = true,
}) => {
  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hotspot Circles */}
        {showHotspotRings && hotspots.map((h) => {
          const isSelected = selectedHotspot?.hotspot_id === h.hotspot_id;
          return (
            <Circle
              key={h.hotspot_id}
              center={[h.center_latitude, h.center_longitude]}
              radius={h.radius_meters}
              pathOptions={{
                color: h.severity === 'Critical' ? '#D90429' : '#F4A261',
                fillColor: h.severity === 'Critical' ? '#D90429' : '#F4A261',
                fillOpacity: isSelected ? 0.35 : 0.18,
                weight: isSelected ? 3 : 1.5,
                dashArray: isSelected ? undefined : '4, 6',
              }}
            >
              <Popup>
                <div className="p-1">
                  <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    DBSCAN Hotspot Cluster
                  </span>
                  <h4 className="text-sm font-bold text-[#102E50] mt-1">{h.hotspot_id}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Ward: <strong>{h.ward}</strong></p>
                  <p className="text-xs text-slate-600">Density: <strong>{h.complaint_count} reports</strong></p>
                  <p className="text-xs text-slate-600">Dominant: <strong>{h.dominant_category}</strong></p>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Complaint Markers */}
        {complaints.filter(c => c.latitude && c.longitude).map((c) => (
          <Marker
            key={c.id || c.reference_id}
            position={[c.latitude, c.longitude]}
            icon={createPinIcon(getCategoryColor(c.category))}
          >
            <Popup>
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700">{c.reference_id}</span>
                  <PriorityBadge priority={c.priority} />
                </div>
                <h4 className="text-xs font-semibold text-[#102E50] mt-1 line-clamp-1">{c.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{c.address}</p>
                <div className="mt-2 flex items-center justify-between border-t pt-1.5">
                  <StatusBadge status={c.status} />
                  {onSelectComplaint && (
                    <button
                      onClick={() => onSelectComplaint(c)}
                      className="text-[11px] font-medium text-[#087F8C] hover:underline"
                    >
                      View Details &rarr;
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur-sm p-2.5 rounded-lg border border-slate-200/80 shadow-md text-xs space-y-1">
        <p className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider mb-1">Categories</p>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
          <span className="text-[11px] text-slate-600">Roads & Infra</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2A9D8F]" />
          <span className="text-[11px] text-slate-600">Waste Management</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F4A261]" />
          <span className="text-[11px] text-slate-600">Streetlights</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#457B9D]" />
          <span className="text-[11px] text-slate-600">Drainage & Sewage</span>
        </div>
      </div>
    </div>
  );
};
