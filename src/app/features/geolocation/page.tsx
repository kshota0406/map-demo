'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button, Stack, Chip, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import SpeedIcon from '@mui/icons-material/Speed';
import HeightIcon from '@mui/icons-material/Height';
import WarningIcon from '@mui/icons-material/Warning';
import Layout from '../../components/Layout';
import MapContainer from '../../components/MapContainer';
import ControlPanel from '../../components/ControlPanel';
import maplibregl from 'maplibre-gl';

interface GeolocationData {
  longitude: number;
  latitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export default function GeolocationPage() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState<GeolocationData[]>([]);
  const watchId = useRef<number | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const accuracyCircleRef = useRef<string>('geolocation-accuracy-circle');

  const handleMapLoad = (loadedMap: maplibregl.Map) => {
    setMap(loadedMap);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('お使いのブラウザはジオロケーションをサポートしていません。モックデータを使用します。');
      
      // ブラウザが位置情報をサポートしていない場合はモックデータを使用
      useMockLocation();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          
          const newGeoData: GeolocationData = {
            longitude,
            latitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };
          
          setGeoData(newGeoData);
          setLocationHistory(prev => [newGeoData, ...prev].slice(0, 5));
          
          if (map) {
            // マップの中心を現在地に移動
            map.flyTo({
              center: [longitude, latitude],
              zoom: 15
            });
            
            // マーカーを表示または更新
            if (markerRef.current) {
              markerRef.current.setLngLat([longitude, latitude]);
            } else {
              markerRef.current = new maplibregl.Marker({
                color: '#3F51B5'
              })
                .setLngLat([longitude, latitude])
                .addTo(map);
            }
            
            // 精度サークルを表示または更新
            updateAccuracyCircle(longitude, latitude, position.coords.accuracy);
          }
          
          setLoading(false);
        },
        (posError) => {
          console.error('位置情報取得エラー:', {
            code: posError.code,
            message: posError.message,
            PERMISSION_DENIED: posError.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: posError.POSITION_UNAVAILABLE,
            TIMEOUT: posError.TIMEOUT
          });
          setLoading(false);
          
          let errorMessage = '位置情報の取得に失敗しました。モックデータを使用します。';
          
          // エラーコードに基づいてメッセージを設定
          switch(posError.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = '位置情報へのアクセスが拒否されました。ブラウザの設定で許可してください。モックデータを使用します。';
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = '現在地を取得できませんでした。デバイスのGPSが無効になっている可能性があります。モックデータを使用します。';
              break;
            case 3: // TIMEOUT
              errorMessage = '位置情報の取得がタイムアウトしました。モックデータを使用します。';
              break;
          }
          
          setError(errorMessage);
          
          // エラーが発生した場合はモックデータを使用
          useMockLocation();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (geolocationError) {
      console.error('Geolocation API エラー:', geolocationError);
      setLoading(false);
      setError('位置情報の取得に失敗しました。モックデータを使用します。');
      
      // エラーが発生した場合はモックデータを使用
      useMockLocation();
    }
  };

  // 開発用のモックデータを使用する関数
  const useMockLocation = () => {
    const mockData: GeolocationData = {
      longitude: 139.7634,
      latitude: 35.6812,
      accuracy: 15.0,
      altitude: 40.5,
      altitudeAccuracy: 10.0,
      heading: 90.0,
      speed: 4.2,
      timestamp: Date.now()
    };
    
    setGeoData(mockData);
    setLocationHistory(prev => [mockData, ...prev].slice(0, 5));
    
    if (map) {
      // マップの中心を現在地に移動
      map.flyTo({
        center: [mockData.longitude, mockData.latitude],
        zoom: 15
      });
      
      // マーカーを表示または更新
      if (markerRef.current) {
        markerRef.current.setLngLat([mockData.longitude, mockData.latitude]);
      } else {
        markerRef.current = new maplibregl.Marker({
          color: '#3F51B5'
        })
          .setLngLat([mockData.longitude, mockData.latitude])
          .addTo(map);
      }
      
      // 精度サークルを表示または更新
      updateAccuracyCircle(mockData.longitude, mockData.latitude, mockData.accuracy);
    }
  };

