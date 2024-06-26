import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_FRIEND, REMOVE_FRIEND } from '../utils/mutations';
import { QUERY_USERS, QUERY_FRIENDS} from '../utils/queries';
import Auth from '../utils/auth';

function FriendsList({setRecipients, userId}) {
    useEffect(() => {
        const user = Auth.getProfile()
        console.log(user)
    }, []);
    
    // State to store the list of friends
    const [friends, setFriends] = useState([]);

    // State to store the search query
    const [searchQuery, setSearchQuery] = useState('');

    // State to store the search results
    const [searchResults, setSearchResults] = useState([]);

    // State to store the ID of the user whose options are visible
    const [visibleOptionsUserId, setVisibleOptionsUserId] = useState(null);
    const [addFriend] = useMutation(ADD_FRIEND);
    const [removeFriend] = useMutation(REMOVE_FRIEND);
    const { loading: friendsLoading, data: friendsData } = useQuery(QUERY_FRIENDS, {
        variables: { userId },
    });
    const { loading: usersLoading, data: usersData } = useQuery(QUERY_USERS, {
        variables: { username: searchQuery },
    });

    // Effect to update the friends list when friends data changes
    useEffect(() => {
        if (friendsData) {
            setFriends(friendsData.friends);
        }
    }, [friendsData]);

    // Effect to update the search results when users data changes
    useEffect(() => {
        if (usersData) {
            setSearchResults(usersData.users);
        }
    }, [usersData]);
    // Function to handle adding a friend
    const handleAddFriend = async (friendId) => {
        try {
            await addFriend({
                variables: { userId, friendId },
            });
            // Refresh the list of friends
            // You can also handle this by refetching the friends query
            setFriends([...friends, friendId]);
        } catch (error) {
            console.error('Error adding friend:', error);
        }
    };
    // Function to handle removing a friend
    const handleRemoveFriend = async (friendId) => {
        try {
            await removeFriend({
                variables: { userId, friendId },
            });
            // Refresh the list of friends
            // You can also handle this by refetching the friends query
            setFriends(friends.filter((friend) => friend !== friendId));
        } catch (error) {
            console.error('Error removing friend:', error);
        }
    };
    // Function to toggle the visibility of options for a friend
    const toggleOptions = (friendId) => {
        setVisibleOptionsUserId((prevUserId) => (prevUserId === friendId ? null : friendId));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        
    //     const { data } = await updateFriends({ variables: { input: readyCheck } });

    //     if (data) {
    //         socket.emit('updateFriends', data.updateFriends);
    //     }
    // };

    return (
        <div>
            {/* Add Friend Form */}
            <form onSubmit={handleSubmit}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                <button type="submit">Add Friend</button>
            </form>
            {/* List of Friends */}
            <ul>
                {friends.map((friend) => (
                    <li key={friend.id}>
                        {/* Link to friend's profile */}
                        <div className="dropdown">
                            <a
                                href={`/profile/${user.id}`}
                                onClick={() => toggleOptions(friend.id)}
                                className={`dropdown-toggle${visibleOptionsUserId === friend.id ? ' active' : ''}`}
                            >
                                {friend.username}
                            </a>
                            <ul className={`menu ${visibleOptionsUserId === friend.id ? ' show' : ''}`}>
                                <li>
                                    <button onClick={() => handleRemoveFriend(friend.id)}>Remove Friend</button>
                                </li>
                                {/* We can add more options here */}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
            {/* Search Form */}
            <form onSubmit={handleSearch}>
                <input type="text" value={searchUsername} onChange={(e) => setSearchUsername(e.target.value)} />
                <button type="submit">Search</button>
            </form>
            {/* Search Results */}
            <ul>
                {searchResults.map((user) => (
                    <li key={user.id}>
                        {/* Link to send friend request */}
                        <a href={`/user/${user.id}`} onClick={() => handleAddFriend(user.id)}>Add Friend</a>
                    </li>
                ))}
            </ul>
        </div>
        );
    }
}

export default FriendsList;
