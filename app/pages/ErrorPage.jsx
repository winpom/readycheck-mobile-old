import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Replace with your navigation library

const ErrorPage = () => {
  const navigation = useNavigation();
  const [errorMessage, setErrorMessage] = useState('Loading...');

  useEffect(() => {
    const fetchErrorMessage = async () => {
      try {
        const response = await fetch('/errorMessage.json');

        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
          throw new Error('Failed to fetch error message');
        }

        const data = await response.json();
        setErrorMessage(data.message || '404 - Page Not Found');
      } catch (error) {
        console.error('Failed to fetch error message:', error);
        setErrorMessage('404 - Page Not Found');
      }
    };

    fetchErrorMessage();
  }, []);

  const goToHomePage = () => {
    navigation.navigate('Home'); // Replace 'Home' with your actual screen name in React Navigation
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{errorMessage}</Text>
      <Text>No match for {location.pathname}</Text>
      <Text>Sorry, the page you're looking for doesn't exist or has been moved.</Text>
      <TouchableOpacity onPress={goToHomePage}>
        <Text>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorPage;
