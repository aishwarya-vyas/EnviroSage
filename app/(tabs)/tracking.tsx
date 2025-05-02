import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, BackHandler } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '@/config';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from "@react-navigation/native"; // for React Navigation


interface Bin {
  id: number;
  actualFullness: number;
  predictedFullness: number;
  latitude: string;
  longitude: string;
  date: string;
  priority: number;
  location: string;
}


const Track = () => {
  const [searchId, setSearchId] = useState('');
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();
  const [bins, setBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation()

  const fetchBins = async () => {
    try {
      setIsLoading(true);

      const binsCollectionRef = collection(db, 'prediction');
      const binsSnapshot = await getDocs(binsCollectionRef);

      const binsList: Bin[] = binsSnapshot.docs.map((doc) => ({
        id: Number(doc.data().id),
        actualFullness: doc.data().actualFullness,
        predictedFullness: doc.data().predictedFullness,
        latitude: doc.data().latitude,
        longitude: doc.data().longitude,
        date: doc.data().date,
        priority: doc.data().priority,
        location: doc.data().location
      }));

      binsList.sort((a, b) => b.priority - a.priority);

      setBins(binsList);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching bins:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBins(); // Call fetchBins on component mount
  }, []);

  const filteredBins = bins.filter(bin => bin.id.toString().includes(searchId));

  const getStatusColor = (actualFullness: number) => {
    if (actualFullness === 0 || actualFullness < 4) return 'green';
    if (actualFullness >= 4 && actualFullness <= 7) return 'yellow';
    if (actualFullness > 7) return 'red';
    return 'pink'; // fallback color if somehow undefined
  };

  const handleBinClick = (bin: Bin) => {
    setSelectedBin(bin);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedBin(null);
  };


  const handleSeeMore = () => {
    closeModal();
    if (selectedBin) {
      router.push({
        pathname: "/bin/[id]",
        params: { id: selectedBin.id.toString() }
      });
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const user = await AsyncStorage.getItem('user');
      if (!user) {
        router.replace('/login'); //

      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear(); // Clear AsyncStorage on logout
      router.replace("/login"); // Navigate to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search and Logout Section */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="#000" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Bin ID"
          placeholderTextColor="#ccc"
          value={searchId}
          onChangeText={setSearchId}
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Bin List */}
      <FlatList
        data={filteredBins}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleBinClick(item)}>
            <View style={styles.binContainer}>
              <View style={styles.binInfo}>
                <FontAwesome name="trash" size={30} />
                <Text style={styles.binName}>Bin {item.id}</Text>
              </View>
              <View
                style={[
                  styles.statusLine,
                  {
                    backgroundColor: getStatusColor(item.actualFullness),
                    width: item.actualFullness === 0 ? 10 : `${item.actualFullness * 10}%`,
                  },
                ]}
              />
              <View style={styles.predictedContainer}>
                <Text style={styles.predictedText}>Actual Fullness: {item.actualFullness * 10}%</Text>
                <Text style={styles.predictedText}>Predictions for Tomorrow: {item.predictedFullness * 10}%</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Map View */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -37.8995,
          longitude: 144.65,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {bins.map((bin) => (
          <Marker
            key={bin.id}
            coordinate={{
              latitude: Number(bin.latitude),
              longitude: Number(bin.longitude),
            }}
            title={`Bin ${bin.id}`}
            description={`Status: ${getStatusColor(bin.actualFullness)}`}
            pinColor={getStatusColor(bin.actualFullness)}
          />
        ))}
      </MapView>

      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedBin && (
              <>
                <Text style={styles.modalTitle}>Bin {selectedBin.id}</Text>
                {/* <View style={styles.modalRow}>
                  <FontAwesome name="circle" size={18} color="gray" />
                  <Text style={styles.modalText}>Fullness: {Math.round(selectedBin.actualFullness * 100)}%</Text>
                </View> */}
                <View style={styles.modalRow}>
                  <FontAwesome name="exclamation-circle" size={18} color="gray" />
                  <Text style={styles.modalText}>Priority: {selectedBin.priority}</Text>
                </View>
                <View style={styles.modalRow}>
                  <FontAwesome name="map-marker" size={18} color="gray" />
                  <Text style={styles.modalText}>Location: {selectedBin.location} </Text>
                </View>
                <View style={styles.modalRow}>
                  <FontAwesome name="calendar" size={18} color="gray" />
                  <Text style={styles.modalText}>Date: {selectedBin.date}</Text>
                </View>
                {/* See More Button */}
                {/* <TouchableOpacity style={styles.seeMoreButton} onPress={handleSeeMore}>
                  <Text style={styles.seeMoreButtonText}>See More</Text>
                </TouchableOpacity> */}

                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  seeMoreButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
  },
  seeMoreButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'space-between',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  binContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  binInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  binName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  statusLine: {
    height: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  predictedContainer: {
    marginTop: 10,
  },
  predictedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  map: {
    height: 150,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Track;
