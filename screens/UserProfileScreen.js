import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import AuthAPI from '../services/authAPI';
import { useNotification } from '../components/NotificationSystem';
import { COLORS } from '../utils/colors';
import StorageService from '../utils/storage';
import {fetchProductById} from "../data/products";

export default function UserProfileScreen({ navigation }) {
  const { user, logoutUser } = useUser();
  const { showModal, showSuccess } = useNotification();
  const [userOrders, setUserOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    loadUserOrders();
  }, []);

  const loadUserOrders = async () => {
    setLoading(true)
    try {
      const response = await AuthAPI.getUserOrders(user._id)
      const enriched = await Promise.all(
          response.data.map(async (order) => {
            // Enrich each product inside the order
            const enrichedProducts = await Promise.all(
                order.products.map(async (product) => {
                  const productDetails = await fetchProductById(
                      order.storeId._id,
                      product.productId._id
                  );

                  return {
                    ...product,
                    productDetails,
                  };
                })
            );
            return {
              orderId: order.orderId,
              status: order.status,
              createdAt: order.createdAt,
              store: order.storeId,
              user: order.userId,
              products: enrichedProducts,
            };
          })
      );

      setUserOrders(enriched);
      console.log('User orders loaded:', enriched);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error loading user orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserOrders();
    setRefreshing(false);
  };

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
            navigation.navigate('Home');
          }
        },
      ]
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return COLORS.success;
      case 'Processing':
        return COLORS.secondary;
      case 'Shipped':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderUserDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Details</Text>
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          <Text style={styles.joinDate}>
            Member since {user?.joinDate || 'January 2024'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderOrdersSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {userOrders.length === 0 ? (
        <View style={styles.emptyOrdersContainer}>
          <Text style={styles.emptyOrdersText}>No orders yet</Text>
          <Text style={styles.emptyOrdersSubtext}>Start shopping to see your orders here</Text>
        </View>
      ) : (
        userOrders.slice(0, 3).map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderCard}>

            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order #{order.orderId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {order.status}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            <Text style={styles.orderStore}>{order.store.name}</Text>
            <View style={styles.orderFooter}>
              {order.products.map((p, index) => (
                  <View key={index} style={styles.productRow}>
                    <Text style={styles.orderItems}>
                      {p.productDetails.name} × {p.quantity}
                    </Text>
                    <Text style={styles.orderTotal}>
                      ${p.productDetails.price}
                    </Text>
                  </View>
              ))}
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Actions</Text>
      
      <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
        <Text style={styles.actionButtonText}>Edit Profile</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
        <Text style={styles.actionButtonText}>Order History</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
        <Text style={styles.actionButtonText}>Settings</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
        <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading User Profile...</Text>
        </View>
    );
  } else {
    return (
        <SafeAreaView style={styles.container}>
          <ScrollView
              style={styles.scrollView}
              refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[COLORS.primary]}
                    tintColor={COLORS.primary}
                />
              }
          >
            {renderUserDetails()}
            {renderOrdersSection()}
            {renderActions()}
          </ScrollView>
        </SafeAreaView>
    );
  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textInverse,
  },
  section: {
    margin: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  userCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: COLORS.textOnPrimary,
    fontSize: 24,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyOrdersContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOrdersText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptyOrdersSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  orderStore: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: COLORS.error + '10',
    borderColor: COLORS.error + '30',
    borderWidth: 1,
  },
  logoutButtonText: {
    color: COLORS.error,
    fontWeight: '600',
  },
});
