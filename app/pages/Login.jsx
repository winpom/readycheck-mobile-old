import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../utils/mutations';
import { AuthServiceInstance } from '../utils/auth';

const Login = () => {
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [login, { error, data }] = useMutation(LOGIN);

  const handleChange = (name, value) => {
    setFormState({ ...formState, [name]: value });
  };

  const handleFormSubmit = async () => {
    try {
      const { data } = await login({ variables: { ...formState } });
      AuthServiceInstance.login(data.login.token);
      // Navigate to the next screen or perform any necessary action upon successful login
    } catch (e) {
      console.error(e);
    }
    setFormState({ email: '', password: '' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login!</Text>
      <View style={styles.formContainer}>
        {data ? (
          <Text>
            Success! You may now head back to the homepage.
          </Text>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Your email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={formState.email}
                onChangeText={(text) => handleChange('email', text)}
                required
              />
            </View>
            <View style={styles.inputContainer}>
              <Text>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="*******"
                secureTextEntry
                value={formState.password}
                onChangeText={(text) => handleChange('password', text)}
                required
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Submit"
                onPress={handleFormSubmit}
                color="#007AFF" // Adjust color to your app's theme
              />
            </View>
          </View>
        )}
        {error && <Text style={styles.error}>{error.message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Adjust background color to your app's theme
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF', // Adjust text color to your app's theme
    marginBottom: 20,
  },
  formContainer: {
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 10,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC', // Adjust border color to your app's theme
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#FFFFFF', // Adjust background color to your app's theme
  },
  buttonContainer: {
    marginTop: 20,
  },
  error: {
    marginTop: 10,
    color: '#FF3B30', // Adjust error text color to your app's theme
  },
});

export default Login;
