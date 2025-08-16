import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../utils/colors';
import { useNotification } from '../components/NotificationSystem';

export default function UserProfile() {
  const { user, isLoggedIn, isGuest, logoutUser, showLoginScreen } = useUser();
  const { showModal, showSuccess } = useNotification();

  const handleLogout = () => {
    showModal({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      type: 'warning',
      buttons: [
        { 
          text: 'Cancel', 
          style: 'cancel'
        },
        { 
          text: 'Logout',
          onPress: () => {
            logoutUser();
            showSuccess('Logged out successfully');
          }
        },
      ]
    });
  };

  const handleLoginPrompt = () => {
    showModal({
      title: 'Login',
      message: 'Would you like to login to access more features?',
      type: 'info',
      buttons: [
        { 
          text: 'Not now', 
          style: 'cancel'
        },
        { 
          text: 'Login',
          onPress: showLoginScreen
        },
      ]
    });
  };

  if (isLoggedIn && user) {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.usernameText}>{user.username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isGuest) {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.guestText}>👋 Guest User</Text>
          <Text style={styles.guestSubtext}>Login to access all features</Text>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPrompt}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  guestText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  guestSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  loginText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
