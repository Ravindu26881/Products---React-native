import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  Image,
  Platform,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getFontFamily } from '../utils/fontUtils';
import { COLORS } from '../utils/colors';

export default function ContactSellerScreen({ navigation }) {
  const route = useRoute();
  const { product, storeId, storeName } = route.params;
  
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState('message');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Contact Seller',
      headerTitleStyle: {
        fontFamily: getFontFamily(storeId),
        fontSize: 16,
      },
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: '#fff',
    });
  }, [navigation, storeId]);

  const handleSendMessage = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    // In a real app, you would send this message to your backend
    // and notify the seller via push notification, email, or SMS
    
    Alert.alert(
      'Message Sent! 📩',
      'Your message has been sent to the seller. They will respond soon.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
    
    console.log('Message sent:', {
      productId: product._id || product.id,
      storeId: storeId,
      message: message,
      timestamp: new Date().toISOString(),
    });
  };

  const handlePhoneCall = () => {
    // In a real app, you would get the seller's phone number from your backend
    const phoneNumber = '+1234567890'; // Example phone number
    
    Alert.alert(
      'Call Seller',
      `Would you like to call ${storeName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call Now',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`);
          },
        },
      ]
    );
  };

  const handleWhatsApp = () => {
    // In a real app, you would get the seller's WhatsApp number from your backend
    const phoneNumber = '1234567890'; // Example phone number
    const prefilledMessage = `Hi! I'm interested in "${product.name}" from your store.`;
    
    const whatsappURL = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(prefilledMessage)}`;
    
    Linking.canOpenURL(whatsappURL).then((supported) => {
      if (supported) {
        Linking.openURL(whatsappURL);
      } else {
        Alert.alert('WhatsApp Not Available', 'WhatsApp is not installed on your device.');
      }
    });
  };

  const handleEmail = () => {
    // In a real app, you would get the seller's email from your backend
    const email = 'seller@example.com';
    const subject = `Inquiry about ${product.name}`;
    const body = `Hi,\n\nI'm interested in purchasing "${product.name}" from your store.\n\nPlease let me know if it's still available.\n\nThank you!`;
    
    const emailURL = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(emailURL);
  };

  const renderContactOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contact Methods</Text>
      
      <TouchableOpacity style={styles.contactOption} onPress={handlePhoneCall}>
        <View style={styles.contactOptionIcon}>
          <Text style={styles.contactOptionIconText}>📞</Text>
        </View>
        <View style={styles.contactOptionContent}>
          <Text style={styles.contactOptionTitle}>Phone Call</Text>
          <Text style={styles.contactOptionDescription}>
            Speak directly with the seller
          </Text>
        </View>
        <Text style={styles.contactOptionArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactOption} onPress={handleWhatsApp}>
        <View style={styles.contactOptionIcon}>
          <Text style={styles.contactOptionIconText}>💬</Text>
        </View>
        <View style={styles.contactOptionContent}>
          <Text style={styles.contactOptionTitle}>WhatsApp</Text>
          <Text style={styles.contactOptionDescription}>
            Chat on WhatsApp for quick responses
          </Text>
        </View>
        <Text style={styles.contactOptionArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactOption} onPress={handleEmail}>
        <View style={styles.contactOptionIcon}>
          <Text style={styles.contactOptionIconText}>📧</Text>
        </View>
        <View style={styles.contactOptionContent}>
          <Text style={styles.contactOptionTitle}>Email</Text>
          <Text style={styles.contactOptionDescription}>
            Send detailed inquiry via email
          </Text>
        </View>
        <Text style={styles.contactOptionArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMessageForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Send Message</Text>
      <Text style={styles.sectionDescription}>
        Send a message to the seller about this product
      </Text>
      
      <TextInput
        style={styles.messageInput}
        placeholder="Hi! I'm interested in this product. Is it still available?"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
      
      <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
        <Text style={styles.sendButtonText}>Send Message</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuickMessages = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Messages</Text>
      <Text style={styles.sectionDescription}>
        Tap to use these common questions
      </Text>
      
      <View style={styles.quickMessagesContainer}>
        <TouchableOpacity
          style={styles.quickMessageButton}
          onPress={() => setMessage('Is this item still available?')}
        >
          <Text style={styles.quickMessageText}>Is this available?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickMessageButton}
          onPress={() => setMessage('What is the condition of this item?')}
        >
          <Text style={styles.quickMessageText}>What's the condition?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickMessageButton}
          onPress={() => setMessage('Can you provide more photos?')}
        >
          <Text style={styles.quickMessageText}>More photos?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickMessageButton}
          onPress={() => setMessage('Is the price negotiable?')}
        >
          <Text style={styles.quickMessageText}>Price negotiable?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickMessageButton}
          onPress={() => setMessage('Can I pick this up locally?')}
        >
          <Text style={styles.quickMessageText}>Local pickup?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickMessageButton}
          onPress={() => setMessage('What are the shipping options?')}
        >
          <Text style={styles.quickMessageText}>Shipping options?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Summary */}
        <View style={styles.productSummary}>
          <Image 
            source={{ uri: product.image }} 
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Text style={styles.storeName}>from {storeName}</Text>
          </View>
        </View>

        {/* Contact Options */}
        {renderContactOptions()}
        
        {/* Quick Messages */}
        {renderQuickMessages()}
        
        {/* Message Form */}
        {renderMessageForm()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  productSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 20,
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 3,
  },
  storeName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: 10,
  },
  contactOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactOptionIconText: {
    fontSize: 20,
  },
  contactOptionContent: {
    flex: 1,
  },
  contactOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  contactOptionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  contactOptionArrow: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  quickMessagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickMessageButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  quickMessageText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    minHeight: 120,
    marginBottom: 15,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 50,
  },
});
