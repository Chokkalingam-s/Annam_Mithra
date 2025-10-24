import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES, SHADOWS } from '../config/theme';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Navigation will happen automatically via AuthContext
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🍲</Text>
        <Text style={styles.title}>{t('welcome')}</Text>
        <Text style={styles.subtitle}>{t('welcome_desc')}</Text>
      </View>

      <View style={styles.form}>
        <Input
          label={t('phone_number')}
          placeholder="+91 9876543210"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        
        <Button
          title={t('send_otp')}
          variant="primary"
          onPress={() => Alert.alert('Coming Soon', 'Phone authentication will be available in production build')}
          disabled
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('or')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title={t('google_signin')}
          variant="outline"
          onPress={handleGoogleSignIn}
          loading={loading}
        />
      </View>
      <View style={styles.footer}>
  <Text style={styles.footerText}>{t('dont_have_account')} </Text>
  <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
    <Text style={styles.linkText}>{t('signup')}</Text>
  </TouchableOpacity>
</View>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Welcome</Text>
      </TouchableOpacity>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding * 2,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  form: {
    marginBottom: 40,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.textLight,
    fontSize: SIZES.font,
  },
  backText: {
    color: COLORS.primary,
    fontSize: SIZES.font,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: 24,
},
footerText: {
  fontSize: SIZES.font,
  color: COLORS.textLight,
},
linkText: {
  fontSize: SIZES.font,
  color: COLORS.primary,
  fontWeight: '600',
},
});

export default LoginScreen;
