import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

interface Bin {
  id: number;
  name: string;
  fullness: number;
  timeLeft: string;
  location: {
    latitude: number;
    longitude: number;
  };
  lastCollectionTime: string;
  predictedFillTime: string;
}

const Tracking = () => {
  const [searchId, setSearchId] = useState('');
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);  
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [bins, setBins] = useState<Bin[]>([ 
    { id: 1, name: 'Bin 1', fullness: 0.2, timeLeft: '1hr 20min', location: { latitude: 19.0760, longitude: 72.8777 }, lastCollectionTime: '02/03/2025 10:00 AM', predictedFillTime: '1hr 30min' },
    { id: 2, name: 'Bin 2', fullness: 0.8, timeLeft: '30min', location: { latitude: 19.2183, longitude: 72.9783 }, lastCollectionTime: '02/03/2025 11:30 AM', predictedFillTime: '10min' },
    { id: 3, name: 'Bin 3', fullness: 0.5, timeLeft: '45min', location: { latitude: 19.1400, longitude: 72.8340 }, lastCollectionTime: '02/03/2025 12:00 PM', predictedFillTime: '50min' },
  ]);

  const filteredBins = bins.filter(bin => bin.id.toString().includes(searchId));

  const getStatusColor = (fullness: number) => {
    if (fullness < 0.4) return 'green';
    if (fullness >= 0.4 && fullness < 0.6) return 'yellow';
    return 'red';
  };

  const handleBinClick = (bin: Bin) => {
    setSelectedBin(bin);  
    setIsModalVisible(true);  
  };

  const closeModal = () => {
    setIsModalVisible(false);  
    setSelectedBin(null);  
  };

  return (
    <View style={styles.container}>
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
      </View>
      
      {/* FlatList of bins */}
      <FlatList
        data={filteredBins}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleBinClick(item)}>
            <View style={styles.binContainer}>
              <View style={styles.binInfo}>
                <FontAwesome name="trash" size={30} />
                <Text style={styles.binName}>{item.name}</Text>
              </View>
              <View
                style={[
                  styles.statusLine,
                  { backgroundColor: getStatusColor(item.fullness), width: `${item.fullness * 100}%` },
                ]}
              />
              <View style={styles.predictedContainer}>
                <Text style={styles.predictedText}>Predicted Fill Time: {item.predictedFillTime}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false} 
      />

      {/* MapView showing the bins */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 19.0760, // Default location
          longitude: 72.8777, 
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {bins.map((bin) => (
          <Marker
            key={bin.id}
            coordinate={{
              latitude: bin.location.latitude, // Correct latitude
              longitude: bin.location.longitude, // Correct longitude
            }}
            title={bin.name}
            description={`Status: ${getStatusColor(bin.fullness)}`}
            pinColor={getStatusColor(bin.fullness)}
          />
        ))}
      </MapView>

      {/* Modal for Bin Details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedBin && (
              <>
                <Text style={styles.modalTitle}>{selectedBin.name}</Text>
                <View style={styles.modalRow}>
                  <FontAwesome name="circle" size={18} color="gray" />
                  <Text style={styles.modalText}>Fullness: {Math.round(selectedBin.fullness * 100)}%</Text>
                </View>

                <View style={styles.modalRow}>
                  <FontAwesome name="clock-o" size={18} color="gray" />
                  <Text style={styles.modalText}>Time Left: {selectedBin.timeLeft}</Text>
                </View>

                <View style={styles.modalRow}>
                  <FontAwesome name="map-marker" size={18} color="gray" />
                  <Text style={styles.modalText}>Location: {selectedBin.location.latitude}, {selectedBin.location.longitude}</Text>
                </View>

                <View style={styles.modalRow}>
                  <FontAwesome name="calendar" size={18} color="gray" />
                  <Text style={styles.modalText}>Last Collected: {selectedBin.lastCollectionTime}</Text>
                </View>

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    height: 200, // Set height as per your requirement
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

export default Tracking;
