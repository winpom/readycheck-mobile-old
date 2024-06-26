import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, ScrollView } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_USER, QUERY_ME } from '../utils/queries';
import { UPDATE_USER_BIO, UPDATE_USER_STATUS, DELETE_USER } from '../utils/mutations';
import { AuthServiceInstance } from '../utils/auth';

const ProfilePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { loading, data, refetch } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
    variables: userParam ? { id: userParam } : {},
  });

  useEffect(() => {
    setIsAuthenticated(AuthServiceInstance.loggedIn());
  }, []);

  const [updateUserBio] = useMutation(UPDATE_USER_BIO, {
    update(cache, { data: { updateUserBio } }) {
      cache.writeQuery({
        query: userParam ? QUERY_USER : QUERY_ME,
        variables: userParam ? { id: userParam } : {},
        data: {
          me: userParam ? undefined : updateUserBio,
          getUser: userParam ? updateUserBio : undefined,
        },
      });
    }
  });

  const [updateUserStatus] = useMutation(UPDATE_USER_STATUS, {
    update(cache, { data: { updateUserStatus } }) {
      cache.writeQuery({
        query: userParam ? QUERY_USER : QUERY_ME,
        variables: userParam ? { id: userParam } : {},
        data: {
          me: userParam ? undefined : updateUserStatus,
          getUser: userParam ? updateUserStatus : undefined,
        },
      });
    }
  });

  const [deleteUser] = useMutation(DELETE_USER);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const user = data?.me || data?.getUser || {};

  const handleEditBioClick = () => {
    setIsEditingBio(true);
    setNewBio(user.bio || '');
  };

  const handleEditStatusClick = () => {
    setIsEditingStatus(true);
    setNewStatus(user.status || '');
  };

  const handleBioSubmit = async () => {
    try {
      const { data } = await updateUserBio({ variables: { bio: newBio } });
      console.log('Updated bio:', data);
      setIsEditingBio(false);
      refetch();
    } catch (err) {
      console.error('Error updating bio:', err);
    }
  };

  const handleStatusSubmit = async () => {
    try {
      const { data } = await updateUserStatus({ variables: { status: newStatus } });
      console.log('Updated status:', data);
      setIsEditingStatus(false);
      refetch();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser({ variables: { _id: user._id } });
      AuthServiceInstance.logout(); // Ensure the user is logged out
      // Handle navigation or app state update after deleting account
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isAuthenticated ? (
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image source={require('../../../public/images/profile-stand-in.png')} style={styles.avatar} />
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>{user.friends ? user.friends.length : 0} Friends</Text>
            </View>
            <View style={styles.statusContainer}>
              {isEditingStatus ? (
                <View>
                  <TextInput
                    style={styles.textInput}
                    value={newStatus}
                    onChangeText={setNewStatus}
                    multiline
                  />
                  <Button title="Submit" onPress={handleStatusSubmit} />
                </View>
              ) : (
                <View>
                  <Text style={styles.statusText}>Status: {user.status || 'No status available'}</Text>
                  <Button title="Edit Status" onPress={handleEditStatusClick} />
                </View>
              )}
            </View>
            <View style={styles.bioContainer}>
              {isEditingBio ? (
                <View>
                  <TextInput
                    style={styles.textInput}
                    value={newBio}
                    onChangeText={setNewBio}
                    multiline
                  />
                  <Button title="Submit" onPress={handleBioSubmit} />
                </View>
              ) : (
                <View>
                  <Text style={styles.bioText}>{user.bio || 'No bio available'}</Text>
                  <Button title="Edit Bio" onPress={handleEditBioClick} />
                </View>
              )}
            </View>
            <View style={styles.activityContainer}>
              <Text style={styles.activityHeading}>Recent Activity</Text>
              <ScrollView style={styles.activityList}>
                {user.ownedReadyChecks && user.ownedReadyChecks.length > 0 ? (
                  user.ownedReadyChecks.map((check) => (
                    <Button
                      key={check._id}
                      title={check.title}
                      onPress={() => {
                        // Handle navigation to individual check details
                      }}
                    />
                  ))
                ) : (
                  <Text>No recent activity</Text>
                )}
              </ScrollView>
            </View>
            <Button title="Delete Account" onPress={handleDeleteAccount} color="red" />
          </View>
        </View>
      ) : (
        <View style={styles.loggedOutContainer}>
          <Text style={styles.loggedOutText}>You're signed out!</Text>
          <Text style={styles.loggedOutSubText}>You need to be logged in to see this.</Text>
          <Button title="Login" onPress={goToLoginPage} />
          <Button title="Sign Up" onPress={goToSignUpPage} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#F3F4F6', // Adjust background color to your app's theme
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  userInfoContainer: {
    width: '80%',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 10,
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  statusContainer: {
    marginVertical: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  bioContainer: {
    marginVertical: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  bioText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  activityContainer: {
    marginVertical: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  activityHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  activityList: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    maxHeight: 200,
  },
  loggedOutContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loggedOutText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  loggedOutSubText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ProfilePage;
