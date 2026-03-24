import { createContext, useCallback, useContext, useState } from "react";
import { API_ENDPOINTS } from "../utils/constants";
import api from "../services/api";


const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [currentSession, setCurrentSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessions, setSessions] = useState([]);

    // Create a new session
    const createSession = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.post(API_ENDPOINTS.SESSION.CREATE);
            const session = response.data.data.session;

            setCurrentSession(session);
            return { success: true, session };
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to create new session";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Join session
    const joinSession = useCallback(async (roomId) => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.post(API_ENDPOINTS.SESSION.JOIN, { roomId });
            const session = response.data.data.session;

            setCurrentSession(session);
            return { success: true, session };
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to join session";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Get session by roomId
    const getSession = useCallback(async (roomId) => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.get(`${API_ENDPOINTS.SESSION.GET}/${roomId}`);
            const session = response.data.data.session;

            setCurrentSession(session);
            return { success: true, session };
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to get session";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Leave session
    const leaveSession = useCallback(async (roomId) => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.post(API_ENDPOINTS.SESSION.LEAVE, { roomId });
            
            // Clear current session if it's the one we're leaving
            if (currentSession?.roomId === roomId) {
                setCurrentSession(null);
            }
            
            // Refresh session list
            await listSessions();
            
            return { success: true, data: response.data.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to leave session";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [currentSession]);

    // End session (host only)
    const endSession = useCallback(async (sessionId) => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.post(`${API_ENDPOINTS.SESSION.END}/${sessionId}`);
            
            // Clear current session if it's the one we're ending
            if (currentSession?.id === sessionId) {
                setCurrentSession(null);
            }
            
            // Refresh session list
            await listSessions();
            
            return { success: true, data: response.data.data };
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to end session";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [currentSession]);

    // List sessions
    const listSessions = useCallback(async (status = 'all') => {
        try {
            setError(null);
            setLoading(true);
            const response = await api.get(API_ENDPOINTS.SESSION.LIST, {
                params: { status }
            });
            const sessionsData = response.data.data.sessions;
            
            setSessions(sessionsData);
            return { success: true, sessions: sessionsData };
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to fetch sessions";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Clear current session
    const clearSession = useCallback(() => {
        setCurrentSession(null);
        setError(null);
    }, []);

    // Clear all sessions from state
    const clearSessions = useCallback(() => {
        setSessions([]);
    }, []);

    // Reset all state
    const resetSessionState = useCallback(() => {
        setCurrentSession(null);
        setSessions([]);
        setError(null);
        setLoading(false);
    }, []);

    const value = {
        currentSession,
        sessions,
        loading,
        error,
        createSession,
        joinSession,
        getSession,
        leaveSession,
        endSession,
        listSessions,
        clearSession,
        clearSessions,
        resetSessionState,
        setError
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

export default SessionContext;