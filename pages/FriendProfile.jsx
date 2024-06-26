import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useParams } from '@react-navigation/native'; // Replace with your navigation library
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_USER, QUERY_ME } from '../utils/queries';
import { ADD_FRIEND, REMOVE_FRIEND } from '../utils/mutations';
import ProfileStandIn from '../../../public/images/profile-stand-in.png'; // Replace with your image path

const FriendProfile = () => {
  const navigation = useNavigation();
  const { id: userId } = useParams();

  const { loading: loadingUser, error: errorUser, data: dataUser } = useQuery(QUERY_USER, {
    variables: { id: userId },
  });
  const { loading: loadingMe, error: errorMe, data: dataMe } = useQuery(QUERY_ME);

  const [followFriend] = useMutation(ADD_FRIEND, {
    refetchQueries: [{ query: QUERY_ME }, { query: QUERY_USER, variables: { id: userId } }],
  });
  const [unfollowFriend] = useMutation(REMOVE_FRIEND, {
    refetchQueries: [{ query: QUERY_ME }, { query: QUERY_USER, variables: { id: userId } }],
  });

  if (loadingUser || loadingMe) return <View><Text>Loading...</Text></View>;
  if (errorUser || errorMe) return <View><Text>Error: {errorUser?.message || errorMe?.message}</Text></View>;

  const user = dataUser?.getUser;
  const currentUser = dataMe?.me;

  if (!user) {
    return <View><Text>User not found</Text></View>;
  }

  const isFriend = currentUser?.friends?.some(friend => friend._id === user._id);

  const handleFollow = async () => {
    try {
      await followFriend({ variables: { username: user.username } });
    } catch (err) {
      console.error('Error following friend:', err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowFriend({ variables: { username: user.username } });
    } catch (err) {
      console.error('Error unfollowing friend:', err);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image source={ProfileStandIn} style={{ width: 150, height: 150, borderRadius: 75 }} />
      <Text>{user.username}</Text>
      <Text>Status: {user.status || 'No bio available'}</Text>
      <Text>{user.bio || 'No bio available'}</Text>
      {isFriend ? (
        <TouchableOpacity onPress={handleUnfollow}>
          <Text>Unfollow</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleFollow}>
          <Text>Follow</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FriendProfile;
