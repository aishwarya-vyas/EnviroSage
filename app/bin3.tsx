import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { FontAwesome } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const Bins = ({ isAdmin = false }) => {
    const router = useRouter();
    const [fillLevel, setFillLevel] = useState(75);
    const [weight, setWeight] = useState(15);
    const [lastEmptied, setLastEmptied] = useState("04-03-2025 16:00");

    const historyData = [30, 50, 55, 60, 65, 70, 80];

    useEffect(() => {
        const interval = setInterval(() => {
            setFillLevel((prev) => {
                const newFillLevel = prev + Math.random() * 3;
                return newFillLevel <= 100 ? newFillLevel : 100; // Ensuring fillLevel does not exceed 100
            });
            setWeight((prev) => (prev < 50 ? prev + Math.random() * 2 : prev));
        }, 50000);

        return () => clearInterval(interval);
    }, []);


    const getStatusColor = (level) => {
        if (level < 40) return "#28a745";
        if (level >= 40 && level < 70) return "#ffc107";
        return "#dc3545";
    };

    return (
        <ScrollView style={styles.container}>
            {/* Fill Level & Weight - Side by Side */}
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
                    <Text style={styles.value}>{weight.toFixed(1)} g</Text>
                </View>
            </View>

            {/* Last Emptied - Full Width in Next Row */}
            <View style={styles.row}>
                <View style={styles.cardFull}>
                    <FontAwesome name="clock-o" size={24} color="#6c757d" />
                    <Text style={styles.label}>Last Emptied</Text>
                    <Text style={styles.value}>{lastEmptied}</Text>
                </View>
            </View>

            {/* Historical Trend Graph */}
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
                height={250}
                yAxisSuffix="%"
                chartConfig={{
                    backgroundColor: "#f8f9fa",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                    labelColor: () => "#333",
                    style: { borderRadius: 10 },
                    fillShadowGradientFrom: "rgba(40, 167, 69,0.9)",
                    fillShadowGradientTo: "white",
                    fillShadowGradientOpacity: 1,
                    propsForDots: {
                        r: "2",
                        strokeWidth: "2",
                        stroke: "#007AFF",
                        fill: "#007AFF",
                    },
                }}
                style={styles.chart}
            />

            {/* Buttons */}
            {/* <View style={styles.buttonContainer}>
        {isAdmin && (
          <TouchableOpacity style={styles.button} onPress={() => alert("Bin marked as emptied")}>
            <Text style={styles.buttonText}>Mark as Emptied</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, styles.reportButton]} onPress={() => alert("Issue reported")}>
          <Text style={styles.buttonText}>Report an Issue</Text>
        </TouchableOpacity>
      </View> */}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
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
        width: "48%", // Two cards in one row
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
        width: "100%", // Takes full row width
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
        marginTop: 30,
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

export default Bins;
