import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { UPDATE_USER_STATUS } from '../utils/mutations';

function Status() {
    const [newStatus, setStatus] = useState('');
    const history = useHistory


const [updateStatusMutation, { loading, error }] = useMutation(UPDATE_USER_STATUS, {
    onCompleted: (data) => {
        history.push(`/status/${data.updateStatus}`);
    }
});

const statusSubmit = async (e) => {
    e.preventDefault();
    const updateStatus = {
        newStatus
    };
    
    await updateStatusMutation({ variables: { input: { status: updateStatus }}});
};
    return (
        <form onSubmit={statusSubmit}>
            <div>
                <label>Status</label>
                <input
                    type='text'
                    value={newStatus}
                    onChange={(e) => setStatus(e.target.value)}
                />
            </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Status'}
                </button>
            {error && <p>Error updating status: {error.message}</p>}
        </form>
    );
}

export default Status;
