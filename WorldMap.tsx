import { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

export default function Worldmap() {

  const mapRef = useRef<HTMLDivElement | null>(null);

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
          center: fromLonLat([0,0]), // Set the initial center of the map
          zoom: 1, // Set the initial zoom level
        }),
      });
    }
  }, []);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
  );
}


