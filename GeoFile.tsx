// 11. Cordinates providing through uploading json file 
import { useEffect, useState, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat, toLonLat } from "ol/proj";
import Overlay from "ol/Overlay";
import Feature from "ol/Feature";
import { Draw } from "ol/interaction";
import { Polygon, LineString } from "ol/geom";
import { getArea, getLength } from 'ol/sphere'; 
import styles from "../styles/GeoFile.module.scss";
import GeoJSON from 'ol/format/GeoJSON'; // Import GeoJSON format
import { Style, Fill, Stroke } from 'ol/style'; // Import styles

const GeoFile: React.FC = () => {
  const [coordinates, setCoordinates] = useState<any | null>(null);
  const [hoverLongitude, setHoverLongitude] = useState<string>("Longitude: 0");
  const [hoverLatitude, setHoverLatitude] = useState<string>("Latitude: 0");
  const [type, setType] = useState("None");
  const [drawnGeometries, setDrawnGeometries] = useState<Feature[]>([]);
  const [geoJsonString, setGeoJsonString] = useState<string>(JSON.stringify({ type: "FeatureCollection", features: [] }, null, 2));
  const [totalArea, setTotalArea] = useState<number>(0); // Total area in square meters
  const [totalLength, setTotalLength] = useState<number>(0); // Total length in meters
  const [placeName, setPlaceName] = useState<string>(''); 
  const [popupVisible, setPopupVisible] = useState(false);
  const [isHovered , setIsHovered] = useState(false);
  const [geoJsonInput, setGeoJsonInput] = useState<string>(''); // State for GeoJSON input

  const mapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const vectorSource = useRef(new VectorSource()).current;
  const mapRefInstance = useRef<Map | null>(null); // Reference to the map instance

 
  useEffect(() => {
    const map = new Map({
      target: mapRef.current!,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: vectorSource,
          style: new Style({
            fill: new Fill({
              color:'orange',
            }),
            stroke: new Stroke({
              color: 'blue', // stroke
              width: 2, // Stroke width
            }),
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([81.19, 23.25]),
        zoom: 4.7,
      }),
    });

    overlayRef.current = new Overlay({
      element: popupRef.current!,
      autoPan: true,
      autoPanAnimation: { duration: 250 },
    });

    map.addOverlay(overlayRef.current);
    mapRefInstance.current = map; // Store the map instance

   
    map.on('pointermove', (event) => {
      const lonLat = toLonLat(event.coordinate);
      setHoverLongitude(`Longitude : ${lonLat[0].toFixed(4)}`);
      setHoverLatitude(`Latitude   : ${lonLat[1].toFixed(4)}`);
    });

 
    const handleSingleClick = async (event: any) => {
      const coordinate = map.getEventCoordinate(event.originalEvent);
      const [lon, lat] = toLonLat(coordinate);

      if (type === "None") {
        // Nominatim API
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        
        if (response.ok) {
          const data = await response.json();
          setPlaceName(data.display_name || 'No place found'); 
        } else {
          setPlaceName('No place found'); 
        }

        setCoordinates([lon, lat]);
        overlayRef.current.setPosition(coordinate);
        setPopupVisible(true);
      }
    };

    map.on("singleclick", handleSingleClick);

    return () => {
      map.un("singleclick", handleSingleClick);
      map.setTarget(undefined);
    };
  }, []); 

  // Handle drawing interactions
  useEffect(() => {
    const map = mapRefInstance.current;
    if (!map) return;

    // Remove existing draw interaction if it exists
    const existingDraw = map.getInteractions().getArray().find(interaction => interaction instanceof Draw);
    if (existingDraw) {
      map.removeInteraction(existingDraw);
    }

    // Add drawing interaction based on the selected type
    if (type === "Circle") {
      const drawCircle = new Draw({
        source: vectorSource,
        type: "Circle",
        freehand: false,
      });

      map.addInteraction(drawCircle);
      overlayRef.current.setPosition(undefined);

      drawCircle.on("drawend", (event) => {
        const feature = event.feature;
        setDrawnGeometries((prev) => [...prev, feature]);
        updateGeoJson(); // Update GeoJSON after drawing

        // Calculate area for the circle
        const radius = feature.getGeometry().getRadius();
        const area = Math.PI * Math.pow(radius, 2); // Area of the circle
        setTotalArea(prevArea => prevArea + area); // Update total area
      });
    } else if (type !== "None") {
      const draw = new Draw({
        source: vectorSource,
        type: type === "Polygon" ? "Polygon" : type,
        freehand: false,
      });

      map.addInteraction(draw);
      overlayRef.current.setPosition(undefined);

      draw.on("drawend", (event) => {
        const feature = event.feature;
        setDrawnGeometries((prev) => [...prev, feature]);
        updateGeoJson(); // Update GeoJSON after drawing

        // Calculate area if the drawn geometry is a polygon
        if (feature.getGeometry().getType() === 'Polygon') {
          const area = getArea(feature.getGeometry());
          setTotalArea(prevArea => prevArea + area); // Update total area
        }

        // Calculate length if the drawn geometry is a LineString
        if (feature.getGeometry().getType() === 'LineString') {
          const length = getLength(feature.getGeometry());
          setTotalLength(prevLength => prevLength + length); // Update total length
        }
      });
    }
  }, [type]);

  const updateGeoJson = () => {
    const geojson = {
      type: "FeatureCollection",
      features: drawnGeometries.map((geom) => {
        const geometry = geom.getGeometry();
        return {
          type: "Feature",
          geometry: {
            type: geometry.getType(),
            coordinates: geometry.getCoordinates(),
          },
        };
      }),
    };

    const geoJsonString = JSON.stringify(geojson, null, 2);
    setGeoJsonString(geoJsonString);
    localStorage.setItem("geoJsonData", geoJsonString); // Corrected line
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    setType(event.target.value);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setPlaceName('');
    setCoordinates(null);
  };

  const handleGeoJsonSubmit = () => {
    try {
      const geoJsonData = JSON.parse(geoJsonInput);
      vectorSource.clear(); // Clear existing geometries
      const geoJSONFormat = new GeoJSON();
      const features = geoJSONFormat.readFeatures(geoJsonData, {
        featureProjection: 'EPSG:3857' // Ensure the features are in the correct projection
      });
      vectorSource.addFeatures(features);
      setDrawnGeometries(features);
      updateGeoJson(); // Update GeoJSON after adding new features
    } catch (error) {
      console.error("Invalid GeoJSON data", error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const geoJsonData = JSON.parse(e.target?.result as string);
          vectorSource.clear(); // Clear existing geometries
          const geoJSONFormat = new GeoJSON();
          const features = geoJSONFormat.readFeatures(geoJsonData, {
            featureProjection: 'EPSG:3857' // Ensure the features are in the correct projection
          });
          vectorSource.addFeatures(features);
          setDrawnGeometries(features);
          updateGeoJson(); // Update GeoJSON after adding new features
        } catch (error) {
          console.error("Invalid GeoJSON file", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const totalAreaConverted = {
    sqM: totalArea,
    sqKm: totalArea / 1e6,
    sqMiles: totalArea / 2589988.11, // 1 sq mile = 2589988.11 sq meters
    sqFeet: totalArea * 10.7639, // 1 sq meter = 10.7639 sq feet
  };

  const totalLengthConverted = {
    meters: totalLength,
    kilometers: totalLength / 1000,
    miles: totalLength / 1609.34, // 1 mile = 1609.34 meters
    feet: totalLength * 3.28084, // 1 meter = 3.28084 feet
  };

  const displayCoordinates = coordinates
    ? `Longitude: ${coordinates[0].toFixed(5)}°
       Latitude: ${coordinates[1].toFixed(5)}°`
    : "";

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div ref={mapRef} className={styles.map} />
        <div ref={popupRef} 
             className={styles.olPopup} 
             style={{ display: popupVisible ? 'block' : 'none' }}>

            <button className={styles.popupClose}
                    onClick={closePopup}>
                    &times;
            </button>
            <h3>Location Details</h3>
            <p>{displayCoordinates}</p>
            <p>Place: {placeName}</p>
          </div>
        
      </div>

      <div style={{ width: "18%", backgroundColor: "white", padding: '15px'}}>
        <div>{hoverLongitude}</div>
        <div style={{marginTop:'10px', marginBottom:'7px'}}>{hoverLatitude}</div>
        <hr color="lightgrey"/>
        <div style={{ marginTop: '10px' , marginBottom:'5px' }}>
          {/* <label htmlFor="type">Select Shape to Draw  : </label> */}
        <h4> Select Shape to Draw : </h4>
        </div>
        <div style={{marginBottom:'15px'}}>
          <select id="type" value={type} onChange={handleTypeChange}>
            <option value="None">None</option>
            <option value="Point">Point</option>
            <option value="LineString">LineString</option>
            <option value="Polygon">Polygon</option>
            <option value="Circle">Circle</option>
          </select>

          <button id="nb" style={{ alignItems:"right", width: "fit-content", padding: "5.5px", borderRadius: "15px",borderColor:"white", marginLeft:"18px", color: "white", cursor:"pointer",
             backgroundColor: isHovered ? "#007BFF" : "green" , transition:"backgroundColor 0.3s",
           }}
           onMouseEnter={()=> setIsHovered(true)}
           onMouseLeave={()=> setIsHovered(false)} 
           onClick={() => {
            vectorSource.clear();  // Reset the vector source and area/length totals
            setTotalArea(0); // Reset total area
            setTotalLength(0); // Reset total length
            setGeoJsonString(JSON.stringify({ type: "FeatureCollection", features: [] }, null, 2)); // Reset GeoJSON
          }}>Reset</button>
          <hr color="lightgrey" style={{marginTop:'7px'}}/>
          
          <div style={{ marginTop: '10px' }}>
          <h4 style={{marginBottom:'7px'}}>Upload GeoJSON File :</h4>
          <input 
            type="file" 
            accept=".json" 
            onChange={handleFileUpload} 
            style={{ marginBottom: '12px' }}
          />
          <hr color="lightgrey"/>
          <h4 style={{marginTop:'7px'}}>Input GeoJSON :</h4>
          <textarea 
            rows={5} 
            value={geoJsonInput} 
            onChange={(e) => setGeoJsonInput(e.target.value)} 
            placeholder="Paste your GeoJSON here"
            style={{ width: '100%', resize: 'none', marginTop:'5px' }}
          />
          <button onClick={handleGeoJsonSubmit} style={{ marginTop: '10px' }}>
            Draw from GeoJSON
          </button>
        </div>

        </div>
        <hr color="lightgrey"/>
        <div style={{ marginTop: '10px' , marginBottom:'10px' }}>
          <h4 style={{marginBottom:'5px'}}>Total Length of LineString :</h4>
          <p>{totalLengthConverted.meters.toFixed(2)} m</p>
          <p>{totalLengthConverted.kilometers.toFixed(2)} km</p>
          {/* <p>{totalLengthConverted.miles.toFixed(2)} mi</p>
          <p>{totalLengthConverted.feet.toFixed(2)} ft</p> */}
        </div>
        <hr  color="lightgrey"/>

        <div style={{ marginTop: '10px' }}>
          <h4 style={{marginBottom:'5px'}}>Total Area Covered :</h4>
          <p>{totalAreaConverted.sqM.toFixed(2)} m²</p>
          <p>{totalAreaConverted.sqKm.toFixed(2)} km²</p>
          {/* <p>{totalAreaConverted.sqMiles.toFixed(2)} mi²</p>
          <p>{totalAreaConverted.sqFeet.toFixed(2)} ft²</p> */}
        </div>
      </div>
    </div>
  );
};

export default GeoFile;