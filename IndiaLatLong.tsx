import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';

export default function IndiaLatLong() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });

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

      map.on('pointermove', (event) => {
        const lonLat = toLonLat(event.coordinate);
        setCoordinates({ lat: lonLat[1], lon: lonLat[0] });
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
        Latitude: {coordinates.lat.toFixed(4)} 
        <br />
        Longitude: {coordinates.lon.toFixed(4)}
      </div>
    </div>
  );
}
