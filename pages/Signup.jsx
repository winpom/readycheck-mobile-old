import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useMutation } from '@apollo/client';
import { CREATE_USER } from '../utils/mutations';
import { AuthServiceInstance } from '../utils/auth';

const SignUp = () => {
  const [formState, setFormState] = useState({ username: '', email: '', password: '' });
  const [signUp, { error, data }] = useMutation(CREATE_USER);

  // Update state based on form input changes
  const handleChange = (name, value) => {
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    try {
      const response = await signUp({
        variables: { ...formState },
      });

      const { token } = response.data.createUser;
      AuthServiceInstance.login(token);
      // Optionally navigate to another screen upon successful signup
    } catch (e) {
      console.error(e);
    }

    setFormState({
      username: '',
      email: '',
      password: '',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.header}>Sign Up!</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={formState.username}
          onChangeText={(text) => handleChange('username', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formState.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formState.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry={true}
        />
        <Button title="Submit" onPress={handleFormSubmit} />
        {data && (
          <Text>
            Success! You may now head{' '}
            {/* Replace this with your actual navigation mechanism */}
            <Text style={styles.link} onPress={() => console.log('Navigate to homepage')}>back to the homepage.</Text>
          </Text>
        )}
        {error && <Text style={styles.error}>{error.message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', // Adjust background color
  },
  formContainer: {
    width: '80%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#FFFFFF', // Form background color
    borderRadius: 10,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333', // Header text color
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  link: {
    color: '#007BFF', // Link color
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  error: {
    color: '#FF0000', // Error text color
    marginTop: 10,
  },
});

export default SignUp;
