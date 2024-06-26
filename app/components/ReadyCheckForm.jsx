import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useMutation, useQuery } from '@apollo/client';

import { CREATE_READY_CHECK } from '../utils/mutations'; // Assuming mutation is correctly adapted for React Native
import { QUERY_INVITEES, QUERY_ME } from '../utils/queries'; // Assuming queries are adapted for React Native

const ReadyCheckForm = ({ userId }) => {
  const [title, setTitle] = useState('');
  const [activity, setActivity] = useState('');
  const [timing, setTiming] = useState(new Date().toISOString().slice(0, 16)); // Default to current time
  const [invitees, setInvitees] = useState([]);

  const [createReadyCheck, { loading, error }] = useMutation(CREATE_READY_CHECK);

  const handleSubmit = async () => {
    try {
      const { data } = await createReadyCheck({
        variables: {
          input: {
            title,
            activity,
            timing,
            inviteeIds: invitees,
            ownerId: userId,
          },
        },
      });
      // Handle navigation or other logic after successful submission
    } catch (error) {
      console.error('Error creating ready check:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Create Ready Check</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Activity"
        value={activity}
        onChangeText={setActivity}
      />
      <TextInput
        style={styles.input}
        placeholder="Timing"
        value={timing}
        onChangeText={setTiming}
      />
      {/* Render invitees selection components */}
      <TouchableOpacity onPress={handleSubmit}>
        <Text>Create Ready Check</Text>
      </TouchableOpacity>
      {loading && <Text>Loading...</Text>}
      {error && <Text>Error: {error.message}</Text>}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 10,
  },
};

export default ReadyCheckForm;
