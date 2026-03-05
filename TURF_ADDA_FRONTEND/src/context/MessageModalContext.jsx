
import React, { createContext, useContext, useState } from 'react';
import CustomMessageModal from '../components/feedback/CustomMessageModal';

const MessageContext = createContext();

export const MessageModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    open: false,
    type: 'info',
    title: '',
    message: '',
    primaryText: 'OK',
    onPrimary: null,
    secondaryText: '',
    onSecondary: null,
  });

  const showMessage = ({
    type = 'info',
    title = '',
    message,
    primaryText = 'OK',
    onPrimary = () => {},
    secondaryText = '',
    onSecondary = () => {},
  }) => {
    setModalState({
      open: true,
      type,
      title,
      message,
      primaryText,
      onPrimary,
      secondaryText,
      onSecondary,
    });
  };

  const closeMessage = () => {
    setModalState((prev) => ({ ...prev, open: false }));
  };

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}
      <CustomMessageModal
        open={modalState.open}
        onClose={closeMessage}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        primaryButtonText={modalState.primaryText}
        onPrimaryClick={() => {
          modalState.onPrimary();
          closeMessage();
        }}
        secondaryButtonText={modalState.secondaryText}
        onSecondaryClick={() => {
          modalState.onSecondary();
          closeMessage();
        }}
      />
    </MessageContext.Provider>
  );
};

export const useMessageModal = () => useContext(MessageContext);