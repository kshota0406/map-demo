'use client';

import { useState, ReactNode, useEffect } from 'react';
import { 
  Box, 
  Drawer,
  Fab,
  Tooltip,
  IconButton,
  Typography,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';

interface ControlPanelProps {
  children: ReactNode;
  title?: string;
  defaultOpen?: boolean;
  width?: number | string;
}

export default function ControlPanel({ 
  children, 
  defaultOpen = true,
  width = 350,
  title
}: ControlPanelProps) {
  const [panelOpen, setPanelOpen] = useState(defaultOpen);
  const [isCompact, setIsCompact] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    // ウィンドウサイズの変更を検知して、isCompactを更新
    const handleResize = () => {
      setIsCompact(window.innerWidth < 600);
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

  return (
    <>      
      {/* パネル表示切り替えボタン */}
      <Tooltip title={panelOpen ? "パネルを閉じる" : "パネルを開く"} placement="left">
        <Fab 
          color="primary" 
          size="medium" 
          onClick={() => setPanelOpen(!panelOpen)}
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            zIndex: 11,
            display: panelOpen ? 'none' : 'flex',
            background: 'linear-gradient(45deg, #1976d2, #21CBF3)',
            boxShadow: '0 3px 10px rgba(33, 203, 243, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1565c0, #0cb8e0)',
            }
          }}
        >
          <TuneIcon />
        </Fab>
      </Tooltip>
      
      {/* 操作パネル */}
      <Drawer
        variant="persistent"
        anchor={isCompact ? "bottom" : "right"}
        open={panelOpen}
        PaperProps={{
          sx: { 
            width: isCompact ? '100%' : width, 
            maxWidth: '100%',
            pt: 0,
            pb: 2,
            px: isCompact ? 2 : 3,
            top: isCompact ? 'auto' : '64px',
            bottom: isCompact ? 0 : 'auto',
            height: 'auto',
            maxHeight: isCompact ? '50vh' : 'calc(100vh - 64px)',
            borderRadius: isCompact ? '16px 16px 0 0' : '16px 0 0 16px',
            margin: isCompact ? 0 : 2,
            boxShadow: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.5)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
            overflowY: 'auto',
            zIndex: 10
          }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            pt: 2,
            pb: 1,
            px: 1,
            zIndex: 1,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
          }}
        >
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
          )}
          <IconButton 
            size="small" 
            onClick={() => setPanelOpen(false)}
            sx={{
              ml: 'auto',
              color: theme.palette.grey[700],
              background: 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      </Drawer>
    </>
  );
} 