'use client';

import { useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Switch } from '@mui/material';
import Layout from '../../components/Layout';
import MapContainer from '../../components/MapContainer';
import ControlPanel from '../../components/ControlPanel';
import maplibregl from 'maplibre-gl';
import { SelectChangeEvent } from '@mui/material';

interface MapStyle {
  id: string;
  name: string;
  url: string;
  dark: boolean;
  satellite: boolean;
}

// MapTilerのAPIキー
const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';

// Map Style URLを生成する関数
function getMapStyleURL(styleId: string): string {
  if (!MAPTILER_API_KEY) {
    console.error('MapTiler API Key is not set. Please set NEXT_PUBLIC_MAPTILER_API_KEY in your environment variables.');
    return '';
  }
  return `https://api.maptiler.com/maps/${styleId}/style.json?key=${MAPTILER_API_KEY}`;
}

const mapStyles: MapStyle[] = [
  {
    id: 'basic-v2',
    name: 'Basic',
    url: getMapStyleURL('basic-v2'),
    dark: false,
    satellite: false
  },
  {
    id: 'streets-v2',
    name: 'Streets',
    url: getMapStyleURL('streets-v2'),
    dark: false,
    satellite: false
  },
  {
    id: 'outdoor-v2',
    name: 'Outdoor',
    url: getMapStyleURL('outdoor-v2'),
    dark: false,
    satellite: false
  },
  {
    id: 'winter-v2',
    name: 'Winter',
    url: getMapStyleURL('winter-v2'),
    dark: false,
    satellite: false
  },
  {
    id: 'topo-v2',
    name: 'Topo',
    url: getMapStyleURL('topo-v2'),
    dark: false,
    satellite: false
  },
  {
    id: 'bright-v2',
    name: 'Bright',
    url: getMapStyleURL('bright-v2'),
    dark: false,
    satellite: false
  },
  {
    id: 'dataviz',
    name: 'Dataviz',
    url: getMapStyleURL('dataviz'),
    dark: false,
    satellite: false
  },
  {
    id: 'ocean',
    name: 'Ocean',
    url: getMapStyleURL('ocean'),
    dark: false,
    satellite: false
  },
  {
    id: 'openstreetmap',
    name: 'OpenStreetMap',
    url: getMapStyleURL('openstreetmap'),
    dark: false,
    satellite: false
  },
  {
    id: 'streets-dark',
    name: 'Streets Dark',
    url: getMapStyleURL('streets-v2-dark'),
    dark: true,
    satellite: false
  },
  {
    id: 'basic-dark',
    name: 'Basic Dark',
    url: getMapStyleURL('basic-v2-dark'),
    dark: true,
    satellite: false
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: getMapStyleURL('satellite'),
    dark: false,
    satellite: true
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    url: getMapStyleURL('hybrid'),
    dark: false,
    satellite: true
  },
  // デモタイルも保持（APIキーが不要）
  {
    id: 'demotiles',
    name: 'デモタイル',
    url: 'https://demotiles.maplibre.org/style.json',
    dark: false,
    satellite: false
  }
];

// スタイル取得関数
const getMapStyle = (styleId: string) => {
  const style = mapStyles.find(s => s.id === styleId);
  return style ? style.url : mapStyles[0].url;
};

export default function StylesPage() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [currentStyle, setCurrentStyle] = useState<string>(mapStyles[0].id);
  const [show3dBuildings, setShow3dBuildings] = useState<boolean>(false);
  const [currentMapStyle, setCurrentMapStyle] = useState<string>(getMapStyle(mapStyles[0].id));

  const handleMapLoad = (loadedMap: maplibregl.Map) => {
    setMap(loadedMap);
  };

  const handleStyleChange = (event: SelectChangeEvent) => {
    const newStyle = event.target.value;
    setCurrentStyle(newStyle);
    setCurrentMapStyle(getMapStyle(newStyle));
  };

  const handle3dBuildingsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const show = event.target.checked;
    setShow3dBuildings(show);
    
    if (!map) return;
    
    try {
      // 3Dビルディングレイヤーの処理
      const layerId = '3d-buildings';
      
      // レイヤーがすでに存在するかチェック
      const layerExists = map.getLayer(layerId);
      
      if (show) {
        // レイヤーを追加または表示
        if (!layerExists) {
          // フィルエクストルージョンレイヤーを追加
          map.addLayer({
            'id': layerId,
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 13,
            'paint': {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                16, ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                16, ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
          });
        } else if (layerExists && !map.getLayoutProperty(layerId, 'visibility') || map.getLayoutProperty(layerId, 'visibility') === 'none') {
          // レイヤーが存在するが非表示の場合は表示する
          map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
      } else if (layerExists) {
        // レイヤーを非表示にする
        map.setLayoutProperty(layerId, 'visibility', 'none');
      }
    } catch (error) {
      console.error('3Dビルディングレイヤーのエラー:', error);
    }
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
          mapStyle={currentMapStyle}
          onMapLoad={handleMapLoad}
        />
        
        <ControlPanel>
          <Typography variant="h6" gutterBottom>
            マップスタイル設定
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }} size="small">
            <InputLabel>スタイル</InputLabel>
            <Select
              value={currentStyle}
              label="スタイル"
              onChange={handleStyleChange}
            >
              {mapStyles.map((style) => (
                <MenuItem 
                  key={style.id} 
                  value={style.id}
                  sx={{ 
                    color: style.dark ? 'white' : 'inherit',
                    bgcolor: style.dark ? 'grey.800' : 'inherit'
                  }}
                >
                  {style.name}
                  {style.satellite && ' (衛星画像)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={show3dBuildings}
                  onChange={handle3dBuildingsChange}
                />
              }
              label="3Dビルディングを表示"
            />
          </Box>

        </ControlPanel>
      </Box>
    </Layout>
  );
} 