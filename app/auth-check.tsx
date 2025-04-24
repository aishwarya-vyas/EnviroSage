import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function AuthCheck() {
  useEffect(() => {
    const checkLoginStatus = async () => {
      console.time("AuthCheck");

      try {
        const storedUser = await AsyncStorage.getItem("user");
        console.timeLog("AuthCheck", "Read from AsyncStorage");

        if (storedUser) {
          const { role } = JSON.parse(storedUser);
          console.log("Stored Role:", role);

          if (role === "admin") {
            router.replace("./(tabs)/tracking");
          } else if (role === "driver") {
            router.replace("/driver_page");
          } else {
            router.replace("/login");
          }
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/login");
      }

      console.timeEnd("AuthCheck");
    };

    checkLoginStatus();
  }, []);

  return null;
}