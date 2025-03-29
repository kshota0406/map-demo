'use client';

import { ReactNode, useState, useEffect } from 'react';
import { AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, Button, Avatar, ListItemIcon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import RoomIcon from '@mui/icons-material/Room';
import RouteIcon from '@mui/icons-material/Route';
import StyleIcon from '@mui/icons-material/Style';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 260;

const menuItems = [
  { name: '基本マップ', path: '/features/basic-map', icon: <MapIcon /> },
  { name: 'マーカー', path: '/features/markers', icon: <RoomIcon /> },
  { name: 'ルート表示', path: '/features/routing', icon: <RouteIcon /> },
  { name: '地図スタイル', path: '/features/styles', icon: <StyleIcon /> },
  { name: 'ジオロケーション', path: '/features/geolocation', icon: <MyLocationIcon /> },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // ウィンドウサイズの変更を検知して、isMobileを更新
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600); // 600pxはMUIのsmブレークポイント
    };
    
    // 初期値を設定
    handleResize();
    
    // リサイズイベントの登録
    window.addEventListener('resize', handleResize);
    
    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(240,245,255,0.95))' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Avatar sx={{ 
          background: 'linear-gradient(45deg, #1976d2, #21CBF3)', 
          mr: 2,
          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
        }}>
          <MapIcon />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Map機能デモ</Typography>
      </Box>
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <Link href={item.path} key={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem disablePadding>
              <ListItemButton 
                selected={pathname === item.path}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: '10px',
                  '&.Mui-selected': {
                    background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.12), rgba(33, 203, 243, 0.12))',
                    '&:hover': {
                      background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.18), rgba(33, 203, 243, 0.18))',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: '40px',
                  color: pathname === item.path ? '#1976d2' : 'rgba(0, 0, 0, 0.6)'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.name} 
                  primaryTypographyProps={{ 
                    fontWeight: pathname === item.path ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(90deg, #1976d2, #21CBF3)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1200
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, cursor: 'pointer', fontWeight: 600 }}>
            Map 機能デモ
          </Typography>
          <Button 
            color="inherit" 
            component={Link} 
            href="/" 
            startIcon={<HomeIcon />}
            sx={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: '20px',
              px: 2,
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
              }
            }}
          >
            トップ
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              marginTop: { xs: 0, sm: '64px' },
              height: { xs: '100%', sm: 'calc(100% - 64px)' },
              borderRight: 'none',
              boxShadow: '3px 0 10px rgba(0,0,0,0.05)',
              zIndex: 1100
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '64px', // ヘッダーの高さ分だけマージンを追加
          position: 'relative' // 位置関係を明確に
        }}
      >
        <Box sx={{ flexGrow: 1, position: 'relative', height: 'calc(100vh - 64px)' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
} 