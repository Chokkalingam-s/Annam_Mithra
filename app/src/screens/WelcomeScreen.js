import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES, SHADOWS } from '../config/theme';
import Button from '../components/Button';
import Logo from '../components/Logo';

const WelcomeScreen = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Logo size={100} />
        <Text style={styles.title}>{t('app_name')}</Text>
        <Text style={styles.subtitle}>{t('tagline')}</Text>
      </View>

      <View style={styles.features}>
        <FeatureCard
          icon="🤝"
          title="Eliminate Food Waste"
          description="Connect surplus food with those who need it most"
        />
        <FeatureCard
          icon="🗺️"
          title="Hyperlocal Network"
          description="Find donations within your neighborhood"
        />
        <FeatureCard
          icon="🏆"
          title="Earn Badges"
          description="Get recognized for your contributions"
        />
      </View>

      <View style={styles.actions}>
        <Button
          title={t('login')}
          variant="primary"
          onPress={() => navigation.navigate('Login')}
        />
        <Button
          title={t('signup')}
          variant="outline"
          onPress={() => navigation.navigate('RoleSelection')}
          style={{ marginTop: 16 }}
        />
      </View>

      <Text style={styles.footer}>By continuing, you agree to our Terms & Privacy Policy</Text>
    </ScrollView>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <View style={styles.featureCard}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDesc}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding * 2,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: SIZES.large,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  features: {
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  actions: {
    marginBottom: 24,
  },
  footer: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
