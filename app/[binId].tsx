import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { db } from '@/config'; // Firebase config
import { doc, getDoc } from 'firebase/firestore' // Firebase Firestore methods
import { LineChart } from "react-native-chart-kit";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useRoute } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

const BinDetails = () => {
  const router = useRouter();
  const { binId } = useLocalSearchParams();  // Accessing binId from the route query

  const [binData, setBinData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getBusiness = async () => {
      if (!binId || Array.isArray(binId)) {
        console.log("Invalid binId:", binId);
        setLoading(false);
        return;
      }
      console.log("Fetching data for binId:", binId);  
      const docRef = doc(db, 'bins', binId); // Ensure binId is a string
      console.log(docRef);
      const docSnap = await getDoc(docRef);
      console.log(docSnap);
  
      if (docSnap.exists()) {
        setBusiness({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No document found");
      }
      setLoading(false);
    };
  
    getBusiness();
  }, [binId]);
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A5C2AA" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!binData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No bin details found.</Text>
      </View>
    );
  }

  const { fillLevel, weight, lastEmptied, historyData = [] } = binData;

  const getStatusColor = (level: number) => {
    if (level < 40) return "#28a745";
    if (level >= 40 && level < 70) return "#ffc107";
    return "#dc3545";
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.row}>
        <View style={styles.cardFull}>
          <FontAwesome name="hashtag" size={24} color="#6c757d" />
          <Text style={styles.label}>Bin ID</Text>
          <Text style={styles.value}>{binId}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.cardHalf}>
          <FontAwesome name="trash" size={24} color={getStatusColor(fillLevel)} />
          <Text style={styles.label}>Fill Level</Text>
          <Text style={[styles.value, { color: getStatusColor(fillLevel) }]}>{fillLevel.toFixed(1)}%</Text>
          <View style={[styles.statusBar, { backgroundColor: getStatusColor(fillLevel), width: `${fillLevel}%` }]} />
        </View>

        <View style={styles.cardHalf}>
          <FontAwesome name="balance-scale" size={24} color="#6c757d" />
          <Text style={styles.label}>Weight</Text>
          <Text style={styles.value}>{weight.toFixed(1)} kg</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.cardFull}>
          <FontAwesome name="clock-o" size={24} color="#6c757d" />
          <Text style={styles.label}>Last Emptied</Text>
          <Text style={styles.value}>{lastEmptied}</Text>
        </View>
      </View>

      {/* Historical Trend Graph (assuming you have the data) */}
      <LineChart
        data={{
          labels: ["D1", "D2", "D3", "D4", "D5", "D6", "Today"],
          datasets: [
            {
              data: historyData,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            },
          ],
        }}          
        width={screenWidth - 40}
        height={220}
        yAxisSuffix="%"
        chartConfig={{
          backgroundColor: "#f8f9fa",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: () => "#333",
          style: { borderRadius: 10 },
        }}
        style={styles.chart}
      />

      {/* Button to mark as emptied or report an issue */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => alert("Bin marked as emptied")}>
          <Text style={styles.buttonText}>Mark as Emptied</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.reportButton]} onPress={() => alert("Issue reported")}>
          <Text style={styles.buttonText}>Report an Issue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  cardHalf: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 12,
  },
  cardFull: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  chart: {
    alignSelf: "center",
    marginVertical: 12,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    padding: 8,
    elevation: 3,
  },
  statusBar: {
    height: 6,
    width: "100%",
    marginTop: 6,
    borderRadius: 6,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1, 
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  reportButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});

export default BinDetails;
