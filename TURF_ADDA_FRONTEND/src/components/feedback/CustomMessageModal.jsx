
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';

const CustomMessageModal = ({
  open,
  onClose,
  type = 'info',
  title = '',
  message,
  primaryButtonText = 'OK',
  onPrimaryClick,
  secondaryButtonText = '',
  onSecondaryClick,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <SuccessIcon color="success" fontSize="large" />;
      case 'error':   return <ErrorIcon color="error" fontSize="large" />;
      case 'warning': return <WarningIcon color="warning" fontSize="large" />;
      default:        return <InfoIcon color="info" fontSize="large" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return 'success.main';
      case 'error':   return 'error.main';
      case 'warning': return 'warning.main';
      default:        return 'info.main';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {getIcon()}
          {title && <Typography variant="h6" color={getColor()}>{title}</Typography>}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pt: 0 }}>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
        {secondaryButtonText && (
          <Button variant="outlined" onClick={onSecondaryClick} sx={{ minWidth: 100 }}>
            {secondaryButtonText}
          </Button>
        )}

        <Button
          variant="contained"
          color={type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'primary'}
          onClick={onPrimaryClick}
          autoFocus
          sx={{ minWidth: 100 }}
        >
          {primaryButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomMessageModal;