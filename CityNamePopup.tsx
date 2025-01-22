// import { useEffect, useRef, useState } from 'react';
// import 'ol/ol.css';
// import Map from 'ol/Map'; 
// import View from 'ol/View';
// import TileLayer from 'ol/layer/Tile';
// import OSM from 'ol/source/OSM';
// import { fromLonLat, toLonLat } from 'ol/proj';

// export default function CityNamePopup() {
//   const mapRef = useRef<HTMLDivElement | null>(null); 
//   const popupRef = useRef<HTMLDivElement | null>(null); 

//   const [hoverCoordinates, setHoverCoordinates] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });
//   const [clickCoordinates, setClickCoordinates] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });
//   const [placeName, setPlaceName] = useState<string>(''); 
//   const [popupVisible, setPopupVisible] = useState(false);

//   useEffect(() => { 
//     if (mapRef.current) {
//       const map = new Map({
//         target: mapRef.current,
//         layers: [
//           new TileLayer({
//             source: new OSM(),
//           }),
//         ],
//         view: new View({
//           center: fromLonLat([81.19, 23.25]),
//           zoom: 4.7,
//         }),
//       });

//       map.on('pointermove', (event) => {
//         const lonLat = toLonLat(event.coordinate);
//         setHoverCoordinates({ lat: lonLat[1], lon: lonLat[0] });
//       });

//       map.on('singleclick', async (event) => {
//         const lonLat = toLonLat(event.coordinate);
//         setClickCoordinates({ lat: lonLat[1], lon: lonLat[0] });

//         // Nominatim API
//         const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lonLat[1]}&lon=${lonLat[0]}`);
        
//         if (response.ok) {
//           const data = await response.json();
//           setPlaceName(data.display_name || 'No place found'); 
//         } else {
//           setPlaceName('No place found'); 
//         }

//         // Show popup in the top left corner
//         setPopupVisible(true);
//       });
//     }
//   }, []);

//   return (
//     <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: 'black' }}>
//       <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
//       <div style={{
//         position: 'absolute',
//         bottom: '10px',
//         right: '10px',
//         backgroundColor: 'rgba(255, 255, 255, 1)', 
//         padding: '10px',
//         borderRadius: '5px',
//         zIndex: 1000,
//         color: 'black', 
//       }}>
//         Latitude (Hover): {hoverCoordinates.lat.toFixed(4)} 
//         <br />
//         Longitude (Hover): {hoverCoordinates.lon.toFixed(4)}
//       </div>

//       {/* Popup */}
//       <div 
//         ref={popupRef} 
//         style={{
//           position: 'absolute',
//           top: '10px', 
//           left: '10px', 
//           backgroundColor: 'rgba(255, 255, 255, 1)', 
//           padding: '10px',
//           borderRadius: '10px',
//           zIndex: 1000,
//           color: 'black',
//           width : '180px' ,
//           display: popupVisible ? 'block' : 'none', 
//         }}
//       >
//         Latitude : {clickCoordinates.lat.toFixed(5)} 
//         <br />
//         Longitude : {clickCoordinates.lon.toFixed(5)}
//         <br />
//         Place : {placeName}
//       </div>
//     </div>
//   );
// }




import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map'; 
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';

export default function CityNamePopup() {
  const mapRef = useRef<HTMLDivElement | null>(null); 
  const popupRef = useRef<HTMLDivElement | null>(null); 

  const [hoverCoordinates, setHoverCoordinates] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });
  const [clickCoordinates, setClickCoordinates] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });
  const [placeName, setPlaceName] = useState<string>(''); 
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

      map.on('pointermove', (event) => {
        const lonLat = toLonLat(event.coordinate);
        setHoverCoordinates({ lat: lonLat[1], lon: lonLat[0] });
      });

      map.on('singleclick', async (event) => {
        const lonLat = toLonLat(event.coordinate);
        setClickCoordinates({ lat: lonLat[1], lon: lonLat[0] });

        // Nominatim API
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lonLat[1]}&lon=${lonLat[0]}`);
        
        if (response.ok) {
          const data = await response.json();
          setPlaceName(data.display_name || 'No place found'); 
        } else {
          setPlaceName('No place found'); 
        }

        // Show popup in the top left corner
        setPopupVisible(true);
      });
    }
  }, []);

  // Function to close the popup
  const closePopup = () => {
    setPopupVisible(false);
    setPlaceName('');
    setClickCoordinates({ lat: 0, lon: 0 }); // Optionally reset coordinates
  };

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
        Latitude : {hoverCoordinates.lat.toFixed(5)} 
        <br />
        Longitude : {hoverCoordinates.lon.toFixed(5)}
      </div>

      {/* Popup */}
      <div 
        ref={popupRef} 
        style={{
          position: 'absolute',
          top: '10px', 
          left: '10px', 
          backgroundColor: 'rgba(255, 255, 255, 1)', 
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000,
          color: 'black',
          width : '180px' ,
          display: popupVisible ? 'block' : 'none', 
        }}
      >
        <button onClick={closePopup} style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
          color: '#ff0000' // Red color for the close button
        }}>
          &times; {/* Cross symbol */}
        </button>
        
        Latitude : {clickCoordinates.lat.toFixed(5)} 
        <br />
        Longitude : {clickCoordinates.lon.toFixed(5)}
        <br />
        Place : {placeName}
      </div>
    </div>
  );
}

