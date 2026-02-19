import React from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { PetFormScreen } from '../screens/pets/PetFormScreen';
import { PetDashboardScreen } from '../screens/pets/PetDashboardScreen';
import { FeedingListScreen } from '../screens/feeding/FeedingListScreen';
import { FeedingFormScreen } from '../screens/feeding/FeedingFormScreen';
import { WaterListScreen } from '../screens/water/WaterListScreen';
import { WaterFormScreen } from '../screens/water/WaterFormScreen';
import { VaccineListScreen } from '../screens/vaccines/VaccineListScreen';
import { VaccineFormScreen } from '../screens/vaccines/VaccineFormScreen';
import { MedicationListScreen } from '../screens/medications/MedicationListScreen';
import { MedicationFormScreen } from '../screens/medications/MedicationFormScreen';
import { EventListScreen } from '../screens/events/EventListScreen';
import { EventFormScreen } from '../screens/events/EventFormScreen';
import { SymptomListScreen } from '../screens/symptoms/SymptomListScreen';
import { SymptomFormScreen } from '../screens/symptoms/SymptomFormScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

// On web (GitHub Pages), the app is served under /PWellTrack/.
// A linking config ensures React Navigation correctly interprets the URL
// and doesn't get confused by the base path.
const linking: LinkingOptions<{}> = {
  prefixes: [
    // production Netlify URL
    'https://pwelltrack.netlify.app',
    // production GitHub Pages URL
    'https://pinkoffense.github.io/PWellTrack',
    // localhost for development
    'http://localhost:8081',
  ],
  config: {
    screens: {
      Home: '',
      PetForm: 'pet-form',
      PetDashboard: 'pet/:petId',
      FeedingList: 'feeding',
      FeedingForm: 'feeding/new',
      WaterList: 'water',
      WaterForm: 'water/new',
      VaccineList: 'vaccines',
      VaccineForm: 'vaccines/new',
      MedicationList: 'medications',
      MedicationForm: 'medications/new',
      EventList: 'events',
      EventForm: 'events/new',
      SymptomList: 'symptoms',
      SymptomForm: 'symptoms/new',
    },
  },
};

function MainStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="PetForm" component={PetFormScreen} options={{ title: t('nav.pet') }} />
      <Stack.Screen
        name="PetDashboard"
        component={PetDashboardScreen}
        options={({ route }: any) => ({ title: route.params?.petName ?? t('nav.pet') })}
      />
      {/* Feeding */}
      <Stack.Screen name="FeedingList" component={FeedingListScreen} options={{ title: t('nav.feeding') }} />
      <Stack.Screen name="FeedingForm" component={FeedingFormScreen} options={{ title: t('nav.addFeeding') }} />
      {/* Water */}
      <Stack.Screen name="WaterList" component={WaterListScreen} options={{ title: t('nav.water') }} />
      <Stack.Screen name="WaterForm" component={WaterFormScreen} options={{ title: t('nav.addWater') }} />
      {/* Vaccines */}
      <Stack.Screen name="VaccineList" component={VaccineListScreen} options={{ title: t('nav.vaccines') }} />
      <Stack.Screen name="VaccineForm" component={VaccineFormScreen} options={{ title: t('nav.addVaccine') }} />
      {/* Medications */}
      <Stack.Screen name="MedicationList" component={MedicationListScreen} options={{ title: t('nav.medications') }} />
      <Stack.Screen name="MedicationForm" component={MedicationFormScreen} options={{ title: t('nav.addMedication') }} />
      {/* Events */}
      <Stack.Screen name="EventList" component={EventListScreen} options={{ title: t('nav.events') }} />
      <Stack.Screen name="EventForm" component={EventFormScreen} options={{ title: t('nav.addEvent') }} />
      {/* Symptoms */}
      <Stack.Screen name="SymptomList" component={SymptomListScreen} options={{ title: t('nav.symptoms') }} />
      <Stack.Screen name="SymptomForm" component={SymptomFormScreen} options={{ title: t('nav.addSymptom') }} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={Platform.OS === 'web' ? linking : undefined}>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
