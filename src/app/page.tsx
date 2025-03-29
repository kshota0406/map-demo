'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Container, Fade, Grow } from '@mui/material';
import Link from 'next/link';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LayersIcon from '@mui/icons-material/Layers';
import NavigationIcon from '@mui/icons-material/Navigation';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ExploreIcon from '@mui/icons-material/Explore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const featureCards = [
  {
    title: 'マーカー表示',
    description: '任意の場所にマーカーを追加',
    icon: <LocationOnIcon fontSize="large" />,
    path: '/features/markers',
    color: 'linear-gradient(135deg, #f44336, #b71c1c)'
  },
  {
    title: 'ルート表示',
    description: '2点間のルート計算と表示',
    icon: <NavigationIcon fontSize="large" />,
    path: '/features/routing',
    color: 'linear-gradient(135deg, #ff9800, #e65100)'
  },
  {
    title: '地図スタイル',
    description: '様々な地図スタイルと3D表示の切り替え',
    icon: <LayersIcon fontSize="large" />,
    path: '/features/styles',
    color: 'linear-gradient(135deg, #9c27b0, #4a148c)'
  },
  {
    title: '現在地表示',
    description: 'ユーザーの現在地を地図上に表示',
    icon: <MyLocationIcon fontSize="large" />,
    path: '/features/geolocation',
    color: 'linear-gradient(135deg, #4caf50, #1b5e20)'
  }
];

// FeatureCardコンポーネント
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  index: number;
}

function FeatureCard({ title, description, icon, color, path, index }: FeatureCardProps) {
  return (
    <Box 
      sx={{ 
        width: { xs: '100%', sm: '50%', md: '33.33%' },
        display: 'flex',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Grow in={true} timeout={(index + 1) * 300}>
        <Card 
          sx={{ 
            width: 320,
            height: 380,
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            transition: 'all 0.4s ease',
            '&:hover': {
              transform: 'translateY(-10px) scale(1.02)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 1px 5px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <Link href={path} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box 
              sx={{ 
                p: 4, 
                height: 160,
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                background: color,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '30%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.1), transparent)'
                }
              }}
            >
              <Box 
                sx={{ 
                  color: 'white', 
                  transform: 'scale(1.8)',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
                }}
              >
                {icon}
              </Box>
            </Box>
            <CardContent sx={{ 
              flexGrow: 1, 
              p: 2.5,
              height: 160,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography 
                variant="h5" 
                component="h3" 
                sx={{ 
                  fontWeight: 600,
                  mb: 1.5,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {title}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                flex: 1
              }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    lineHeight: 1.7,
                    overflow: 'hidden',
                    fontSize: '0.9rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {description}
                </Typography>
              </Box>
            </CardContent>
            <Box 
              sx={{ 
                p: 2,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                borderTop: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              <Button 
                variant="text" 
                sx={{ 
                  color: '#1976d2',
                  fontWeight: 600
                }}
              >
                詳細を見る
              </Button>
            </Box>
          </Link>
        </Card>
      </Grow>
    </Box>
  );
}

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      overflow: 'hidden',
    }}>
      {/* ヒーローセクション */}
      <Box sx={{ 
        height: { xs: '90vh', md: '95vh' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url("https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Fade in={loaded} timeout={1500}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                  mb: 2,
                  color: 'white',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  letterSpacing: '-0.5px'
                }}
              >
                マップ機能デモ
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 5, 
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.9)',
                  maxWidth: '700px',
                  mx: 'auto',
                  lineHeight: 1.5,
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                MapLibreを活用した最新の地図機能を体験できる
                <br />インタラクティブなデモページ集
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/features/basic-map"
                  startIcon={<ExploreIcon />}
                  sx={{
                    background: 'linear-gradient(90deg, #1976d2, #21CBF3)',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '30px',
                    boxShadow: '0 4px 20px rgba(33, 203, 243, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 25px rgba(33, 203, 243, 0.5)',
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  デモを開始する
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
        
        {/* スクロールダウンアイコン */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 40, 
            left: '50%', 
            transform: 'translateX(-50%)',
            color: 'white',
            textAlign: 'center',
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': {
                transform: 'translateY(0) translateX(-50%)'
              },
              '40%': {
                transform: 'translateY(-20px) translateX(-50%)'
              },
              '60%': {
                transform: 'translateY(-10px) translateX(-50%)'
              }
            }
          }}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 40 }} />
          <Typography variant="body2" sx={{ fontWeight: 300 }}>スクロール</Typography>
        </Box>
      </Box>

      {/* 機能セクション */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 },
          px: 2,
          position: 'relative',
          background: 'linear-gradient(to bottom, #f9faff, #e8f1ff)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            left: 0,
            width: '100%',
            height: 100,
            background: 'linear-gradient(to bottom, transparent, #f9faff)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              mb: 2, 
              textAlign: 'center',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #1976d2, #21CBF3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            利用可能な機能
          </Typography>
          
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            mx: -2
          }}>
            {featureCards.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                color={feature.color}
                path={feature.path}
                index={index}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* フッター */}
      <Box 
        component="footer" 
        sx={{ 
          py: 6, 
          px: 2, 
          mt: 'auto',
          background: 'linear-gradient(to top, #1976d2, #21CBF3)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'url("https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'soft-light',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(25, 118, 210, 0.95)',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="body2" align="center" sx={{ fontWeight: 300 }}>
            © {new Date().getFullYear()} MapLibre Demo
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
