// 7. Drop Down for selecting Shapes for drawing

import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map'; 
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay'; 
import style from '../styles/DrawShapes.module.scss';

export default function DropDown() {
  const mapRef = useRef<HTMLDivElement | null>(null); 
  const popupRef = useRef<HTMLDivElement | null>(null); 

  const [hoverCoordinates, setHoverCoordinates] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });
  const [clickCoordinates, setClickCoordinates] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });
  const [placeName, setPlaceName] = useState<string>('None'); 
  const [popupVisible, setPopupVisible] = useState(false); 
  const [shapeType, setShapeType] = useState<string>('None'); // State for shape type

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
      
      // Hover
      map.on('pointermove', (event) => {                              
        const lonLat = toLonLat(event.coordinate);
        setHoverCoordinates({ lat: lonLat[1], lon: lonLat[0] });
      });
      
      // Popup
      map.on('singleclick', async (event) => {
        const lonLat = toLonLat(event.coordinate);
        setClickCoordinates({ lat: lonLat[1], lon: lonLat[0] });
         
        const popup = new Overlay({
          element: popupRef.current!,
          autoPan: true,
          positioning: 'bottom-center',
          stopEvent: true,
        });
        map.addOverlay(popup);

        // Nominatim API
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lonLat[1]}&lon=${lonLat[0]}`);

        if (response.ok) {
          const data = await response.json();
          setPlaceName(data.display_name || 'No place found'); 
        } else {
          setPlaceName('No place found'); 
        }
        popup.setPosition(event.coordinate);
        setPopupVisible(true);
      });
    }
  }, []);

  const closePopup = () => {
    setPopupVisible(false);
    setPlaceName('');
  };

  return (
    <div className={style.map}>
      <div ref={mapRef} className={style.mapbackround} />

      <div className={style.latlong}>
        Latitude : {hoverCoordinates.lat.toFixed(4)} 
        <br />
        Longitude : {hoverCoordinates.lon.toFixed(4)}
      </div>

      <div className={style.olpopup}
        ref={popupRef} 
        style={{
          display: popupVisible ? 'block' : 'none', 
        }}
      > 
      <button className={style.popupClose} onClick={closePopup}>
          &times; 
        </button>
        Latitude : {clickCoordinates.lat.toFixed(4)} 
        <br />
        Longitude : {clickCoordinates.lon.toFixed(4)}
        <br />
        Place : {placeName}
      </div>

      <div className={style.dropdown}>
        <label htmlFor="shapeSelect">Select Shape </label>
        <select 
          id="shapeSelect" 
          value={shapeType} 
          onChange={(e) => setShapeType(e.target.value)}
        >
          <option value="None">None</option>
          <option value="Point">Point</option>
          <option value="Line">Line</option>
          <option value="Circle">Circle</option>
          <option value="Polygon">Polygon</option>
        </select>
      </div>
    </div>
  );
}


