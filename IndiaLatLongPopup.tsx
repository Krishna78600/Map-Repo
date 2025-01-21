import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';

export default function IndiaLatLongPopup() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [hoverCoordinates, setHoverCoordinates] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });
  const [clickCoordinates, setClickCoordinates] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });
  
  // Create a reference for the popup overlay
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    if (mapRef.current) {
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([81.19, 23.25]),
          zoom: 4.7,
        }),
      });

      // Create an overlay for the popup
      const popup = new Overlay({
        element: popupRef.current!,
        autoPan: true,
        positioning: 'bottom-center',
        stopEvent: false,
      });
      map.addOverlay(popup);

      // Handle pointer move to update hover coordinates
      map.on('pointermove', (event) => {
        const lonLat = toLonLat(event.coordinate);
        setHoverCoordinates({ lat: lonLat[1], lon: lonLat[0] });
      });

      // Handle click event to show popup with clicked coordinates
      map.on('singleclick', (event) => {
        const lonLat = toLonLat(event.coordinate);
        setClickCoordinates({ lat: lonLat[1], lon: lonLat[0] });
        
        // Set the position of the popup and make it visible
        popup.setPosition(event.coordinate);
        setPopupVisible(true);
      });
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: 'black' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(255, 255, 255, 1)', 
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000,
        color: 'black', 
      }}>
        Latitude: {hoverCoordinates.lat.toFixed(4)} 
        <br />
        Longitude: {hoverCoordinates.lon.toFixed(4)}
      </div>

      {/* Popup */}
      <div 
        ref={popupRef} 
        style={{
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 3)', 
          padding: '10px',
          borderRadius: '10px',
          zIndex: 1000,
          color: 'black',
          width : '170px' ,
          display: popupVisible ? 'block' : 'none', // Show or hide based on state
        }}
      >
        Latitude: {clickCoordinates.lat.toFixed(5)} 
        <br />
        Longitude: {clickCoordinates.lon.toFixed(5)}
      </div>
    </div>
  );
}
