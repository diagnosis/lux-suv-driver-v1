import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';

interface LocationData {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp: string;
}

interface LiveLocationProps {
  location: LocationData;
  driverName?: string;
  bookingStatus?: string;
  estimatedArrival?: string | null;
}

const { width } = Dimensions.get('window');

export default function LiveLocation({ 
  location, 
  driverName = 'Driver',
  bookingStatus = 'En Route',
  estimatedArrival 
}: LiveLocationProps) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (location.timestamp) {
      setLastUpdate(new Date(location.timestamp));
    }
  }, [location.timestamp]);

  const formatCoordinate = (coord: number, type: 'lat' | 'lng') => {
    const direction = type === 'lat' ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(4)}° ${direction}`;
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const getSpeedColor = (speed: number) => {
    if (speed < 5) return '#ff6b6b'; // Stopped/slow - red
    if (speed < 25) return '#ffd93d'; // City driving - yellow
    return '#6bcf7f'; // Highway - green
  };

  return (
    <LinearGradient 
      colors={['rgba(214, 173, 96, 0.1)', 'rgba(244, 235, 208, 0.05)']}
      style={styles.container}
    >
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <View style={styles.statusIndicator}>
          <AntDesign name="car" size={16} color="#d6ad60" />
          <Text style={styles.statusText}>{bookingStatus}</Text>
        </View>
        <Text style={styles.driverName}>{driverName}</Text>
      </View>

      {/* Location Info */}
      <View style={styles.locationInfo}>
        <View style={styles.coordinateRow}>
          <AntDesign name="enviromento" size={16} color="#b68d40" />
          <Text style={styles.coordinateText}>
            {formatCoordinate(location.latitude, 'lat')}, {formatCoordinate(location.longitude, 'lng')}
          </Text>
        </View>

        {location.speed !== undefined && (
          <View style={styles.speedRow}>
            <AntDesign name="dashboard" size={16} color={getSpeedColor(location.speed)} />
            <Text style={[styles.speedText, { color: getSpeedColor(location.speed) }]}>
              {Math.round(location.speed)} mph
            </Text>
          </View>
        )}
      </View>

      {/* Update Info */}
      <View style={styles.updateInfo}>
        <View style={styles.lastUpdateRow}>
          <AntDesign name="clockcircle" size={14} color="#b68d40" />
          <Text style={styles.lastUpdateText}>
            Last updated {formatLastUpdate(lastUpdate)}
          </Text>
        </View>

        {estimatedArrival && (
          <View style={styles.etaRow}>
            <AntDesign name="clockcircle" size={14} color="#d6ad60" />
            <Text style={styles.etaText}>
              ETA: {estimatedArrival}
            </Text>
          </View>
        )}
      </View>

      {/* Live Indicator */}
      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d6ad60',
    padding: 20,
    margin: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#d6ad60',
    fontSize: 14,
    fontWeight: '600',
  },
  driverName: {
    color: '#f4ebd0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationInfo: {
    marginBottom: 16,
  },
  coordinateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  coordinateText: {
    color: '#f4ebd0',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  updateInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(214, 173, 96, 0.3)',
    paddingTop: 12,
    gap: 4,
  },
  lastUpdateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastUpdateText: {
    color: '#b68d40',
    fontSize: 12,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  etaText: {
    color: '#d6ad60',
    fontSize: 12,
    fontWeight: '500',
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(18, 38, 32, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6bcf7f',
  },
  liveText: {
    color: '#6bcf7f',
    fontSize: 10,
    fontWeight: 'bold',
  },
});