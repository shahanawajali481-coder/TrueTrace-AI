import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen, RegisterScreen } from '../screens/AuthScreens';
import { DashboardScreen } from '../screens/DashboardScreen';
import { EmailScanScreen } from '../screens/EmailScanScreen';
import { InstagramScanScreen, FacebookScanScreen, WhatsAppScanScreen } from '../screens/SocialScanners';
import { ScanHistoryScreen } from '../screens/ScanHistoryScreen';
import { ReportDetailScreen } from '../screens/ReportDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen navigation={{ replace: () => {} }} />;
  }

  return (
    <Stack.Navigator
      initialRouteName={user ? 'Dashboard' : 'Login'}
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0f1d' },
        headerTintColor: '#f8fafc',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#050811' },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: 'TrueTrace AI Console' }}
          />
          <Stack.Screen
            name="EmailScan"
            component={EmailScanScreen}
            options={{ title: 'Email Risk Analyzer' }}
          />
          <Stack.Screen
            name="InstagramScan"
            component={InstagramScanScreen}
            options={{ title: 'Instagram Profile Check' }}
          />
          <Stack.Screen
            name="FacebookScan"
            component={FacebookScanScreen}
            options={{ title: 'Facebook Link Check' }}
          />
          <Stack.Screen
            name="WhatsAppScan"
            component={WhatsAppScanScreen}
            options={{ title: 'WhatsApp & Phone Risk' }}
          />
          <Stack.Screen
            name="ScanHistory"
            component={ScanHistoryScreen}
            options={{ title: 'Audit Scan History' }}
          />
          <Stack.Screen
            name="ReportDetail"
            component={ReportDetailScreen}
            options={{ title: 'Risk Assessment Report' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings & Network' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Network Setup' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
