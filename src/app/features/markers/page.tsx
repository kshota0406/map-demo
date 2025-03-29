'use client';

import { useState } from 'react';
import { Box, Typography, Button, TextField, Stack } from '@mui/material';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../../components/Layout';
import MapContainer from '../../components/MapContainer';
import ControlPanel from '../../components/ControlPanel';
import maplibregl from 'maplibre-gl';

interface Marker {
  id: string;
  longitude: number;
  latitude: number;
  label: string;
  color: string;
}

export default function MarkersPage() {
  const [markers, setMarkers] = useState<Marker[]>([
    { id: '1', longitude: 139.7634, latitude: 35.6812, label: '東京タワー', color: '#FF0000' },
    { id: '2', longitude: 139.7500, latitude: 35.6846, label: '皇居', color: '#00FF00' },
  ]);
  const [markerRefs, setMarkerRefs] = useState<{[key: string]: maplibregl.Marker}>({});
  const [newMarker, setNewMarker] = useState<Omit<Marker, 'id'>>({
    longitude: 139.75,
    latitude: 35.68,
    label: '',
    color: '#0000FF'
  });
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  const handleMarkerChange = (field: keyof Omit<Marker, 'id'>, value: string | number) => {
    setNewMarker({
      ...newMarker,
      [field]: value
    });
  };

  const addMarker = () => {
    if (!newMarker.label) return;
    
    const id = Date.now().toString();
    const newMarkerWithId = { id, ...newMarker };
    
    setMarkers([...markers, newMarkerWithId]);
    
    if (map) {
      const mapMarker = new maplibregl.Marker({ color: newMarker.color })
        .setLngLat([newMarker.longitude, newMarker.latitude])
        .setPopup(new maplibregl.Popup().setHTML(`<h3>${newMarker.label}</h3>`))
        .addTo(map);
      
      setMarkerRefs(prev => ({
        ...prev,
        [id]: mapMarker
      }));
    }
    
    // リセット
    setNewMarker({
      ...newMarker,
      label: ''
    });
  };

  const removeMarker = (id: string) => {
    // マップからマーカーを削除
    if (markerRefs[id]) {
      markerRefs[id].remove();
      const newMarkerRefs = {...markerRefs};
      delete newMarkerRefs[id];
      setMarkerRefs(newMarkerRefs);
    }
    
    // 状態からマーカーを削除
    setMarkers(markers.filter(marker => marker.id !== id));
  };

  const handleMapLoad = (loadedMap: maplibregl.Map) => {
    setMap(loadedMap);
    
    // 既存のマーカーを追加
    markers.forEach(marker => {
      const mapMarker = new maplibregl.Marker({ color: marker.color })
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(new maplibregl.Popup().setHTML(`<h3>${marker.label}</h3>`))
        .addTo(loadedMap);
      
      setMarkerRefs(prev => ({
        ...prev,
        [marker.id]: mapMarker
      }));
    });
  };

  return (
    <Layout>
      <Box sx={{ position: 'relative', height: '100%' }}>
        <MapContainer 
          initialViewState={{
            longitude: 139.7634,
            latitude: 35.6812,
            zoom: 9
          }}
          onMapLoad={handleMapLoad}
        />
        
        <ControlPanel>
          <Typography variant="h6" gutterBottom>
            マーカーの追加
          </Typography>
          
          <Stack spacing={2} sx={{ mb: 2 }}>
            <TextField 
              label="マーカー名" 
              value={newMarker.label}
              onChange={(e) => handleMarkerChange('label', e.target.value)}
              fullWidth
              size="small"
            />
            
            <Stack direction="row" spacing={1}>
              <TextField 
                label="経度" 
                type="number"
                value={newMarker.longitude}
                onChange={(e) => handleMarkerChange('longitude', parseFloat(e.target.value))}
                fullWidth
                size="small"
                inputProps={{ step: 0.0001 }}
              />
              <TextField 
                label="緯度" 
                type="number"
                value={newMarker.latitude}
                onChange={(e) => handleMarkerChange('latitude', parseFloat(e.target.value))}
                fullWidth
                size="small"
                inputProps={{ step: 0.0001 }}
              />
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField 
                label="色" 
                type="color"
                value={newMarker.color}
                onChange={(e) => handleMarkerChange('color', e.target.value)}
                sx={{ width: 100 }}
                size="small"
              />
              <Button 
                variant="contained" 
                startIcon={<AddLocationIcon />}
                onClick={addMarker}
                disabled={!newMarker.label}
                fullWidth
              >
                追加
              </Button>
            </Stack>
          </Stack>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            マーカー一覧
          </Typography>
          
          <Stack spacing={1}>
            {markers.map((marker) => (
              <Box 
                key={marker.id} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1,
                  border: '1px solid #eee',
                  borderRadius: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      bgcolor: marker.color,
                      mr: 1 
                    }} 
                  />
                  <Typography variant="body2">
                    {marker.label}
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  startIcon={<DeleteIcon />} 
                  color="error"
                  onClick={() => removeMarker(marker.id)}
                >
                  削除
                </Button>
              </Box>
            ))}
            {markers.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                マーカーがありません
              </Typography>
            )}
          </Stack>
        </ControlPanel>
      </Box>
    </Layout>
  );
} 