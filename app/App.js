import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import './src/config/i18n';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from './src/config/theme';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
const Stack = createStackNavigator();

function Navigation() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      {!userProfile ? (
        // Auth screens
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
<Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        </>
      ) : (
        // Main app screens (we'll add these next)
        <>
          <Stack.Screen name="Home" component={WelcomeScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
