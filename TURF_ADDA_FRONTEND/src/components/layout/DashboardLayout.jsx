import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard,
  SportsSoccer,
  CalendarToday,
  MonetizationOn,
  Person,
  Logout,
  AddCircleOutline,
  Favorite,
  Search,
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';

const drawerWidth = 240;

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const role = user?.role;

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const playerMenu = [
    { text: 'Home', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Find Turfs', icon: <Search />, path: '/player/find-turfs' },
    { text: 'My Bookings', icon: <CalendarToday />, path: '/player/bookings' },
    { text: 'Favorites', icon: <Favorite />, path: '/player/favorites' },
    { text: 'Profile', icon: <Person />, path: '/player/profile' },
  ];

  const ownerMenu = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'My Turfs', icon: <SportsSoccer />, path: '/owner/turfs' },
    { text: 'Add Turf', icon: <AddCircleOutline />, path: '/owner/turfs/add' },
    { text: 'Bookings', icon: <CalendarToday />, path: '/owner/bookings' },
    { text: 'Revenue', icon: <MonetizationOn />, path: '/owner/revenue' },
    { text: 'Profile', icon: <Person />, path: '/owner/profile' },
  ];

  const menuItems = role === 'owner' ? ownerMenu : playerMenu;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          Turfadda {role === 'owner' ? 'Owner' : 'Player'}
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>

      <Divider />

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => {
                navigate(item.path);
                if (isMobile) handleDrawerToggle();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
            {role === 'owner' ? 'Owner Panel' : 'Player Dashboard'}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={user?.profileImage}
              sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
            >
              {user?.firstName?.[0]?.toUpperCase()}
            </Avatar>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {role?.charAt(0).toUpperCase() + role?.slice(1)}
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
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
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', md: '64px' },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
