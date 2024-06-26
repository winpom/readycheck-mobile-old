import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';

import { QUERY_NOTIFICATIONS } from '../utils/queries'; // Assuming query is adapted for React Native
import { DELETE_NOTIFICATION } from '../utils/mutations'; // Assuming mutation is adapted for React Native

const Notifications = ({ userId }) => {
  const { data, refetch } = useQuery(QUERY_NOTIFICATIONS, { variables: { userId } });
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

  const notifications = data?.notifications || [];

  const handleNotificationClick = async (notificationId) => {
    try {
      await deleteNotification({ variables: { notificationId } });
      refetch();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <View>
      <Text>Recent Notifications</Text>
      {notifications.length === 0 ? (
        <Text>No new notifications</Text>
      ) : (
        notifications.map((notification) => (
          <TouchableOpacity key={notification._id} onPress={() => handleNotificationClick(notification._id)}>
            <View style={styles.notification}>
              <Text>{notification.sender.username} {notification.type === 'follow' ? 'followed' : notification.type === 'unfollow' ? 'unfollowed' : 'sent you a ReadyCheck'}.</Text>
              <Text>{notification.createdAt}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = {
  notification: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
};

export default Notifications;
