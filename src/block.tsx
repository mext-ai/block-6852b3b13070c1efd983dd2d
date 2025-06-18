import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface BlockProps {
  title?: string;
  description?: string;
}

interface GPSPoint {
  name: string;
  lat: number;
  lng: number;
  type: 'etape' | 'bivouac' | 'liaison' | 'special';
  description?: string;
}

const Block: React.FC<BlockProps> = ({ title = "Carte du Rallye Kazakhstan", description = "Itinéraire complet avec étapes, bivouacs et liaisons" }) => {
  const [selectedPoint, setSelectedPoint] = useState<GPSPoint | null>(null);

  // Coordonnées GPS du rallye au Kazakhstan
  const gpsPoints: GPSPoint[] = [
    // Étapes principales
    { name: "Départ - Almaty", lat: 43.2220, lng: 76.8512, type: 'special', description: "Point de départ du rallye" },
    { name: "Étape 1 - Balkhash", lat: 46.8417, lng: 74.9800, type: 'etape', description: "Première étape vers le lac Balkhash" },
    { name: "Étape 2 - Karaganda", lat: 49.8047, lng: 73.1094, type: 'etape', description: "Passage par la région industrielle" },
    { name: "Étape 3 - Astana", lat: 51.1694, lng: 71.4491, type: 'etape', description: "Capitale du Kazakhstan" },
    { name: "Étape 4 - Kostanay", lat: 53.2138, lng: 63.6249, type: 'etape', description: "Direction nord-ouest" },
    { name: "Étape 5 - Aktobe", lat: 50.2839, lng: 57.2072, type: 'etape', description: "Région ouest du Kazakhstan" },
    { name: "Étape 6 - Atyrau", lat: 47.1164, lng: 51.9270, type: 'etape', description: "Proche de la mer Caspienne" },
    { name: "Étape 7 - Aktau", lat: 43.6506, lng: 51.1729, type: 'etape', description: "Port sur la mer Caspienne" },
    { name: "Étape 8 - Mangystau", lat: 44.0000, lng: 52.0000, type: 'etape', description: "Région désertique" },
    { name: "Étape 9 - Beyneu", lat: 45.3167, lng: 55.2000, type: 'etape', description: "Carrefour routier important" },
    { name: "Étape 10 - Aral", lat: 46.7833, lng: 61.6667, type: 'etape', description: "Près de l'ancienne mer d'Aral" },
    { name: "Étape 11 - Kyzylorda", lat: 44.8479, lng: 65.5094, type: 'etape', description: "Centre du Kazakhstan" },
    { name: "Étape 12 - Shymkent", lat: 42.3000, lng: 69.6000, type: 'etape', description: "Sud du Kazakhstan" },
    { name: "Arrivée - Almaty", lat: 43.2220, lng: 76.8512, type: 'special', description: "Retour au point de départ" },

    // Bivouacs
    { name: "Bivouac 1 - Lac Balkhash", lat: 46.7500, lng: 75.0000, type: 'bivouac', description: "Campement près du lac" },
    { name: "Bivouac 2 - Steppe Karaganda", lat: 49.9000, lng: 73.5000, type: 'bivouac', description: "Nuit dans la steppe" },
    { name: "Bivouac 3 - Parc Burabay", lat: 53.0833, lng: 70.2667, type: 'bivouac', description: "Parc naturel" },
    { name: "Bivouac 4 - Désert Ustyurt", lat: 44.5000, lng: 58.0000, type: 'bivouac', description: "Plateau désertique" },
    { name: "Bivouac 5 - Côte Caspienne", lat: 43.5000, lng: 51.0000, type: 'bivouac', description: "Bivouac en bord de mer" },
    { name: "Bivouac 6 - Canyon Charyn", lat: 43.3500, lng: 79.0833, type: 'bivouac', description: "Canyon spectaculaire" },

    // Liaisons importantes
    { name: "Liaison A - Almaty-Balkhash", lat: 45.0000, lng: 75.5000, type: 'liaison', description: "Route de liaison" },
    { name: "Liaison B - Karaganda-Astana", lat: 50.5000, lng: 72.3000, type: 'liaison', description: "Autoroute principale" },
    { name: "Liaison C - Astana-Kostanay", lat: 52.2000, lng: 67.3000, type: 'liaison', description: "Route vers le nord" },
    { name: "Liaison D - Aktobe-Atyrau", lat: 48.7000, lng: 54.5000, type: 'liaison', description: "Traversée ouest" },
    { name: "Liaison E - Atyrau-Aktau", lat: 45.4000, lng: 51.5000, type: 'liaison', description: "Route côtière" },
    { name: "Liaison F - Beyneu-Aral", lat: 46.0000, lng: 58.4000, type: 'liaison', description: "Route du désert" },
    { name: "Liaison G - Kyzylorda-Shymkent", lat: 43.6000, lng: 67.3000, type: 'liaison', description: "Route sud" }
  ];

  // Créer les icônes personnalisées
  const createIcon = (type: string) => {
    const colors = {
      etape: '#e74c3c',
      bivouac: '#2ecc71',
      liaison: '#3498db',
      special: '#f39c12'
    };
    
    return L.divIcon({
      html: `<div style="
        background-color: ${colors[type as keyof typeof colors]};
        border: 2px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${type === 'etape' ? 'E' : type === 'bivouac' ? 'B' : type === 'liaison' ? 'L' : 'S'}</div>`,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  // Créer la ligne de l'itinéraire principal (étapes seulement)
  const routeCoordinates = gpsPoints
    .filter(point => point.type === 'etape' || point.type === 'special')
    .map(point => [point.lat, point.lng] as [number, number]);

  // Centre de la carte (centre du Kazakhstan)
  const mapCenter: [number, number] = [48.0196, 66.9237];

  useEffect(() => {
    // Envoyer l'événement de completion dès le chargement de la carte
    const sendCompletion = () => {
      window.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'rally-map-kazakhstan', 
        completed: true,
        data: { totalPoints: gpsPoints.length }
      }, '*');
      window.parent.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'rally-map-kazakhstan', 
        completed: true,
        data: { totalPoints: gpsPoints.length }
      }, '*');
    };

    const timer = setTimeout(sendCompletion, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
      {/* En-tête */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        zIndex: 1000,
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>{title}</h1>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>{description}</p>
      </div>

      {/* Légende */}
      <div style={{
        position: 'absolute',
        top: '80px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 1000,
        minWidth: '200px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>Légende</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#e74c3c', borderRadius: '50%', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>E</div>
            <span style={{ fontSize: '14px', color: '#333' }}>Étapes ({gpsPoints.filter(p => p.type === 'etape').length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#2ecc71', borderRadius: '50%', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>B</div>
            <span style={{ fontSize: '14px', color: '#333' }}>Bivouacs ({gpsPoints.filter(p => p.type === 'bivouac').length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#3498db', borderRadius: '50%', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>L</div>
            <span style={{ fontSize: '14px', color: '#333' }}>Liaisons ({gpsPoints.filter(p => p.type === 'liaison').length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#f39c12', borderRadius: '50%', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>S</div>
            <span style={{ fontSize: '14px', color: '#333' }}>Spéciaux ({gpsPoints.filter(p => p.type === 'special').length})</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            Total: {gpsPoints.length} points GPS
          </p>
        </div>
      </div>

      {/* Informations du point sélectionné */}
      {selectedPoint && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '15px',
          borderRadius: '8px',
          zIndex: 1000,
          maxWidth: '300px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          <button 
            onClick={() => setSelectedPoint(null)}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>{selectedPoint.name}</h3>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
            <strong>Type:</strong> {selectedPoint.type.charAt(0).toUpperCase() + selectedPoint.type.slice(1)}
          </p>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
            <strong>Coordonnées:</strong> {selectedPoint.lat.toFixed(4)}°, {selectedPoint.lng.toFixed(4)}°
          </p>
          {selectedPoint.description && (
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#333' }}>
              {selectedPoint.description}
            </p>
          )}
        </div>
      )}

      {/* Carte */}
      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Ligne de l'itinéraire principal */}
        <Polyline
          positions={routeCoordinates}
          color="#e74c3c"
          weight={3}
          opacity={0.7}
          dashArray="5, 10"
        />

        {/* Marqueurs pour tous les points */}
        {gpsPoints.map((point, index) => (
          <Marker
            key={index}
            position={[point.lat, point.lng]}
            icon={createIcon(point.type)}
            eventHandlers={{
              click: () => setSelectedPoint(point)
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{point.name}</h3>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                  <strong>Type:</strong> {point.type.charAt(0).toUpperCase() + point.type.slice(1)}
                </p>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                  <strong>Coordonnées:</strong> {point.lat.toFixed(4)}°, {point.lng.toFixed(4)}°
                </p>
                {point.description && (
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                    {point.description}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Cercles pour mettre en évidence les zones importantes */}
        <Circle
          center={[43.2220, 76.8512]} // Almaty
          radius={50000}
          color="#f39c12"
          fillColor="#f39c12"
          fillOpacity={0.1}
        />
        <Circle
          center={[51.1694, 71.4491]} // Astana
          radius={50000}
          color="#f39c12"
          fillColor="#f39c12"
          fillOpacity={0.1}
        />
      </MapContainer>
    </div>
  );
};

export default Block;