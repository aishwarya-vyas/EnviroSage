import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { db } from "@/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { DimensionValue } from "react-native";

interface BinData {
    id: string;
    name: string;
    fullness: string;
    fillLevel: number;
    weight: number;
    lastCollectionTime: string;
    lastEmptied: string;
    location: string;
    latitude: string;
    longitude: string;
    predictedFillTime: string;
    timeLeft: string;
    historyData: number[];
}

const screenWidth = Dimensions.get("window").width;

const BinDetails = () => {
    const { id } = useLocalSearchParams();
    const [binData, setBinData] = useState<BinData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBinData = async () => {
            try {
                setLoading(true);
                const q = query(collection(db, "prediction"), where("id", "==", id.toString()));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const data = doc.data();
                    setBinData({
                        id: data.id,
                        name: data.name || `Bin ${id}`,
                        fullness: data.fullness || "0",
                        fillLevel: data.fillLevel || 0,
                        weight: data.weight || 0,
                        lastCollectionTime: data.lastCollectionTime || "Not available",
                        lastEmptied: data.lastEmptied || "Not available",
                        location: data.location || "Unknown location",
                        latitude: data.latitude || "",
                        longitude: data.longitude || "",
                        predictedFillTime: data.predictedFillTime || "N/A",
                        timeLeft: data.timeLeft || "N/A",
                        historyData: data.historyData || [0, 0, 0, 0, 0, 0, 0]
                    });
                } else {
                    setError(`Bin with ID ${id} not found`);
                }
            } catch (err) {
                console.error("Error fetching bin data:", err);
                setError("Failed to load bin data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchBinData();
    }, [id]);

    const getStatusColor = (level: number) => {
        if (level < 40) return "#28a745";
        if (level >= 40 && level < 70) return "#ffc107";
        return "#dc3545";
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!binData) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No data available for this bin</Text>
            </View>
        );
    }

    const fullnessPercentage = (parseFloat(binData.fullness) * 100);
    const currentFillLevel = binData.fillLevel;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.binTitle}>{binData.name}</Text>
            <Text style={styles.locationText}>Location: {binData.location}</Text>
            <Text style={styles.coordinatesText}>
                Coordinates: {binData.latitude}, {binData.longitude}
            </Text>

            {/* Fill Level & Weight - Side by Side */}
            <View style={styles.row}>
                <View style={styles.cardHalf}>
                    <FontAwesome name="trash" size={24} color={getStatusColor(currentFillLevel)} />
                    <Text style={styles.label}>Current Fill Level</Text>
                    <Text style={[styles.value, { color: getStatusColor(currentFillLevel) }]}>
                        {currentFillLevel}%
                    </Text>
                    <View style={[styles.statusBar, {
                        backgroundColor: getStatusColor(currentFillLevel),
                        width: `${currentFillLevel}%` as DimensionValue
                    }]} />
                </View>
                <View style={styles.cardHalf}>
                    <FontAwesome name="balance-scale" size={24} color="#6c757d" />
                    <Text style={styles.label}>Weight</Text>
                    <Text style={styles.value}>{binData.weight} kg</Text>
                </View>
            </View>

            {/* Time Left & Predicted Fill Time - Side by Side */}
            <View style={styles.row}>
                <View style={styles.cardHalf}>
                    <FontAwesome name="clock-o" size={24} color="#6c757d" />
                    <Text style={styles.label}>Time Left</Text>
                    <Text style={styles.value}>{binData.timeLeft}</Text>
                </View>
                <View style={styles.cardHalf}>
                    <FontAwesome name="hourglass-half" size={24} color="#6c757d" />
                    <Text style={styles.label}>Predicted Full In</Text>
                    <Text style={styles.value}>{binData.predictedFillTime}</Text>
                </View>
            </View>

            {/* Last Collected & Last Emptied - Full Width */}
            <View style={styles.row}>
                <View style={styles.cardFull}>
                    <FontAwesome name="calendar" size={24} color="#6c757d" />
                    <Text style={styles.label}>Last Collected</Text>
                    <Text style={styles.value}>{binData.lastCollectionTime}</Text>
                </View>
            </View>
            {/* <View style={styles.row}>
                <View style={styles.cardFull}>
                    <FontAwesome name="history" size={24} color="#6c757d" />
                    <Text style={styles.label}>Last Emptied</Text> 
                    <Text style={styles.value}>{binData.lastEmptied}</Text>
                </View>
            </View> */}

            {/* Historical Trend Graph */}
            <Text style={styles.chartTitle}>Fill Level History (Last 7 Days)</Text>
            <LineChart
                data={{
                    labels: ["6d ago", "5d ago", "4d ago", "3d ago", "2d ago", "1d ago", "Today"],
                    datasets: [{
                        data: binData.historyData,
                        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                        strokeWidth: 2
                    }]
                }}
                width={screenWidth - 40}
                height={220}
                yAxisSuffix="%"
                yAxisInterval={1}
                chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: "4",
                        strokeWidth: "2",
                        stroke: "#007AFF"
                    }
                }}
                bezier
                style={styles.chart}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f9fa",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    binTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#212529",
        marginBottom: 5,
        textAlign: "center",
    },
    locationText: {
        fontSize: 16,
        color: "#6c757d",
        marginBottom: 5,
        textAlign: "center",
    },
    coordinatesText: {
        fontSize: 14,
        color: "#6c757d",
        marginBottom: 20,
        textAlign: "center",
    },
    errorText: {
        fontSize: 18,
        color: "#dc3545",
        textAlign: "center",
        marginTop: 20,
    },
    row: {
        marginTop: 15,
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
    statusBar: {
        height: 6,
        width: "100%",
        marginTop: 6,
        borderRadius: 6,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        padding: 8,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#495057",
        marginTop: 20,
        marginBottom: 10,
        textAlign: "center",
    },
});

export default BinDetails;