  const toggleLocationTracking = () => {
    if (tracking) {
      // トラッキングを停止
      if (watchId.current !== null) {
        if (typeof watchId.current === 'number') {
          // モックトラッキングの場合はintervalをクリア
          clearInterval(watchId.current as unknown as NodeJS.Timeout);
        } else {
          // 実際のgeolocation watchの場合
          navigator.geolocation.clearWatch(watchId.current);
        }
        watchId.current = null;
      }
      setTracking(false);
    } else {
      // トラッキングを開始
      if (!navigator.geolocation) {
        setError('お使いのブラウザはジオロケーションをサポートしていません。モックデータを使用します。');
        
        // ブラウザが位置情報をサポートしていない場合はモックデータをシミュレート
        startMockTracking();
        return;
      }
      
      setError(null);
      
      try {
        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            
            const newGeoData: GeolocationData = {
              longitude,
              latitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
              timestamp: position.timestamp
            };
            
            setGeoData(newGeoData);
            setLocationHistory(prev => [newGeoData, ...prev].slice(0, 5));
            
            if (map) {
              // マップの中心を現在地に移動
              map.panTo([longitude, latitude]);
              
              // マーカーを表示または更新
              if (markerRef.current) {
                markerRef.current.setLngLat([longitude, latitude]);
              } else {
                markerRef.current = new maplibregl.Marker({
                  color: '#3F51B5'
                })
                  .setLngLat([longitude, latitude])
                  .addTo(map);
              }
              
              // 精度サークルを更新
              updateAccuracyCircle(longitude, latitude, position.coords.accuracy);
              
              // トラッキングラインを追加/更新
              addLocationToTrack(longitude, latitude);
            }
          },
          (posError) => {
            console.error('位置情報トラッキングエラー:', {
              code: posError.code,
              message: posError.message,
              PERMISSION_DENIED: posError.PERMISSION_DENIED,
              POSITION_UNAVAILABLE: posError.POSITION_UNAVAILABLE,
              TIMEOUT: posError.TIMEOUT
            });
            
            let errorMessage = '位置情報のトラッキングに失敗しました。モックデータを使用します。';
            
            // エラーコードに基づいてメッセージを設定
            switch(posError.code) {
              case 1: // PERMISSION_DENIED
                errorMessage = '位置情報へのアクセスが拒否されました。ブラウザの設定で許可してください。モックデータを使用します。';
                break;
              case 2: // POSITION_UNAVAILABLE
                errorMessage = '現在地を取得できませんでした。デバイスのGPSが無効になっている可能性があります。モックデータを使用します。';
                break;
              case 3: // TIMEOUT
                errorMessage = '位置情報の取得がタイムアウトしました。モックデータを使用します。';
                break;
            }
            
            setError(errorMessage);
            
            // エラーが発生した場合はモックトラッキングを開始
            startMockTracking();
          },
          {
            enableHighAccuracy: true,
            timeout: 10000
          }
        );
        
        setTracking(true);
      } catch (geolocationError) {
        console.error('Geolocation API エラー:', geolocationError);
        setError('位置情報のトラッキングに失敗しました。モックデータを使用します。');
        
        // エラーが発生した場合はモックトラッキングを開始
        startMockTracking();
      }
    }
  };

  // モックトラッキングを開始する関数
  const startMockTracking = () => {
    // 最初のモックデータポイント
    const mockBaseLng = 139.7634;
    const mockBaseLat = 35.6812;
    
    let mockCount = 0;
    const mockInterval = setInterval(() => {
      mockCount++;
      
      // 前回のデータを基準に少しずれた位置を生成
      const jitter = 0.0005;
      const prevData = geoData || {
        longitude: mockBaseLng,
        latitude: mockBaseLat,
        accuracy: 15.0,
        altitude: 40.5,
        altitudeAccuracy: 10.0,
        heading: 90.0,
        speed: 5.0,
        timestamp: Date.now()
      };
      
      // 円周上を移動するようなモックデータを生成
      const angle = (mockCount * 10) * (Math.PI / 180); // 10度ずつ変化
      const radius = 0.001; // 約100mの円
      
      const mockData: GeolocationData = {
        longitude: mockBaseLng + radius * Math.cos(angle),
        latitude: mockBaseLat + radius * Math.sin(angle),
        accuracy: 10.0 + Math.random() * 5,
        altitude: prevData.altitude,
        altitudeAccuracy: prevData.altitudeAccuracy,
        heading: (angle * 180 / Math.PI) % 360, // 角度を度数法に変換
        speed: 5.0 + Math.random() * 2,
        timestamp: Date.now()
      };
      
      setGeoData(mockData);
      setLocationHistory(prev => [mockData, ...prev].slice(0, 5));
      
      if (map) {
        // マップの中心を現在地に移動
        map.panTo([mockData.longitude, mockData.latitude]);
        
        // マーカーを表示または更新
        if (markerRef.current) {
          markerRef.current.setLngLat([mockData.longitude, mockData.latitude]);
        } else {
          markerRef.current = new maplibregl.Marker({
            color: '#3F51B5'
          })
            .setLngLat([mockData.longitude, mockData.latitude])
            .addTo(map);
        }
        
        // 精度サークルを更新
        updateAccuracyCircle(mockData.longitude, mockData.latitude, mockData.accuracy);
        
        // トラッキングラインを追加/更新
        addLocationToTrack(mockData.longitude, mockData.latitude);
      }
    }, 1000); // 1秒ごとに更新
    
    watchId.current = mockInterval as unknown as number;
    setTracking(true);
  };

  const updateAccuracyCircle = (longitude: number, latitude: number, accuracy: number) => {
    if (!map) return;
    
    // 半径をメートルからキロメートルに変換
    const radiusInKm = accuracy / 1000;
    
    // 円のGeoJSONデータを作成
    const point = [longitude, latitude];
    const options = { steps: 64, units: 'kilometers' } as const;
    
    // すでに存在する場合は削除
    if (map.getSource(accuracyCircleRef.current)) {
      map.removeLayer(`${accuracyCircleRef.current}-fill`);
      map.removeLayer(`${accuracyCircleRef.current}-outline`);
      map.removeSource(accuracyCircleRef.current);
    }
    
    // 円をシミュレートするための多角形を作成
    const circle = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          Array.from({ length: 64 }, (_, i) => {
            const angle = (i / 64) * Math.PI * 2;
            const latOffset = (accuracy / 111111) * Math.sin(angle);
            const lonOffset = (accuracy / (111111 * Math.cos(latitude * (Math.PI / 180)))) * Math.cos(angle);
            return [longitude + lonOffset, latitude + latOffset];
          })
        ]
      },
      properties: {}
    };
    
    // ソースとレイヤーを追加
    map.addSource(accuracyCircleRef.current, {
      type: 'geojson',
      data: circle as any
    });
    
    map.addLayer({
      id: `${accuracyCircleRef.current}-fill`,
      type: 'fill',
      source: accuracyCircleRef.current,
      paint: {
        'fill-color': '#3F51B5',
        'fill-opacity': 0.2
      }
    });
    
    map.addLayer({
      id: `${accuracyCircleRef.current}-outline`,
      type: 'line',
      source: accuracyCircleRef.current,
      paint: {
        'line-color': '#3F51B5',
        'line-width': 2,
        'line-opacity': 0.5
      }
    });
  };

  const addLocationToTrack = (longitude: number, latitude: number) => {
    if (!map) return;
    
    const trackSourceId = 'geolocation-track';
    const trackLayerId = 'geolocation-track-layer';
    
    // ソースがなければ新規作成
    if (!map.getSource(trackSourceId)) {
      map.addSource(trackSourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [[longitude, latitude]]
          }
        }
      });
      
      map.addLayer({
        id: trackLayerId,
        type: 'line',
        source: trackSourceId,
        paint: {
          'line-color': '#3F51B5',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
    } else {
      // 既存のソースを更新
      const source = map.getSource(trackSourceId) as maplibregl.GeoJSONSource;
      const data = (source as any)._data as GeoJSON.Feature;
      
      if (data && data.geometry && data.geometry.type === 'LineString') {
        const coordinates = [...data.geometry.coordinates, [longitude, latitude]];
        
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        });
      }
    }
  };

  // コンポーネントのアンマウント時にトラッキングを停止
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        if (typeof watchId.current === 'number') {
          // モックトラッキングの場合はintervalをクリア
          clearInterval(watchId.current as unknown as NodeJS.Timeout);
        } else {
          // 実際のgeolocation watchの場合
          navigator.geolocation.clearWatch(watchId.current);
        }
        watchId.current = null;
      }
    };
  }, []);

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
            位置情報機能
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button 
                variant="contained"
                color="primary"
                onClick={getCurrentLocation}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
                sx={{ flexGrow: 1 }}
              >
                現在地を取得
              </Button>
              <Button 
                variant={tracking ? "contained" : "outlined"}
                color={tracking ? "secondary" : "primary"}
                onClick={toggleLocationTracking}
                startIcon={<LocationSearchingIcon />}
                sx={{ flexGrow: 1 }}
              >
                {tracking ? 'トラッキング停止' : 'トラッキング開始'}
              </Button>
            </Stack>
            
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            
            {geoData && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  現在の位置
                  {error && (
                    <Chip 
                      label="モックデータ" 
                      size="small" 
                      color="warning" 
                      icon={<WarningIcon />}
                    />
                  )}
                </Typography>
                
                <List dense sx={{ bgcolor: 'background.paper', border: '1px solid #eee', borderRadius: 1 }}>
                  <ListItem>
                    <ListItemText 
                      primary="緯度" 
                      secondary={geoData.latitude.toFixed(6)} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText 
                      primary="経度" 
                      secondary={geoData.longitude.toFixed(6)} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText 
                      primary="精度" 
                      secondary={`±${geoData.accuracy.toFixed(1)}m`} 
                    />
                  </ListItem>
                  {geoData.altitude !== null && (
                    <>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <HeightIcon sx={{ mr: 0.5, fontSize: 18 }} />
                              高度
                            </Box>
                          }
                          secondary={`${geoData.altitude.toFixed(1)}m (±${geoData.altitudeAccuracy?.toFixed(1) || '?'}m)`} 
                        />
                      </ListItem>
                    </>
                  )}
                  {geoData.speed !== null && (
                    <>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SpeedIcon sx={{ mr: 0.5, fontSize: 18 }} />
                              速度
                            </Box>
                          }
                          secondary={`${(geoData.speed * 3.6).toFixed(1)} km/h`} 
                        />
                      </ListItem>
                    </>
                  )}
                  {geoData.heading !== null && (
                    <>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText 
                          primary="方角" 
                          secondary={`${geoData.heading.toFixed(1)}°`} 
                        />
                      </ListItem>
                    </>
                  )}
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText 
                      primary="タイムスタンプ" 
                      secondary={new Date(geoData.timestamp).toLocaleString()} 
                    />
                  </ListItem>
                </List>
              </Box>
            )}
          </Box>
          
          {locationHistory.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                位置履歴
              </Typography>
              
              <Stack spacing={1}>
                {locationHistory.slice(1).map((data, index) => (
                  <Box 
                    key={data.timestamp} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      p: 1,
                      border: '1px solid #eee',
                      borderRadius: 1,
                      fontSize: '0.8rem'
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(data.timestamp).toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body2">
                        {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">
                        精度
                      </Typography>
                      <Typography variant="body2">
                        {data.accuracy.toFixed(1)}m
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </ControlPanel>
      </Box>
    </Layout>
  );
} 