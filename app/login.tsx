import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '@/config';
import { doc, getDoc, query, where, collection, getDocs } from 'firebase/firestore';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(""); // Email or Employee ID
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Clear storage on app start to ensure fresh login
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const { role } = JSON.parse(storedUser);
          if (role === "admin") {
            router.replace("./(tabs)/tracking");
          } else if (role === "driver") {
            router.replace("/driver_page");
          }
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };
  
    initializeApp();
  }, []);
  

  const handleLogin = async () => {
    if (identifier === "" || password === "") {
      setError("Please fill in all fields");
      return;
    }
  
    setError(""); 
    setLoading(true);
  
    try {
      let email = identifier;
  
      // If identifier is an Employee ID, fetch associated email
      if (!identifier.includes("@")) {
        const userQuery = query(collection(db, "users"), where("employeeId", "==", identifier));
        const querySnapshot = await getDocs(userQuery);
  
        if (querySnapshot.empty) {
          setError("No account found with this Employee ID");
          setLoading(false);
          return;
        }
  
        const userData = querySnapshot.docs[0].data();
        email = userData.email;
      }
  
      // Firebase Auth Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Fetch User Role from Firestore
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData?.role || "bmc"; // Default to "bmc" if no role is set
  
        // **Clear previous session data before storing new user session**
        await AsyncStorage.clear();
        await AsyncStorage.setItem("user", JSON.stringify({ uid: user.uid, role }));
  
        // Navigate based on role
        if (role === "admin") {
          router.replace("./(tabs)/tracking");
        } else if (role === "driver") {
          router.replace("./(tabs)/tracking");
        } else {
          setError("Unauthorized access. Please contact admin.");
        }
      } else {
        setError("No user data found. Please contact support.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Login failed. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image source={require("./../assets/images/logo.jpg")} style={styles.icon} />
      </View>

      <Text style={styles.title}>EnviroSage</Text>
      <Text style={styles.subtitle}>Revolutionizing waste collection</Text>

      {error !== "" && <Text style={styles.errorText}>{error}</Text>}

      {/* Identifier Input (Email or Employee ID) */}
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={20} color="#fff" />
        <TextInput
          style={styles.input}
          placeholder="Email ID"
          placeholderTextColor="#888"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#fff" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#4CAF50" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      {/* Link to Register */}
      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.linkText}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  iconContainer: {
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: '#fff',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 5,
    letterSpacing: 1.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    paddingVertical: 10,
    width: '100%',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 15,
    color: 'black',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 80,
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  linkText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default LoginPage;
