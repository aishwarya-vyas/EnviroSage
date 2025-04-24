import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '@/config';  
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !empId) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      console.log("Email entered:", email);
      console.log("Password entered:", password);

      Alert.alert("Confirmation", "Email and password received. Proceeding with authentication.");

      // Check if email exists in the 'all_users' collection
      const querySnapshot = await getDocs(collection(db, "all_users"));
      let role = null;

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email === email) {
          role = userData.role; // Get the assigned role (admin/driver)
        }
      });

      if (!role) {
        setError("Email not found in the system. Contact admin.");
        return;
      }

      // Proceed with authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("User created in Firebase Authentication:", user.uid);
      Alert.alert("Success", `User created successfully! UID: ${user.uid}`);

      // Add user to Firestore 'users' collection
      const usersCollectionRef = collection(db, "users");
      const newUserRef = doc(usersCollectionRef, user.uid); // Use UID as document ID

      await setDoc(newUserRef, {
        email: email,
        emp_id: empId,
        role: role,
        createdAt: new Date().toISOString(),
        uid: user.uid,  
      });

      console.log("User added to Firestore:", email);
      Alert.alert("Success", "User successfully registered in the database.");

      // Navigate to login page
      router.push("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      setError("Registration failed. Please try again.");
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

      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color="#fff" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="id-card" size={20} color="#fff" />
        <TextInput
          style={styles.input}
          placeholder="Employee ID"
          placeholderTextColor="#888"
          value={empId}
          onChangeText={setEmpId}
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#fff" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#fff" />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
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

export default RegisterPage;
