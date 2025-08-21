import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { COLORS } from '../utils/colors';

export default function PWAInstallModal() {
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== 'web') return;

    console.log('🔍 PWA Modal: Setting up install prompt detection...');

    const handleBeforeInstallPrompt = (e) => {
      console.log('✅ PWA Modal: beforeinstallprompt event fired!', e);
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      // Show our custom modal immediately when event fires
      setShowModal(true);
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA was installed successfully');
      setShowModal(false);
      setDeferredPrompt(null);
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('ℹ️ PWA Modal: App already installed, skipping modal');
      return;
    }

    // Check if user already dismissed
    if (localStorage.getItem('pwa-install-dismissed')) {
      console.log('ℹ️ PWA Modal: User previously dismissed, skipping modal');
      return;
    }

    // Wait longer for beforeinstallprompt, then show fallback
    const timer = setTimeout(() => {
      if (!deferredPrompt && !showModal) {
        console.log('⚠️ PWA Modal: beforeinstallprompt not fired, showing fallback modal');
        setShowModal(true);
      }
    }, 5000); // Wait 5 seconds for the native event

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [showModal]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null);
    } else {
      // Fallback: Show manual installation instructions
      showManualInstallInstructions();
    }
    
    setShowModal(false);
  };

  const showManualInstallInstructions = () => {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    
    let instructions = '';
    if (isChrome) {
      instructions = 'Click the menu (⋮) in your browser, then select "Install Bazario" or "Add to Home Screen"';
    } else if (isSafari) {
      instructions = 'Tap the Share button (□↗) at the bottom of your browser, then select "Add to Home Screen"';
    } else {
      instructions = 'Look for "Install" or "Add to Home Screen" option in your browser menu';
    }
    
    alert(`To install Bazario on your device:\n\n${instructions}`);
  };

  const handleDismiss = () => {
    setShowModal(false);
    // Remember that user dismissed it
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleLater = () => {
    setShowModal(false);
    // Don't permanently dismiss, just close for now
  };

  if (Platform.OS !== 'web' || !showModal) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showModal}
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../assets/icon-bw.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.title}>Install Bazario</Text>
          
          <Text style={styles.description}>
            Install Bazario on your device for quick access and a better experience.
            It feels like a native app!
          </Text>
          
          <View style={styles.benefits}>
            <Text style={styles.benefitItem}>✓ Quick access from your home screen</Text>
            <Text style={styles.benefitItem}>✓ No app store needed</Text>
            <Text style={styles.benefitItem}>✓ Faster loading</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.installButton} onPress={handleInstallClick}>
              <Text style={styles.installButtonText}>Install Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.laterButton} onPress={handleLater}>
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
              <Text style={styles.dismissButtonText}>Don't Ask Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.appBackground,
    borderRadius: 20,
    padding: 30,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  benefits: {
    alignSelf: 'stretch',
    marginBottom: 30,
  },
  benefitItem: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'left',
  },
  buttonContainer: {
    alignSelf: 'stretch',
    gap: 12,
  },
  installButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  installButtonText: {
    color: COLORS.textOnBlack,
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  laterButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
