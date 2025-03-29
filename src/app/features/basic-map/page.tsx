'use client';

import { useState, useCallback } from 'react';
import { Box, Typography, Slider, Select, MenuItem, FormControl, SelectChangeEvent } from '@mui/material';
import Layout from '../../components/Layout';
import MapContainer from '../../components/MapContainer';
import ControlPanel from '../../components/ControlPanel';
import maplibregl from 'maplibre-gl';

interface Location {
  name: string;
  longitude: number;
  latitude: number;
  zoom: number;
}

const locations: { [key: string]: Location } = {
  '東京': { name: '東京', longitude: 139.7634, latitude: 35.6812, zoom: 8 },
  '大阪': { name: '大阪', longitude: 135.5023, latitude: 34.6937, zoom: 8 },
  '名古屋': { name: '名古屋', longitude: 136.9066, latitude: 35.1815, zoom: 8 },
  '札幌': { name: '札幌', longitude: 141.3469, latitude: 43.0618, zoom: 8 },
  '福岡': { name: '福岡', longitude: 130.4017, latitude: 33.5902, zoom: 8 }
};

export default function BasicMapPage() {
  const [selectedLocation, setSelectedLocation] = useState<string>('東京');
  const [zoom, setZoom] = useState<number>(4);
  const [location, setLocation] = useState<Location>(locations['東京']);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  const handleLocationChange = (event: SelectChangeEvent) => {
    const city = event.target.value;
    setSelectedLocation(city);
    setLocation(locations[city]);
  };

  const handleZoomChange = (_event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  };

  const handleMapLoad = (newMap: maplibregl.Map) => {
    setMap(newMap);
  };

  return (
    <Layout>
      <Box sx={{ position: 'relative', height: '100%' }}>
        <MapContainer 
          initialViewState={{
            longitude: location.longitude,
            latitude: location.latitude,
            zoom
          }}
          onMapLoad={handleMapLoad}
        />
        
        <ControlPanel defaultOpen={true}>
          <Typography variant="h6" gutterBottom>
            基本地図コントロール
          </Typography>
          
          <Typography id="location-select-label" gutterBottom>
            場所
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <Select
              value={selectedLocation}
              onChange={handleLocationChange}
              displayEmpty
              inputProps={{ 'aria-labelledby': 'location-select-label' }}
            >
              {Object.keys(locations).map((city) => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography id="zoom-slider-label" gutterBottom>
            ズームレベル: {zoom}
          </Typography>
          <Box sx={{ px: 1, mb: 3 }}>
            <Slider
              value={zoom}
              onChange={handleZoomChange}
              min={3}
              max={18}
              step={0.5}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ flex: '1 1 45%' }}>
              <Typography variant="body2" gutterBottom>
                表示中心緯度:
              </Typography>
              <Typography variant="body1">
                {location.latitude.toFixed(4)}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 45%' }}>
              <Typography variant="body2" gutterBottom>
                表示中心経度:
              </Typography>
              <Typography variant="body1">
                {location.longitude.toFixed(4)}
              </Typography>
            </Box>
          </Box>
        </ControlPanel>
      </Box>
    </Layout>
  );
} 