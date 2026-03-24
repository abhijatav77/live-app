import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { 
    createSession, 
    endSession, 
    getSession, 
    joinSession, 
    leaveSession, 
    listSession 
} from '../controller/sessionController.js';

const router = express.Router();

// Validation middleware
const handleValidationError = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors.array()[0].msg
        });
    }
    next();
};

// All routes require authentication
router.use(protect);

// GET /api/session/list - List all sessions for user
router.get('/list', listSession);

// POST /api/session/create - Create a new session
router.post('/create', createSession);

// POST /api/session/join - Join an existing session
router.post(
    '/join',
    [
        body('roomId')
            .trim()
            .notEmpty()
            .withMessage('RoomId is required'),
    ],
    handleValidationError,
    joinSession
);

// GET /api/session/:roomId - Get session details by roomId
router.get('/:roomId', getSession);

// POST /api/session/end/:sessionId - End a session (host only)
router.post('/end/:sessionId', endSession);

// POST /api/session/leave - Leave a session
router.post(
    '/leave',
    [
        body('roomId')
            .trim()
            .notEmpty()
            .withMessage('RoomId is required'),
    ],
    handleValidationError,
    leaveSession
);

export default router;