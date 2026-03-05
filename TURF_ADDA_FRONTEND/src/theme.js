import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2BB673',      // Emerald
      light: '#E0F5EA',     // Turf Light
      dark: '#141A21',      // Turf Dark
    },
    secondary: {
      main: '#F59E0B',      // Amber Accent
    },
    background: {
      default: '#FAFAFA',   // Background
      paper: '#FFFFFF',     // Card
    },
    text: {
      primary: '#141A21',   // Foreground
      secondary: '#6B7280', // Muted Foreground
    },
    error: {
      main: '#EF4444',      // Destructive
    },
    divider: '#E5E7EB',     // Border
    action: {
      selected: '#F59E0B',  // Slot Selected
      disabledBackground: '#D4D4D4', // Slot Booked
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          transition: 'all 0.2s ease',
        },
        contained: {
          // Default shadow (you can adjust the value)
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
          '&:hover': {
            // ────────────────────────────────
            // Main fix: prevent darkening / black bg
            backgroundColor: '#2BB673 !important', // force keep original color
            boxShadow: 'none',                     // remove shadow on hover
            // Optional: very subtle feedback
            opacity: 0.94,
          },
          '&:active': {
            boxShadow: 'none',
            transform: 'translateY(1px)',
          },
        },
        containedPrimary: {
          // Ensure text is always readable
          color: '#ffffff',
          '&:hover': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;