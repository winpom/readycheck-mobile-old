import { gql } from '@apollo/client';

export const CREATE_READY_CHECK = gql`
mutation CreateReadyCheck($input: ReadyCheckInput!) {
  createReadyCheck(input: $input) {
    _id
    title
    activity
    createdAt
    description
    invitees {
      _id
    }
    timing
  }
}
`;

export const UPDATE_READY_CHECK = gql`
    mutation UpdateReadyCheck($id: ID!, $title: String!, $activity: String, $timing: String!, $description: String) {
        updateReadyCheck(id: $id, title: $title, activity: $activity, timing: $timing, description: $description) {
            _id
            title
            activity
            timing
            description
            createdAt
            invitees {
                _id
                username
            }
        }
    }
`;

export const DELETE_READY_CHECK = gql`
mutation DeleteReadyCheck($id: ID!) {
  deleteReadyCheck(id: $id)
}
`;

export const RSVP_READY_CHECK = gql`
mutation rsvpReadyCheck($readyCheckId: String!, $userId: String!, $reply: String!) {
  rsvpReadyCheck(readyCheckId: $readyCheckId, userId: $userId, reply: $reply) {
    _id
    RSVPs {
      user {
        _id
      }
      reply
    }
  }
}`

export const UPDATE_USER_STATUS = gql`
    mutation updateUserStatus($status: String!) {
        updateUserStatus(status: $status) {
            _id
            status
        }
    }
`;

export const UPDATE_USER_BIO = gql`
  mutation UpdateUserBio($bio: String!) {
    updateUserBio(bio: $bio) {
      _id
      bio
    }
  }
`;

export const ADD_FRIEND = gql`
    mutation followFriend($username: String!) {
      followFriend(username: $username) {
            _id
            friends {
                _id
                username
            }
        }
    }
`;

export const REMOVE_FRIEND = gql`
    mutation unfollowFriend($username: String!) {
      unfollowFriend(username: $username) {
            _id
            friends {
                _id
                username
            }
        }
    }
`;

export const DELETE_NOTIFICATION = gql`
    mutation DeleteNotification($notificationId: ID!) {
        deleteNotification(notificationId: $notificationId) {
            _id
        }
    }
`;

export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        email
      }
    }
  }
`;

export const CREATE_USER = gql`
  mutation createUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const DELETE_USER = gql`
  mutation deleteUser($_id: ID!) {
    deleteUser(_id: $_id) {
      _id
      username
    }
  }
`;


export const SEND_CHAT_MESSAGE = gql`
  mutation SendMessage($readyCheckId: ID!, $userId: ID!, $content: String!) {
    sendMessage(readyCheckId: $readyCheckId, userId: $userId, content: $content) {
      _id
      chatMessages {
        user {
          _id
          username
        }
        content
        timestamp
      }
    }
  }
`;