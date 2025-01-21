import { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

export default function IndiaMap() {
  
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      // Create a new map instance
      const map = new Map({
        target: mapRef.current,
        layers: [
          // Base layer using OpenStreetMap
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          // Center coordinates for India (longitude, latitude)
          center: fromLonLat([81.19, 23.25]), // Convert longitude and latitude to Web Mercator
          zoom: 4.7, 
        }),
      });
    }
  }, []);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
  );
}


