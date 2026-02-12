
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2BB673',  // Emerald
      light: '#E0F5EA',  // Turf Light
      dark: '#141A21',  // Turf Dark
    },
    secondary: {
      main: '#F59E0B',  // Amber Accent
    },
    background: {
      default: '#FAFAFA',  // Background
      paper: '#FFFFFF',    // Card
    },
    text: {
      primary: '#141A21',  // Foreground
      secondary: '#6B7280', // Muted Foreground
    },
    error: {
      main: '#EF4444',  // Destructive
    },
    divider: '#E5E7EB',  // Border
    action: {
      selected: '#F59E0B', // Slot Selected
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