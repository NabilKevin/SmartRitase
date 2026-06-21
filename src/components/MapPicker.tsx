import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultLat?: number; 
  defaultLng?: number;
  disabled?: boolean;
}

const MapEventHandler = ({ 
  setMarkerPos, 
  onLocationSelect,
  disabled 
}: { 
  setMarkerPos: (pos: L.LatLng) => void;
  onLocationSelect: (lat: number, lng: number) => void;
  disabled?: boolean;
}) => {
  useMapEvents({
    click(e) {
      if (disabled) return; 
      
      setMarkerPos(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MapPicker = ({ 
  onLocationSelect, 
  defaultLat = -6.200000, 
  defaultLng = 106.82,
  disabled = false
}: MapPickerProps) => {
  const [markerPos, setMarkerPos] = useState<L.LatLng>(new L.LatLng(defaultLat, defaultLng));

  useEffect(() => {
    setMarkerPos(new L.LatLng(defaultLat, defaultLng));
  }, [defaultLat, defaultLng]);

  return (
    <div className={`h-[400px] w-full rounded-md overflow-hidden border border-gray-300 z-0 transition-opacity ${disabled ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}>
      <MapContainer 
        center={[defaultLat, defaultLng]} 
        zoom={13} 
        scrollWheelZoom={!disabled} 
        dragging={!disabled}
        zoomControl={!disabled}
        doubleClickZoom={!disabled}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={markerPos} />

        <MapEventHandler 
          setMarkerPos={setMarkerPos} 
          onLocationSelect={onLocationSelect} 
          disabled={disabled}
        />
      </MapContainer>
    </div>
  );
};