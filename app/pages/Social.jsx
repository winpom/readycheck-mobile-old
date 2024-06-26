import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_ME, QUERY_USER_BY_USERNAME } from '../utils/queries';
import { REMOVE_FRIEND } from '../utils/mutations';
import { AuthServiceInstance } from '../utils/auth';

const Social = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const { loading: loadingMe, data: dataMe, refetch: refetchMe } = useQuery(QUERY_ME);
  const [removeFriend] = useMutation(REMOVE_FRIEND);
  const { loading: loadingSearch, data: searchData, refetch: refetchUserByUsername } = useQuery(QUERY_USER_BY_USERNAME, {
    variables: { username: searchUsername },
    skip: true,
  });

  useEffect(() => {
    setIsAuthenticated(AuthServiceInstance.loggedIn());
  }, []);

  const handleSearch = async () => {
    if (searchUsername.trim() === '') {
      setErrorMessage('Please enter a username to search.');
      return;
    }
    setErrorMessage('');
    try {
      const { data } = await refetchUserByUsername({ username: searchUsername });
      setSearchResult(data?.getUserByUsername || null);
    } catch (error) {
      console.error('Error searching for user:', error);
      setErrorMessage('An error occurred while searching for the user.');
    }
  };

  const handleRemoveFriend = async (username) => {
    try {
      await removeFriend({ variables: { username } });
      refetchMe();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const goToUserProfile = (userId) => {
    // Replace with your navigation logic
    console.log(`Navigating to profile ${userId}`);
  };

  if (loadingMe) {
    return <Text>Loading...</Text>;
  }

  const user = dataMe?.me || {};

  return (
    <View style={styles.container}>
      {isAuthenticated ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.section}>
            <Text style={styles.header}>Friends List</Text>
            <View style={styles.card}>
              {user.friends && user.friends.length > 0 ? (
                user.friends.map((friend) => (
                  <View key={friend._id} style={styles.friendItem}>
                    <TouchableOpacity onPress={() => goToUserProfile(friend._id)}>
                      <Text style={styles.username}>{friend.username}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveFriend(friend.username)} style={styles.deleteButton}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No friends found</Text>
              )}
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.header}>Find a Friend</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={searchUsername}
                onChangeText={(text) => setSearchUsername(text)}
              />
              <Button title="Search" onPress={handleSearch} disabled={loadingSearch} />
              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
              <View style={styles.searchResult}>
                {searchResult ? (
                  <TouchableOpacity onPress={() => goToUserProfile(searchResult._id)}>
                    <Text style={styles.username}>{searchResult.username}</Text>
                  </TouchableOpacity>
                ) : (
                  searchUsername && !loadingSearch && <Text>No users found</Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.hero}>
          <Text style={styles.heroText}>You're signed out!</Text>
          <Text style={styles.heroText}>You need to be logged in to see this.</Text>
          {/* Replace with your navigation logic */}
          <TouchableOpacity style={styles.button} onPress={() => console.log('Navigate to login')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => console.log('Navigate to signup')}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Adjust background color
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // Header text color
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#333333', // Card background color
    borderRadius: 10,
    padding: 10,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#FF6347', // Delete button background color
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: '#FFFFFF',
  },
  emptyText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#666666', // Divider color
    marginVertical: 20,
  },
  input: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#FFFFFF',
  },
  error: {
    color: '#FF0000',
    marginTop: 10,
  },
  searchResult: {
    marginTop: 10,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  heroText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF', // Button background color
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default Social;
