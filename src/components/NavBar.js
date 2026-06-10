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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Party List', icon: <PeopleIcon />, path: '/party-list' },
  { text: 'Sauda', icon: <TrendingUpIcon />, path: '/sauda' },
  { text: 'Invoice', icon: <ReceiptIcon />, path: '/invoice' },
  { text: 'Sales Invoice', icon: <ShoppingCartIcon />, path: '/sales-invoice' },
  { text: 'Pagga List', icon: <InventoryIcon />, path: '/pagga-list' },
  { text: 'Case Book', icon: <AccountBalanceIcon />, path: '/case-book' },
  { text: 'Case', icon: <WorkIcon />, path: '/case' },
  // { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  // { text: 'Sauda Check', icon: <SettingsIcon />, path: '/sauda-check' },
];

const reportsMenuItems = [
  { text: 'Party Ledger', icon: <BookIcon />, path: '/party-ledger' },
];

const NavBar = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

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

  const drawer = (
    <div>
      <Toolbar sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' }}>
        <Typography variant="h6" noWrap component="div" sx={{ color: '#fff', fontWeight: 700 }}>
          BR Bullion
        </Typography>
      </Toolbar>
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    color: '#fff',
                  },
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    color: '#fff',
                  },
                },
                mx: 1,
                borderRadius: 2,
                mb: 1,
              }}
            >
              <ListItemIcon sx={{ color: '#6366f1' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: '#424242', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => setReportsOpen(!reportsOpen)}
            sx={{
              '&:hover': {
                background: 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                  color: '#fff',
                },
              },
              mx: 1,
              borderRadius: 2,
              mb: 1,
            }}
          >
            <ListItemIcon sx={{ color: '#6366f1' }}>
              <ReportsIcon />
            </ListItemIcon>
            <ListItemText primary="Reports" sx={{ color: '#424242', fontWeight: 500 }} />
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
                      background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                      '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    color: '#fff',
                  },
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    color: '#fff',
                  },
                },
                pl: 4,
                mx: 1,
                borderRadius: 2,
                mb: 1,
              }}
                >
                  <ListItemIcon sx={{ color: '#6366f1' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} sx={{ color: '#424242', fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
        <ListItem disablePadding sx={{ mt: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              '&:hover': {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                  color: '#fff',
                },
              },
              mx: 1,
              borderRadius: 2,
            }}
          >
            <ListItemIcon sx={{ color: '#ef4444' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ color: '#424242', fontWeight: 500 }} />
          </ListItemButton>
        </ListItem>
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
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
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
            onClick={handleLogout}
            sx={{ 
              '&:hover': { 
                background: 'rgba(255, 255, 255, 0.1)' 
              }
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
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
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
