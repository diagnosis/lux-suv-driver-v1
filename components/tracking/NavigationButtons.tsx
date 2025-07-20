import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { MAP_APPS, MAP_APP_NAMES } from '@/config/tracking';

interface NavigationButtonsProps {
  navigation: {
    pickup_urls?: Record<string, string>;
    dropoff_urls?: Record<string, string>;
    directions?: Record<string, string>;
  };
  type: 'pickup' | 'dropoff' | 'directions';
  title: string;
}

export default function NavigationButtons({ navigation, type, title }: NavigationButtonsProps) {
  const getUrls = () => {
    switch (type) {
      case 'pickup':
        return navigation.pickup_urls || {};
      case 'dropoff':
        return navigation.dropoff_urls || {};
      case 'directions':
        return navigation.directions || {};
      default:
        return {};
    }
  };

  const openMapApp = async (app: string, url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'App Not Available',
          `${MAP_APP_NAMES[app]} is not installed on your device.`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open map application');
    }
  };

  const getAppIcon = (app: string) => {
    switch (app) {
      case MAP_APPS.GOOGLE_MAPS:
        return 'enviromento';
      case MAP_APPS.APPLE_MAPS:
        return 'apple1';
      case MAP_APPS.WAZE:
        return 'car';
      default:
        return 'enviromento';
    }
  };

  const urls = getUrls();
  const availableApps = Object.entries(urls);

  if (availableApps.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.buttonContainer}>
        {availableApps.map(([app, url]) => (
          <TouchableOpacity
            key={app}
            style={styles.mapButton}
            onPress={() => openMapApp(app, url)}
          >
            <AntDesign 
              name={getAppIcon(app) as any} 
              size={20} 
              color="#d6ad60" 
            />
            <Text style={styles.buttonText}>
              {MAP_APP_NAMES[app] || app}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f4ebd0',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(214, 173, 96, 0.1)',
    borderWidth: 1,
    borderColor: '#d6ad60',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  buttonText: {
    color: '#d6ad60',
    fontSize: 14,
    fontWeight: '500',
  },
});