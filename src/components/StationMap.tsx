import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- 1. FIX ICON (Giữ nguyên) ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- 2. COMPONENT FIX LỖI LOAD KHÔNG ĐỦ (QUAN TRỌNG) ---
const MapResizeFix = () => {
  const map = useMap();
  
  useEffect(() => {
    // Chờ 300ms cho Modal mở hết hiệu ứng animation rồi mới vẽ lại map
    const timer = setTimeout(() => {
      map.invalidateSize(); 
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

// --- 3. COMPONENT DI CHUYỂN CAMERA (Giữ nguyên) ---
const MapUpdater = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15);
  }, [center, map]);
  return null;
};

interface StationMapProps {
  stations: any[];
  focusedStation?: any;
}

const StationMap: React.FC<StationMapProps> = ({ stations, focusedStation }) => {
  const defaultCenter: [number, number] = [10.7721, 106.6983]; 
  const center: [number, number] = (focusedStation && focusedStation.lat && focusedStation.lon)
    ? [focusedStation.lat, focusedStation.lon]
    : defaultCenter;

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      {/* Thêm key để ép React render lại component khi mở modal */}
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        
        {/* --- SỬ DỤNG GIAO DIỆN BẢN ĐỒ KHÁC (Đẹp hơn & Nhẹ hơn) --- */}
        {/* Thay vì OpenStreetMap mặc định, ta dùng CartoDB (miễn phí) nhìn hiện đại hơn */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* Gọi Fix lỗi resize */}
        <MapResizeFix />
        
        <MapUpdater center={center} />

        {stations.map((st) => {
          if (!st.lat || !st.lon) return null;
          return (
            <Marker key={st.code} position={[st.lat, st.lon]}>
              <Popup>
                <b>{st.code} - {st.name}</b> <br />
                {st.line_name}
              </Popup>
              <Tooltip 
                direction="bottom" 
                offset={[0, 7]} 
                opacity={1} 
                permanent 
                className="station-label" 
              >
                {st.name}
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default StationMap;