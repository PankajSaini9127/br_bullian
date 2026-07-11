import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  Logout as LogoutIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Assessment as ReportsIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Book as BookIcon,
  AccountBalance as AccountBalanceIcon,
  Work as WorkIcon,
  NoteAdd as NoteAddIcon,
  LocalShipping as LocalShippingIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  FactCheck as FactCheckIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { gradients } from '../theme';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Party List', icon: <PeopleIcon />, path: '/party-list' },
  { text: 'Sauda', icon: <TrendingUpIcon />, path: '/sauda' },
  { text: 'Pagga List', icon: <InventoryIcon />, path: '/pagga-list' },
  { text: 'Case Book', icon: <AccountBalanceIcon />, path: '/case-book' },
  { text: 'Case', icon: <WorkIcon />, path: '/case' },
  { text: 'Credit/Debit Note', icon: <NoteAddIcon />, path: '/credit-debit-note' },
  { text: 'Stock Verification', icon: <FactCheckIcon />, path: '/stock-verification' },
  { text: 'Metal Palta', icon: <SwapHorizIcon />, path: '/metal-palta' },
  // { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  // { text: 'Sauda Check', icon: <SettingsIcon />, path: '/sauda-check' },
];

const deliveryMenuItems = [
  { text: 'Purchase Invoice', icon: <ReceiptIcon />, path: '/invoice' },
  { text: 'Sales Invoice', icon: <ShoppingCartIcon />, path: '/sales-invoice' },
];

const reportsMenuItems = [
  { text: 'Party Ledger', icon: <BookIcon />, path: '/party-ledger' },
];

const NavBar = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { mode, toggleMode, modeColors: mc } = useThemeMode();
  const isSuperAdmin = user?.role === 'admin';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const drawer = (
    <div>
      <Toolbar sx={{ background: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : gradients.primary, borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : 'none' }}>
        <Typography variant="h6" noWrap component="div" sx={{ color: '#fff', fontWeight: 700 }}>
          BR Bullion
        </Typography>
      </Toolbar>
      <List sx={{ mt: 2 }}>
        {menuItems.slice(0, 2).map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  background: mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : gradients.primary,
                  backdropFilter: mode === 'dark' ? 'blur(8px)' : 'none',
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    color: mode === 'dark' ? '#818cf8' : '#fff',
                  },
                },
                '&:hover': {
                  background: mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : gradients.primaryLight,
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    color: mode === 'dark' ? '#818cf8' : '#fff',
                  },
                },
                mx: 1,
                borderRadius: 2,
                mb: 1,
              }}
            >
              <ListItemIcon sx={{ color: mc.iconColor }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: mc.text.listItem, fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => setDeliveryOpen(!deliveryOpen)}
            sx={{
              '&:hover': {
                background: mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : gradients.primaryLight,
                '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                  color: mode === 'dark' ? '#818cf8' : '#fff',
                },
              },
              mx: 1,
              borderRadius: 2,
              mb: 1,
            }}
          >
            <ListItemIcon sx={{ color: mc.iconColor }}>
              <LocalShippingIcon />
            </ListItemIcon>
            <ListItemText primary="Delivery" sx={{ color: mc.text.listItem, fontWeight: 500 }} />
            {deliveryOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
        </ListItem>
        <Collapse in={deliveryOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {deliveryMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    '&.Mui-selected': {
                      background: mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : gradients.primary,
                      backdropFilter: mode === 'dark' ? 'blur(8px)' : 'none',
                      '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                        color: mode === 'dark' ? '#818cf8' : '#fff',
                      },
                    },
                    '&:hover': {
                      background: mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : gradients.primaryLight,
                      '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                        color: mode === 'dark' ? '#818cf8' : '#fff',
                      },
                    },
                    pl: 4,
                    mx: 1,
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemIcon sx={{ color: mc.iconColor }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} sx={{ color: mc.text.listItem, fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
        {menuItems.slice(2).map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  background: mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : gradients.primary,
                  backdropFilter: mode === 'dark' ? 'blur(8px)' : 'none',
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    color: mode === 'dark' ? '#818cf8' : '#fff',
                  },
                },
                '&:hover': {
                  background: mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : gradients.primaryLight,
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    color: mode === 'dark' ? '#818cf8' : '#fff',
                  },
                },
                mx: 1,
                borderRadius: 2,
                mb: 1,
              }}
            >
              <ListItemIcon sx={{ color: mc.iconColor }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: mc.text.listItem, fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => setReportsOpen(!reportsOpen)}
            sx={{
              '&:hover': {
                background: mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : gradients.primaryLight,
                '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                  color: mode === 'dark' ? '#818cf8' : '#fff',
                },
              },
              mx: 1,
              borderRadius: 2,
              mb: 1,
            }}
          >
            <ListItemIcon sx={{ color: mc.iconColor }}>
              <ReportsIcon />
            </ListItemIcon>
            <ListItemText primary="Reports" sx={{ color: mc.text.listItem, fontWeight: 500 }} />
            {reportsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
        </ListItem>
        <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {reportsMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    '&.Mui-selected': {
                      background: mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : gradients.primary,
                      backdropFilter: mode === 'dark' ? 'blur(8px)' : 'none',
                      '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    color: mode === 'dark' ? '#818cf8' : '#fff',
                  },
                },
                '&:hover': {
                  background: mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : gradients.primaryLight,
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    color: mode === 'dark' ? '#818cf8' : '#fff',
                  },
                },
                pl: 4,
                mx: 1,
                borderRadius: 2,
                mb: 1,
              }}
                >
                  <ListItemIcon sx={{ color: mc.iconColor }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} sx={{ color: mc.text.listItem, fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: mode === 'dark' ? 'rgba(15, 15, 26, 0.8)' : gradients.primary,
          backdropFilter: mode === 'dark' ? 'blur(12px)' : 'none',
          borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
          boxShadow: mode === 'dark' ? 'none' : '0 4px 20px rgba(99, 102, 241, 0.3)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            BR Bullion Management
          </Typography>
          <IconButton
            color="inherit"
            onClick={toggleMode}
            title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            sx={{
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleProfile}
            title="User Profile"
            sx={{
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <PersonIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleLogout}
            title="Logout"
            sx={{
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: mc.background.sidebar,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, md: 8 },
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default NavBar;
