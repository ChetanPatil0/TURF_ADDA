import { Box, Grid, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

const AuthLayout = ({ title, children, showLogo = true }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
          bgcolor: 'background.paper',
      }}
    >
      <Box sx={{  display: { xs: 'block', md: 'none' }, textAlign: 'center', pt: 5, pb: 4 }}>
        {showLogo && (
          <Typography variant="h3" fontWeight={800} color="primary.main">
            Turfadda
          </Typography>
        )}
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
          Play More, Worry Less
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 0, lg: 5 },
          py: { xs: 0, md: 4 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '90%',
            minWidth: { md: 'min(1400px, 85%)' },
            bgcolor: 'background.paper',
            borderRadius: 3,
            // boxShadow: 8,
            overflow: 'hidden',
            mx: 'auto',
          }}
        >
          <Grid container sx={{ height: { md: 'auto', lg: 'min-content' } }}>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: { xs: 'none', md: 'block' },
                bgcolor: 'primary.light',
                p: { md: 6, lg: 7, xl: 8 },
                width: { md: '50%' },
                boxSizing: 'border-box',
              }}
            >
              <Box sx={{ maxWidth: 480, mx: 'auto' }}>
                {showLogo && (
                  <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 5 }}>
                    Turfadda
                  </Typography>
                )}

                <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                  Play More, Worry Less
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  India's fastest-growing platform for booking turfs and managing grounds
                </Typography>

                <List disablePadding>
                  {[
                    'Discover nearby turfs in seconds',
                    'Check live availability & book instantly',
                    'Set your own prices and slots as an owner',
                    'Simple OTP login + Google sign-in',
                    'Safe payments, instant confirmations',
                  ].map((text, i) => (
                    <ListItem key={i} disableGutters sx={{ py: 1.2 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CheckCircleOutlineIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItem>
                  ))}

                  <ListItem disableGutters sx={{ mt: 4 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <SportsSoccerIcon color="secondary" fontSize="large" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Be part of the fastest growing turf community in India"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                </List>
              </Box>

             
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: { xs: 3, sm: 6, md: 6, lg: 7, xl: 8 },
                width: { md: '50%' },
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {title && (
                <Typography variant="h5" fontWeight={700} align="center" sx={{ mb: 4 }}>
                  {title}
                </Typography>
              )}

              {children}

              <Box sx={{ mt: 4, textAlign: 'center', display: { xs: 'block', md: 'none' } }}>
                <Typography variant="body2" color="text.secondary">
                  Support • Privacy Policy
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;