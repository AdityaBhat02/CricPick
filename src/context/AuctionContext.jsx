import React, { createContext, useContext, useState, useEffect } from 'react';

const AuctionContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuction = () => useContext(AuctionContext);

const API_URL = 'http://localhost:3000/api';

export const AuctionProvider = ({ children }) => {
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [teamsRes, playersRes] = await Promise.all([
                fetch(`${API_URL}/teams`),
                fetch(`${API_URL}/players`)
            ]);
            const teamsData = await teamsRes.json();
            const playersData = await playersRes.json();

            setTeams(teamsData);
            setPlayers(playersData);
        } catch (err) {
            setError('Failed to fetch data. Is the server running?');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Team Actions
    const addTeam = async (team) => {
        try {
            const res = await fetch(`${API_URL}/teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(team),
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error("Error adding team:", err);
        }
    };

    const deleteTeam = async (id) => {
        try {
            await fetch(`${API_URL}/teams/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error("Error deleting team:", err);
        }
    };

    // Player Actions
    const addPlayer = async (playerData) => {
        try {
            const isFormData = playerData instanceof FormData;
            const options = {
                method: 'POST',
                body: isFormData ? playerData : JSON.stringify(playerData),
            };

            if (!isFormData) {
                options.headers = { 'Content-Type': 'application/json' };
            }

            const res = await fetch(`${API_URL}/players`, options);
            if (res.ok) fetchData();
        } catch (err) {
            console.error("Error adding player:", err);
        }
    };

    const deletePlayer = async (id) => {
        try {
            await fetch(`${API_URL}/players/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error("Error deleting player:", err);
        }
    };

    const updatePlayer = async (id, data) => {
        try {
            console.log(`[CLIENT] Updating player ${id} with`, data);
            const res = await fetch(`${API_URL}/players/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                console.log('[CLIENT] Update successful');
                fetchData();
            } else {
                console.error('[CLIENT] Update failed:', res.status, res.statusText);
            }
        } catch (err) {
            console.error("Error updating player:", err);
        }
    };

    // Auction Actions
    const sellPlayer = async (playerId, teamId, amount) => {
        try {
            const res = await fetch(`${API_URL}/auction/sell`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId, teamId, amount }),
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error("Error selling player:", err);
        }
    };

    return (
        <AuctionContext.Provider value={{
            teams,
            players,
            settings: { defaultBudget: 10000000, minBidIncrease: 200000 }, // Keep settings local for now or move to DB later
            loading,
            error,
            addTeam,
            deleteTeam,
            addPlayer,
            deletePlayer,
            updatePlayer,
            sellPlayer
        }}>
            {children}
        </AuctionContext.Provider>
    );
};
