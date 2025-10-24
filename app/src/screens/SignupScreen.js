import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { COLORS, SIZES, SHADOWS } from '../config/theme';
import Button from '../components/Button';
import Input from '../components/Input';

const SignupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Navigate to profile setup
      navigation.navigate('ProfileSetup', { 
        firebaseUid: userCredential.user.uid,
        email: email 
      });
      
    } catch (error) {
      let errorMessage = 'Signup failed';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🍲</Text>
        <Text style={styles.title}>{t('create_account')}</Text>
        <Text style={styles.subtitle}>Join Annam Mithra community</Text>
      </View>

      <View style={styles.form}>
        <Input
          label={t('email')}
          placeholder={t('enter_email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label={t('password')}
          placeholder={t('enter_password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />

        <Input
          label={t('confirm_password')}
          placeholder={t('enter_password')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={errors.confirmPassword}
        />

        <Button
          title={t('create_account')}
          variant="primary"
          onPress={handleSignup}
          loading={loading}
          style={{ marginTop: 8 }}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('already_have_account')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>{t('login')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Welcome</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
  },
  form: {
    marginBottom: 40,
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
  backText: {
    color: COLORS.primary,
    fontSize: SIZES.font,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default SignupScreen;
