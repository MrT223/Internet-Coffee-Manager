'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChatNotification = () => useContext(ChatContext);

// Shared socket instance
let sharedSocket = null;
let isInitialized = false; // Flag để ngăn duplicate initialization

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasUnread, setHasUnread] = useState(false);
    const userRef = useRef(user);
    const userIdRef = useRef(null); // Track user ID để detect thay đổi user thực sự

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3636";

    // Update ref when user changes
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        if (!user) {
            // Clear when logout
            setUnreadCount(0);
            setHasUnread(false);
            isInitialized = false;
            userIdRef.current = null;
            return;
        }

        const currentUserId = user.user_id || user.id;
        
        // Chỉ initialize nếu chưa init HOẶC user ID thay đổi (login với user khác)
        if (isInitialized && userIdRef.current === currentUserId) {
            return; // Đã init rồi, không cần làm lại
        }

        userIdRef.current = currentUserId;
        isInitialized = true;

        // Create or reuse socket
        if (!sharedSocket) {
            sharedSocket = io(SOCKET_URL, { 
                autoConnect: true,
                reconnection: true,
            });
        }

        // Identify user
        sharedSocket.emit("identify", {
            id: currentUserId,
            user_id: currentUserId,
            name: user.user_name || user.name,
            user_name: user.user_name || user.name,
            role_id: user.role_id
        });

        // Request unread count from server - CHỈ 1 LẦN
        console.log('[ChatContext] Requesting unread count...');
        sharedSocket.emit("get_unread_count");

        // Listen for unread count from server
        const handleUnreadCount = (count) => {
            console.log('[ChatContext] Received unread count:', count);
            setUnreadCount(count);
            setHasUnread(count > 0);
        };

        // Listen for new messages (real-time)
        const handleMessage = (msg) => {
            const currentUser = userRef.current;
            if (!currentUser) return;
            
            const myId = String(currentUser.user_id || currentUser.id);
            const senderId = String(msg.sender_id);
            
            // Không tính tin nhắn của chính mình
            if (senderId === myId) return;
            
            console.log('[ChatContext] Received message:', msg, 'My role:', currentUser.role_id);
            
            // Admin: nhận tin từ user (role_id = 3)
            if ((currentUser.role_id === 1 || currentUser.role_id === 2) && msg.role_id === 3) {
                console.log('[ChatContext] Admin received message from user, setting unread');
                setUnreadCount(prev => prev + 1);
                setHasUnread(true);
            }
            
            // User: nhận tin từ admin (role_id = 1 hoặc 2)
            if (currentUser.role_id === 3 && (msg.role_id === 1 || msg.role_id === 2)) {
                console.log('[ChatContext] User received message from admin, setting unread');
                setUnreadCount(prev => prev + 1);
                setHasUnread(true);
            }
        };

        const handleNewConversation = () => {
            const currentUser = userRef.current;
            if (currentUser && (currentUser.role_id === 1 || currentUser.role_id === 2)) {
                setUnreadCount(prev => prev + 1);
                setHasUnread(true);
            }
        };

        sharedSocket.on("unread_count", handleUnreadCount);
        sharedSocket.on("receive_message", handleMessage);
        sharedSocket.on("new_conversation", handleNewConversation);

        return () => {
            sharedSocket.off("unread_count", handleUnreadCount);
            sharedSocket.off("receive_message", handleMessage);
            sharedSocket.off("new_conversation", handleNewConversation);
        };
    }, [user, SOCKET_URL]);

    // Clear unread và mark as read
    const clearUnread = useCallback((conversationId) => {
        console.log('[ChatContext] Clearing unread');
        setUnreadCount(0);
        setHasUnread(false);
        
        // Mark as read on server nếu có conversation_id
        if (conversationId && sharedSocket) {
            sharedSocket.emit("mark_as_read", { conversation_id: conversationId });
        }
    }, []);

    // Mark specific conversation as read
    const markAsRead = useCallback((conversationId) => {
        if (conversationId && sharedSocket) {
            console.log('[ChatContext] Marking as read:', conversationId);
            sharedSocket.emit("mark_as_read", { conversation_id: conversationId });
            // Refresh unread count
            sharedSocket.emit("get_unread_count");
        }
    }, []);

    // Get shared socket for other components
    const getSocket = useCallback(() => {
        if (!sharedSocket) {
            sharedSocket = io(SOCKET_URL, { 
                autoConnect: true,
                reconnection: true,
            });
        }
        return sharedSocket;
    }, [SOCKET_URL]);

    return (
        <ChatContext.Provider value={{ unreadCount, hasUnread, clearUnread, markAsRead, getSocket }}>
            {children}
        </ChatContext.Provider>
    );
};
