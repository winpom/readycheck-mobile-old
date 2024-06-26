import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client';
import { QUERY_USER, QUERY_ME } from '../utils/queries';
import ReadyCheckForm from '../components/ReadyCheckForm';
import { AuthServiceInstance } from '../utils/auth';

const ReadyCheckList = () => {
  const { username: userParam } = useParams();
  const { loading, data, refetch } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
    variables: { username: userParam },
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setIsAuthenticated(AuthServiceInstance.loggedIn());
  }, []);

  const user = data?.me || {};

  const navigate = useNavigate();

  const openReadyCheckForm = () => {
    setModalVisible(true);
  };

  const closeReadyCheckForm = () => {
    setModalVisible(false);
  };

  const goToLoginPage = () => {
    navigate('/login');
  };

  const goToSignUpPage = () => {
    navigate('/signup');
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isAuthenticated ? (
        <View style={styles.profileContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>My ReadyChecks</Text>
            <Text style={styles.subHeaderText}>Click on an active ReadyCheck for more details</Text>
          </View>
          <TouchableOpacity onPress={openReadyCheckForm} style={styles.addButton}>
            <Text style={styles.addButtonLabel}>New ReadyCheck</Text>
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
            }}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={closeReadyCheckForm}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <ReadyCheckForm userId={user._id} />
            </View>
          </Modal>
          <View style={styles.divider}></View>
          <View style={styles.readyCheckContainer}>
            <Text style={styles.sectionHeader}>Owned ReadyChecks</Text>
            {user.ownedReadyChecks && user.ownedReadyChecks.length > 0 ? (
              user.ownedReadyChecks.map((readyCheck) => (
                <TouchableOpacity
                  key={readyCheck._id}
                  onPress={() => navigate(`/readycheck/${readyCheck._id}`)}
                  style={styles.readyCheckCard}
                >
                  <Text style={styles.readyCheckTitle}>{readyCheck.title}</Text>
                  <Text style={styles.readyCheckDescription}>{readyCheck.description}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noReadyChecks}>No active ReadyChecks found</Text>
            )}
          </View>
          <View style={styles.readyCheckContainer}>
            <Text style={styles.sectionHeader}>Received ReadyChecks</Text>
            {user.receivedReadyChecks && user.receivedReadyChecks.length > 0 ? (
              user.receivedReadyChecks.map((readyCheck) => (
                <TouchableOpacity
                  key={readyCheck._id}
                  onPress={() => navigate(`/readycheck/${readyCheck._id}`)}
                  style={styles.readyCheckCard}
                >
                  <Text style={styles.readyCheckTitle}>{readyCheck.title}</Text>
                  <Text style={styles.readyCheckDescription}>{readyCheck.description}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noReadyChecks}>No received ReadyChecks found</Text>
            )}
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
  headerContainer: {
    marginVertical: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  addButton: {
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#4CAF50', // Adjust button color
    borderRadius: 10,
    alignSelf: 'center',
  },
  addButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#CCCCCC',
    marginVertical: 20,
  },
  readyCheckContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  readyCheckCard: {
    backgroundColor: '#2196F3', // Adjust card background color
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  readyCheckTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  readyCheckDescription: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  noReadyChecks: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
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

export default ReadyCheckList;
