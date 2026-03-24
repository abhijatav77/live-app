import Session from "../model/Session.js";
import User from "../model/User.js";

export const listSession = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { status } = req.query;

        const statusFilter = status && status !== 'all' ? { status } : {};

        const sessions = await Session.find({
            $and: [
                statusFilter,
                {
                    $or: [
                        { host: userId },
                        { 'participants.userId': userId }
                    ]
                }
            ]
        }).sort({ createdAt: -1 });

        const result = sessions.map((s) => ({
            id: s._id,
            roomId: s.roomId,
            hostName: s.hostName,
            status: s.status,
            participantCount: s.participants.length || 0,
            startedAt: s.startedAt,
            endedAt: s.endedAt,
            isHost: s.host.toString() === userId.toString(),
        }));
        
        res.json({
            success: true,
            data: {
                sessions: result
            }
        });
    } catch (error) {
        next(error);
    }
};

export const createSession = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Generate unique room id
        let roomId;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            roomId = Session.generateRoomId();
            const exists = await Session.roomIdExists(roomId);
            if (!exists) break;
            attempts++;
        } while (attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate unique room Id. Please try again!'
            });
        }

        const session = await Session.create({
            roomId,
            host: userId,
            hostName: user.name,
            participants: [{
                userId: userId,
                userName: user.name,
            }]
        });

        res.status(201).json({
            success: true,
            data: {
                session: {
                    id: session._id,
                    roomId: session.roomId,
                    hostName: session.hostName,
                    status: session.status,
                    participantCount: session.participants.length,
                    startedAt: session.startedAt,
                    participants: session.participants,
                    isHost: true
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const joinSession = async (req, res, next) => {
    try {
        const { roomId } = req.body;
        const userId = req.user.userId;

        if (!roomId) {
            return res.status(400).json({
                success: false,
                error: 'Room Id is required'
            });
        }

        const session = await Session.findOne({ roomId });
        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Session not found. Please check the roomId"
            });
        }

        if (session.status !== 'active') {
            return res.status(400).json({
                success: false,
                error: 'This session has ended'
            });
        }

        // Check if user already joined session
        const alreadyJoined = session.participants.some(
            p => p.userId.toString() === userId.toString()
        );

        if (alreadyJoined) {
            return res.json({
                success: true,
                data: {
                    session: {
                        id: session._id,
                        roomId: session.roomId,
                        hostName: session.hostName,
                        status: session.status,
                        participantCount: session.participants.length,
                        isHost: session.host.toString() === userId.toString(),
                        participants: session.participants,
                    }
                }
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        session.participants.push({
            userId: userId,
            userName: user.name
        });

        await session.save();
        
        res.json({
            success: true,
            data: {
                session: {
                    id: session._id,
                    roomId: session.roomId,
                    hostName: session.hostName,
                    status: session.status,
                    participantCount: session.participants.length,
                    isHost: session.host.toString() === userId.toString(),
                    participants: session.participants,
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getSession = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.userId;

        const session = await Session.findOne({ roomId });
        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Session not found. Please check the roomId"
            });
        }

        const isParticipant = session.participants.some(
            p => p.userId.toString() === userId.toString()
        );

        const isHost = session.host.toString() === userId.toString();

        // If user is not a participant and not the host, they can't view session details
        if (!isParticipant && !isHost) {
            return res.status(403).json({
                success: false,
                error: "You don't have access to this session"
            });
        }

        res.json({
            success: true,
            data: {
                session: {
                    id: session._id,
                    roomId: session.roomId,
                    hostName: session.hostName,
                    status: session.status,
                    participantCount: session.participants.length,
                    isHost: isHost,
                    isParticipant: isParticipant,
                    participants: session.participants,
                    startedAt: session.startedAt,
                    endedAt: session.endedAt,
                    createdAt: session.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const endSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.userId;

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Session not found."
            });
        }

        // Verify user is the host
        if (session.host.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                error: "Only the host can end the session"
            });
        }

        // Check if already ended
        if (session.status === 'ended') {
            return res.status(400).json({
                success: false,
                error: 'Session has already ended'
            });
        }

        session.status = 'ended';
        session.endedAt = new Date();
        await session.save();

        res.json({
            success: true,
            data: {
                session: {
                    id: session._id,
                    roomId: session.roomId,
                    status: session.status,
                    endedAt: session.endedAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const leaveSession = async (req, res, next) => {
    try {
        const { roomId } = req.body;
        const userId = req.user.userId;

        if (!roomId) {
            return res.status(400).json({
                success: false,
                error: 'Room Id is required'
            });
        }

        const session = await Session.findOne({ roomId });
        if (!session) {
            return res.status(404).json({
                success: false,
                error: "Session not found."
            });
        }

        // Check if user is the host
        const isHost = session.host.toString() === userId.toString();
        
        if (isHost) {
            // If host is leaving, end the session
            session.status = 'ended';
            session.endedAt = new Date();
            await session.save();
            
            return res.json({
                success: true,
                data: {
                    message: 'Session ended successfully',
                    sessionEnded: true
                }
            });
        }

        // Remove participant
        const wasParticipant = session.participants.some(
            p => p.userId.toString() === userId.toString()
        );

        if (!wasParticipant) {
            return res.status(400).json({
                success: false,
                error: "You are not a participant in this session"
            });
        }

        session.participants = session.participants.filter(
            p => p.userId.toString() !== userId.toString()
        );

        await session.save();

        res.json({
            success: true,
            data: {
                message: 'Left session successfully',
                participantCount: session.participants.length
            }
        });
    } catch (error) {
        next(error);
    }
};