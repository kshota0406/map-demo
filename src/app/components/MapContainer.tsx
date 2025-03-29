'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapContainerProps {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  mapStyle?: string;
  children?: ReactNode;
  onMapLoad?: (map: maplibregl.Map) => void;
}

export default function MapContainer({
  initialViewState = {
    longitude: 139.7634,  // 東京
    latitude: 35.6812,
    zoom: 8  // 12から8へ変更してより広い範囲を表示
  },
  mapStyle = 'https://demotiles.maplibre.org/style.json',
  children,
  onMapLoad
}: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    
    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      maxPitch: 85
    });
    
    map.current = mapInstance;
    
    mapInstance.on('load', () => {
      setIsMapInitialized(true);
      if (onMapLoad) {
        onMapLoad(mapInstance);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  // 初期化時だけ実行される
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // マップスタイルが変更された場合の処理
  useEffect(() => {
    if (map.current && isMapInitialized && mapStyle) {
      // スタイル変更時に新しいスタイルを適用するだけで、マップを再作成しない
      try {
        map.current.setStyle(mapStyle);
        
        // スタイル変更後にイベントを再登録
        map.current.once('style.load', () => {
          if (onMapLoad && map.current) {
            onMapLoad(map.current);
          }
        });
      } catch (error) {
        console.error('マップスタイル変更エラー:', error);
      }
    }
  }, [mapStyle, isMapInitialized, onMapLoad]);

  // ビューステートが変更された場合の処理
  useEffect(() => {
    if (map.current && isMapInitialized) {
      map.current.jumpTo({
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom
      });
    }
  }, [initialViewState.latitude, initialViewState.longitude, initialViewState.zoom, isMapInitialized]);

  return (
    <Box
      ref={mapContainer}
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }}
      className="maplibre-container"
    >
      {children}
    </Box>
  );
} 