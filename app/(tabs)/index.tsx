import { Image, StyleSheet, Platform, ScrollView, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { 
  MaterialCommunityIcons,
  Feather,
  MaterialIcons 
} from '@expo/vector-icons';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';

interface DeviceInfo {
  ipAddress: string | null;
  deviceType: string | null;
  osName: string | null;
  osVersion: string | null;
  model: string | null;
  totalStorage: number | null;
  freeStorage: number | null;
  location: { latitude: number; longitude: number } | null;
}

function getDeviceTypeString(deviceType: Device.DeviceType | null): string | null {
  switch (deviceType) {
    case Device.DeviceType.PHONE:
      return "PHONE";
    case Device.DeviceType.TABLET:
      return 'TABLET';
    case Device.DeviceType.DESKTOP:
      return 'DESKTOP';
    case Device.DeviceType.TV:
      return 'TV';
    case Device.DeviceType.UNKNOWN:
      return 'UNKNOWN';
    default:
      return 'NOT AVAILABLE';
  }
}

function DeviceTypeIcon({ type }: { type: string }) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#fff' : '#000';
  const size = 20;

  switch (type) {
    case 'PHONE':
      return <MaterialIcons name="smartphone" size={size} color={iconColor} />;
    case 'TABLET':
      return <MaterialIcons name="tablet" size={size} color={iconColor} />;
    case 'DESKTOP':
      return <MaterialIcons name="desktop-windows" size={size} color={iconColor} />;
    case 'TV':
      return <MaterialIcons name="tv" size={size} color={iconColor} />;
    default:
      return <MaterialIcons name="laptop" size={size} color={iconColor} />;
  }
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    ipAddress: null,
    deviceType: null,
    osName: null,
    osVersion: null,
    model: null,
    totalStorage: null,
    freeStorage: null,
    location: null
  });

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'Not available';
    return String(value);
  };

  const formatStorage = (total: number | null, free: number | null): string => {
    if (total === null || free === null) return 'Not available';
    return `${(free / 1024 / 1024 / 1024).toFixed(2)}GB free of ${(total / 1024 / 1024 / 1024).toFixed(2)}GB`;
  };

  const formatLocation = (location?: { latitude: number; longitude: number } | null): string => {
    if (!location) return 'Not available';
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  async function fetchDeviceInfo() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      let ipAddress = null;
      let totalStorage = null;
      let freeStorage = null;
      let location = null;

      try {
        ipAddress = await Network.getIpAddressAsync();
      } catch (error) {
        console.log('Failed to fetch IP address:', error);
      }

      try {
        totalStorage = await FileSystem.getTotalDiskCapacityAsync();
        freeStorage = await FileSystem.getFreeDiskStorageAsync();
      } catch (error) {
        console.log('Failed to fetch storage info:', error);
      }

      if (status === 'granted') {
        try {
          const locationResult = await Location.getCurrentPositionAsync({});
          location = locationResult ? { 
            latitude: locationResult.coords.latitude, 
            longitude: locationResult.coords.longitude 
          } : null;
        } catch (error) {
          console.log('Failed to fetch location:', error);
        }
      }

      setDeviceInfo({
        ipAddress,
        deviceType: getDeviceTypeString(Device.deviceType),
        osName: Device.osName || null,
        osVersion: Device.osVersion || null,
        model: Device.modelName || null,
        totalStorage,
        freeStorage,
        location
      });
    } catch (error) {
      console.log('Error fetching device info:', error);
    }
  }

  useEffect(() => {
    fetchDeviceInfo();
  }, []);

  const iconColor = colorScheme === 'dark' ? '#fff' : '#000';
  const iconSize = 20;

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <ThemedView style={[styles.card, colorScheme === 'dark' ? styles.cardDark : styles.cardLight]}>
        <ThemedView style={styles.header}>
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
            resizeMode="contain"
          />
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Device Inforamation</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.infoGrid}>
          <ThemedView style={styles.infoRow}>
            <ThemedView style={styles.labelContainer}>
              <DeviceTypeIcon type={deviceInfo.deviceType || 'UNKNOWN'} />
              <ThemedText type="subtitle">Device Type:</ThemedText>
            </ThemedView>
            <ThemedText>{formatValue(deviceInfo.deviceType)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoRow}>
            <ThemedView style={styles.labelContainer}>
              <MaterialIcons name="info" size={iconSize} color={iconColor} />
              <ThemedText type="subtitle">Model:</ThemedText>
            </ThemedView>
            <ThemedText>{formatValue(deviceInfo.model)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoRow}>
            <ThemedView style={styles.labelContainer}>
              <MaterialIcons name="language" size={iconSize} color={iconColor} />
              <ThemedText type="subtitle">OS:</ThemedText>
            </ThemedView>
            <ThemedText>
              {formatValue(`${deviceInfo.osName} ${deviceInfo.osVersion}`.trim())}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoRow}>
            <ThemedView style={styles.labelContainer}>
              <MaterialCommunityIcons name="console" size={iconSize} color={iconColor} />
              <ThemedText type="subtitle">IP:</ThemedText>
            </ThemedView>
            <ThemedText>{formatValue(deviceInfo.ipAddress)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoRow}>
            <ThemedView style={styles.labelContainer}>
              <MaterialIcons name="storage" size={iconSize} color={iconColor} />
              <ThemedText type="subtitle">Storage:</ThemedText>
            </ThemedView>
            <ThemedText>
              {formatStorage(deviceInfo.totalStorage, deviceInfo.freeStorage)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoRow}>
            <ThemedView style={styles.labelContainer}>
              <MaterialIcons name="location-on" size={iconSize} color={iconColor} />
              <ThemedText type="subtitle">Location:</ThemedText>
            </ThemedView>
            <ThemedText>
              {formatLocation(deviceInfo.location)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    marginBottom: 20,
    backgroundColor: '#25293c',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 12,
    justifyContent: 'center',
    minHeight: Dimensions.get('window').height - 100,
  },
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  cardLight: {
    backgroundColor: '#ffffff',
  },
  cardDark: {
    backgroundColor: '#1a1b26',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginLeft: 8,
    flexWrap: 'wrap',
  },
  reactLogo: {
    height: 40,
    width: 65,
    flexShrink: 0,
  },
  infoGrid: {
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 100,
    flexShrink: 0,
  },
  devTools: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});

