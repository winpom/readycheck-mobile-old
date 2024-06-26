import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_READY_CHECK, QUERY_ME } from '../utils/queries';
import { UPDATE_READY_CHECK, RSVP_READY_CHECK, SEND_CHAT_MESSAGE, DELETE_READY_CHECK } from '../utils/mutations';
import { useSocket } from './SocketContext';
import { parse } from 'date-fns';

function LiveReadyCheckPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const socket = useSocket();
  const { id } = route.params;
  const { loading: meLoading, data: userData } = useQuery(QUERY_ME); // Fetch current user's data

  const [editMode, setEditMode] = useState(false);
  const [updatedReadyCheckData, setUpdatedReadyCheckData] = useState({});
  const [selectedResponse, setSelectedResponse] = useState('Pending');
  const [messageInput, setMessageInput] = useState('');
  const messagesRef = useRef(null);

  const { loading, error, data, refetch } = useQuery(QUERY_READY_CHECK, {
    variables: { id },
  });

  const [updateReadyCheck] = useMutation(UPDATE_READY_CHECK);
  const [rsvpReadyCheck] = useMutation(RSVP_READY_CHECK);
  const [sendChatMessage] = useMutation(SEND_CHAT_MESSAGE);
  const [deleteReadyCheck] = useMutation(DELETE_READY_CHECK);

  useEffect(() => {
    if (socket) {
      socket.on('readyCheckUpdate', (update) => {
        setUpdatedReadyCheckData(update);
      });

      socket.on('chat message', (msg) => {
        // Implement handling for chat messages if needed
      });
    }

    return () => {
      if (socket) {
        socket.off('chat message');
      }
    };
  }, [socket]);

  const handleSendMessage = async () => {
    if (messageInput.trim() !== '') {
      const timestamp = new Date().toLocaleTimeString();
      const message = `${userData.me.username}|${messageInput}|${timestamp}`; // Use current user's data
      try {
        await sendChatMessage({ variables: { readyCheckId: id, userId: userData.me._id, content: messageInput } });
        setMessageInput('');
      } catch (error) {
        console.error('Error sending message:', error.message);
      }
    }
  };

  const handleRSVPSelection = async (response) => {
    setSelectedResponse(response);
    try {
      await rsvpReadyCheck({
        variables: { readyCheckId: id, userId: userData.me._id, reply: response },
        refetchQueries: [{ query: QUERY_READY_CHECK }]
      });
      // Store selected response in local storage if needed
    } catch (error) {
      console.error('Error responding to ReadyCheck:', error.message);
    }
  };

  useEffect(() => {
    // Scroll to bottom of messages container when chatMessages changes
    if (messagesRef.current) {
      messagesRef.current.scrollToEnd();
    }
  }, [data?.getReadyCheck?.chatMessages]);

  const handleEditReadyCheck = () => {
    const localTime = new Date().toLocaleString('en-CA', { hour12: false }).replace(",", "").slice(0, 16);
    setEditMode(true);
    setUpdatedReadyCheckData({
      title: data.getReadyCheck.title,
      timing: localTime,
      activity: data.getReadyCheck.activity,
      description: data.getReadyCheck.description,
      invitees: data.getReadyCheck.invitees.map(invitee => invitee._id)
    });
  };

  const handleSaveReadyCheck = async () => {
    try {
      await updateReadyCheck({
        variables: {
          id,
          title: updatedReadyCheckData.title,
          activity: updatedReadyCheckData.activity,
          timing: updatedReadyCheckData.timing,
          description: updatedReadyCheckData.description,
          inviteeIds: updatedReadyCheckData.invitees
        },
      });
      setEditMode(false);
      refetch();
      socket.emit('readyCheckUpdate', updatedReadyCheckData);
    } catch (error) {
      console.error('Error updating ReadyCheck:', error.message);
    }
  };

  const handleDeleteReadyCheck = async () => {
    try {
      console.log(`Deleting ReadyCheck with ID: ${id}`);
      await deleteReadyCheck({ variables: { id } });
      navigation.navigate('/'); // Redirect to another page after deletion
    } catch (error) {
      console.error('Error deleting ReadyCheck:', error.message);
    }
  };

  const handleChange = (name, value) => {
    setUpdatedReadyCheckData({
      ...updatedReadyCheckData,
      [name]: value,
    });
  };

  const handleInviteeClick = (id) => {
    setUpdatedReadyCheckData((prevData) => ({
      ...prevData,
      invitees: prevData.invitees.includes(id)
        ? prevData.invitees.filter((inviteeId) => inviteeId !== id)
        : [...prevData.invitees, id],
    }));
  };

  if (loading || meLoading) return <View><Text>Loading...</Text></View>;
  if (error) return <View><Text>Error: {error.message}</Text></View>;

  const { title, owner, timing, activity, invitees, description, RSVPs, chatMessages } = data.getReadyCheck || {};
  const isOwner = owner?.username === userData.me.username;

  const renderCountdown = () => {
    // Implement countdown rendering if needed
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        {isOwner && !editMode && (
          <>
            <TouchableOpacity onPress={handleEditReadyCheck} style={{ ...styles.button, backgroundColor: 'orange' }}>
              <Text style={styles.buttonText}>Edit ReadyCheck</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteReadyCheck} style={{ ...styles.button, backgroundColor: 'red', marginLeft: 10 }}>
              <Text style={styles.buttonText}>Delete ReadyCheck</Text>
            </TouchableOpacity>
          </>
        )}
        {isOwner && editMode && (
          <TouchableOpacity onPress={handleDeleteReadyCheck} style={{ ...styles.button, backgroundColor: 'red', marginLeft: 10 }}>
            <Text style={styles.buttonText}>Delete ReadyCheck</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 }}>{title}</Text>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        {/* Render countdown if needed */}
      </View>
      <View style={{ marginBottom: 20 }}>
        {editMode ? (
          <View>
            <TextInput
              style={styles.input}
              value={updatedReadyCheckData.title}
              onChangeText={(text) => handleChange('title', text)}
              placeholder="Title"
            />
            {/* Other inputs and fields */}
            <TouchableOpacity onPress={handleSaveReadyCheck} style={{ ...styles.button, backgroundColor: 'blue' }}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditMode(false)} style={{ ...styles.button, backgroundColor: 'orange', marginLeft: 10 }}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Display non-edit mode details */}
          </View>
        )}
      </View>
      {/* RSVP options and messages */}
    </ScrollView>
  );
}

const styles = {
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
};

export default LiveReadyCheckPage;
