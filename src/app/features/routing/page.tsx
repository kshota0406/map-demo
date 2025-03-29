'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button, TextField, Stack, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import Layout from '../../components/Layout';
import MapContainer from '../../components/MapContainer';
import ControlPanel from '../../components/ControlPanel';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Waypoint {
  name: string;
  longitude: number;
  latitude: number;
}

// POIデータの定義
const POIs: Waypoint[] = [
  { name: '東京駅', longitude: 139.7671, latitude: 35.6812 },
  { name: '新宿駅', longitude: 139.7016, latitude: 35.6905 },
  { name: '渋谷駅', longitude: 139.7020, latitude: 35.6580 },
  { name: '池袋駅', longitude: 139.7103, latitude: 35.7295 },
  { name: '上野駅', longitude: 139.7770, latitude: 35.7141 }
];

// GeoJSON型定義
type LineStringFeature = GeoJSON.Feature<GeoJSON.LineString>;

export default function RoutingPage() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [startPoint, setStartPoint] = useState<Waypoint>(POIs[0]);
  const [endPoint, setEndPoint] = useState<Waypoint>(POIs[1]);
  const [loading, setLoading] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routeDuration, setRouteDuration] = useState<number>(0);

  const SOURCE_ID = 'route-source';
  const LAYER_ID = 'route-layer';
  const POINT_SOURCE_ID = 'waypoints-source';
  const POINT_LAYER_ID = 'waypoints-layer';

  const handleMapLoad = (loadedMap: maplibregl.Map) => {
    setMap(loadedMap);
  };

  const handleStartPointChange = (event: SelectChangeEvent) => {
    const selectedName = event.target.value;
    const selected = POIs.find(poi => poi.name === selectedName);
    if (selected) setStartPoint(selected);
  };

  const handleEndPointChange = (event: SelectChangeEvent) => {
    const selectedName = event.target.value;
    const selected = POIs.find(poi => poi.name === selectedName);
    if (selected) setEndPoint(selected);
  };

  // 直線距離の計算
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const earthRadius = 6371; // km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return earthRadius * c;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  // 最初のルート表示
  useEffect(() => {
    if (map) {
      calculateRoute();
    }
  // マップが読み込まれた時だけ一回実行する
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // ルート計算中にレイヤーが削除されないようにする
  useEffect(() => {
    return () => {
      // コンポーネントのアンマウント時にクリーンアップ
      if (map) {
        if (map.getLayer(LAYER_ID)) {
          map.removeLayer(LAYER_ID);
        }
        if (map.getSource(SOURCE_ID)) {
          map.removeSource(SOURCE_ID);
        }
        if (map.getLayer(POINT_LAYER_ID)) {
          map.removeLayer(POINT_LAYER_ID);
        }
        if (map.getSource(POINT_SOURCE_ID)) {
          map.removeSource(POINT_SOURCE_ID);
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateRoute = () => {
    if (!map) return;
    
    setLoading(true);
    setRouteError(null);
    
    try {
      const startCoord: [number, number] = [startPoint.longitude, startPoint.latitude];
      const endCoord: [number, number] = [endPoint.longitude, endPoint.latitude];
      
      // 疑似ルートデータを生成
      const routeData = generateDummyRoute(startCoord, endCoord);
      
      // 既存のレイヤーがあれば削除
      if (map.getLayer(LAYER_ID)) {
        map.removeLayer(LAYER_ID);
      }
      
      // 既存のソースがあれば削除
      if (map.getSource(SOURCE_ID)) {
        map.removeSource(SOURCE_ID);
      }
      
      // ウェイポイントのレイヤーがあれば削除
      if (map.getLayer(POINT_LAYER_ID)) {
        map.removeLayer(POINT_LAYER_ID);
      }
      
      // ウェイポイントのソースがあれば削除
      if (map.getSource(POINT_SOURCE_ID)) {
        map.removeSource(POINT_SOURCE_ID);
      }
      
      // ルート表示用のソースとレイヤーを追加
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: routeData
      });
      
      map.addLayer({
        id: LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#0066ff',
          'line-width': 6,
          'line-opacity': 0.8
        }
      });
      
      // 開始点と終了点のマーカーを表示
      map.addSource(POINT_SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { point_type: 'start', name: startPoint.name },
              geometry: {
                type: 'Point',
                coordinates: startCoord
              }
            },
            {
              type: 'Feature',
              properties: { point_type: 'end', name: endPoint.name },
              geometry: {
                type: 'Point',
                coordinates: endCoord
              }
            }
          ]
        }
      });
      
      map.addLayer({
        id: POINT_LAYER_ID,
        type: 'circle',
        source: POINT_SOURCE_ID,
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'match',
            ['get', 'point_type'],
            'start', '#00ff00',
            'end', '#ff0000',
            '#000000'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
      
      // ポップアップを追加
      new maplibregl.Popup({closeButton: true, closeOnClick: false})
        .setLngLat(startCoord)
        .setHTML(`<h3>スタート</h3><p>${startPoint.name}</p>`)
        .addTo(map);
      
      new maplibregl.Popup({closeButton: true, closeOnClick: false})
        .setLngLat(endCoord)
        .setHTML(`<h3>ゴール</h3><p>${endPoint.name}</p>`)
        .addTo(map);
      
      // ルートが見えるようにビューを調整
      const bounds = new maplibregl.LngLatBounds()
        .extend(startCoord)
        .extend(endCoord);
      
      map.fitBounds(bounds, {
        padding: 50
      });
      
      // 疑似的な距離と時間を計算
      const dist = calculateDistance(startCoord[1], startCoord[0], endCoord[1], endCoord[0]);
      setRouteDistance(dist);
      setRouteDuration(Math.round(dist / 4.5 * 60)); // 平均速度4.5km/hで計算
      
      setLoading(false);
    } catch (error) {
      console.error('Route calculation error:', error);
      setRouteError('ルートの計算中にエラーが発生しました。');
      setLoading(false);
    }
  };

  // 疑似的なルートデータを生成する関数
  const generateDummyRoute = (start: [number, number], end: [number, number]): GeoJSON.FeatureCollection => {
    // 中間点を生成（単純化のため、始点と終点の間に2つの中間点を生成）
    const midPoint1: [number, number] = [
      start[0] + (end[0] - start[0]) * 0.33 + (Math.random() - 0.5) * 0.01,
      start[1] + (end[1] - start[1]) * 0.33 + (Math.random() - 0.5) * 0.01
    ];
    
    const midPoint2: [number, number] = [
      start[0] + (end[0] - start[0]) * 0.66 + (Math.random() - 0.5) * 0.01,
      start[1] + (end[1] - start[1]) * 0.66 + (Math.random() - 0.5) * 0.01
    ];
    
    // GeoJSONデータを作成
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [start, midPoint1, midPoint2, end]
          }
        }
      ]
    };
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
            ルート検索
          </Typography>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>出発地</InputLabel>
            <Select
              value={startPoint.name}
              label="出発地"
              onChange={handleStartPointChange}
            >
              {POIs.map((poi) => (
                <MenuItem key={`start-${poi.name}`} value={poi.name}>{poi.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>目的地</InputLabel>
            <Select
              value={endPoint.name}
              label="目的地"
              onChange={handleEndPointChange}
            >
              {POIs.map((poi) => (
                <MenuItem key={`end-${poi.name}`} value={poi.name}>{poi.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            fullWidth 
            onClick={calculateRoute}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'ルート検索'}
          </Button>
          
          {routeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {routeError}
            </Alert>
          )}
          
          {routeDistance > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                ルート情報
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">距離:</Typography>
                <Typography variant="body1" fontWeight="bold">{routeDistance.toFixed(1)} km</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">推定時間:</Typography>
                <Typography variant="body1" fontWeight="bold">{routeDuration} 分</Typography>
              </Box>
            </Box>
          )}
        </ControlPanel>
      </Box>
    </Layout>
  );
} 