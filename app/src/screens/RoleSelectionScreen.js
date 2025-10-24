import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES, SHADOWS } from '../config/theme';
import Button from '../components/Button';

const RoleSelectionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'donor',
      icon: '🤲',
      title: t('donor'),
      description: t('donor_desc'),
    },
    {
      id: 'receiver',
      icon: '🙏',
      title: t('receiver'),
      description: t('receiver_desc'),
    },
    {
      id: 'volunteer',
      icon: '🚴',
      title: t('volunteer'),
      description: t('volunteer_desc'),
    },
  ];

  const handleContinue = () => {
    if (selectedRole === 'receiver') {
      navigation.navigate('ReceiverSetup');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('select_role')}</Text>
        <Text style={styles.subtitle}>{t('role_desc')}</Text>
      </View>

      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              selectedRole === role.id && styles.roleCardSelected,
            ]}
            onPress={() => setSelectedRole(role.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.roleIcon}>{role.icon}</Text>
            <Text style={styles.roleTitle}>{role.title}</Text>
            <Text style={styles.roleDescription}>{role.description}</Text>
            {selectedRole === role.id && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={t('continue')}
        variant="primary"
        onPress={handleContinue}
        disabled={!selectedRole}
      />

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

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
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  rolesContainer: {
    marginBottom: 40,
  },
  roleCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 2,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F5F7F0',
  },
  roleIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backText: {
    color: COLORS.primary,
    fontSize: SIZES.font,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 16,
  },
});

export default RoleSelectionScreen;
