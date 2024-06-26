import React from 'react'; // Don't forget to import React
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { QUERY_USER, QUERY_ME } from '../utils/queries';
import Auth from '../utils/auth';

const UserCheck = ({ children }) => {
  const navigate = useNavigate();
  const { username: userParam } = useParams();
  const token = Auth.loggedIn() ? Auth.getToken() : null;
  const userAuth = Auth.getProfile();

  const { loading, data, refetch } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
    variables: { username: userParam },
  });

  // Check if the user is authenticated
  if (!token || !userAuth) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">You're not logged in!</h1>
            <p className="py-6">Please log in or sign up to use the app.</p>
            <button onClick={() => navigate('/login')} className="btn btn-primary m-2">Login</button>
            <button onClick={() => navigate('/signup')} className="btn btn-primary m-2">Sign Up</button>
          </div>
        </div>
      </div>
    );
  }

  // Continue rendering the children if the user is authenticated
  return React.cloneElement(children, { user: data?.me || data?.getUser || {}, refetch });
};

export default UserCheck;