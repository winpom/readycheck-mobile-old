import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Replace with your navigation library
import ReadyCheckForm from '../components/ReadyCheckForm';
import { QUERY_USER, QUERY_ME } from '../utils/queries';
import { AuthServiceInstance } from '../utils/auth';

const Home = () => {
  const navigation = useNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { username: userParam } = useParams();
  const { loading, data } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
    variables: { username: userParam },
  });

  const user = data?.me || data?.getUser || {};

  useEffect(() => {
    setIsAuthenticated(AuthServiceInstance.loggedIn());
  }, []);

  const openReadyCheckForm = () => {
    // Implement modal logic for ReadyCheckForm in React Native
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {isAuthenticated ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={openReadyCheckForm}>
            <Text>New ReadyCheck</Text>
          </TouchableOpacity>
          {/* Add modal for ReadyCheckForm */}
          <TouchableOpacity onPress={() => navigation.navigate('/readychecks')}>
            <Text>Active ReadyChecks</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('/social')}>
            <Text>Social</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('/myprofile')}>
            <Text>Profile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Welcome to Ready Check!</Text>
          <Text>An app where you can invite friends to join you while playing video games!</Text>
          <TouchableOpacity onPress={() => navigation.navigate('/signup')}>
            <Text>New here? Sign up!</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('/login')}>
            <Text>Already have an account? Log in!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Home;
