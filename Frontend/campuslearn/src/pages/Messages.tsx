import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  format,
  isToday,
  isYesterday,
  parseISO,
  formatDistanceToNow,
} from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  MessageCircle,
  Search,
  Send,
  Phone,
  MoreVertical,
  Smile,
  Trash,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import EmojiPicker from 'emoji-picker-react';
import supabase from '@/lib/supabase';

const API_BASE_URL = 'http://localhost:9090/messaging';
const STUDENTS_API_BASE_URL = 'http://localhost:9090/student';

// Frontend Interface. 'content' is our internal name.
interface Message {
  id: string;
  senderId: number;
  content: string; // <-- This is our internal state property
  timestamp: string;
  isOwn: boolean;
  senderName: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  online: boolean;
  role: string;
}

interface Participant {
  threadId: string;
  studentId: number;
  studentName?: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
}

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [mobileView, setMobileView] = useState<'conversations' | 'chat'>('conversations');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteThreadId, setDeleteThreadId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'leave' | 'delete'>('leave');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const currentUserId = user ? parseInt(user.id) : null;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // Axios interceptor for JWT
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, []);


  // --- REAL-TIME DATA FETCHING (NO POLLING) ---

  // Helper to fetch details for a single thread
  const enrichThread = useCallback(async (threadId: string, createdAt?: string): Promise<Conversation> => {
    if (!currentUserId) throw new Error("Current user ID is not available");
    try {
      const [participantsRes, messagesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/participants/thread/${threadId}`),
        // This hits your API, which returns a MessageDTO
        axios.get(`${API_BASE_URL}/messages/thread/${threadId}?sort=desc&limit=1`),
      ]);

      const participantsData: Participant[] = participantsRes.data || [];
      const otherParticipants = await Promise.all(
        participantsData
          .filter((p) => p.studentId !== currentUserId)
          .map(async (p) => {
            try {
              const sRes = await axios.get(`${STUDENTS_API_BASE_URL}/${p.studentId}`);
              return sRes.data.name;
            } catch {
              return `User ${p.studentId}`;
            }
          })
      );

      const latestMessage = messagesRes.data && messagesRes.data.length > 0 ? messagesRes.data[0] : null;

      return {
        id: threadId,
        name: otherParticipants.join(', ') || 'Self Chat',
        // *** FIX: Read from 'content' (from MessageDTO) ***
        lastMessage: latestMessage ? latestMessage.content : 'No messages yet',
        timestamp: latestMessage ? latestMessage.timestamp : createdAt || new Date().toISOString(),
        unread: 0,
        avatar: '/api/placeholder/40/40',
        online: false,
        role: otherParticipants.length > 1 ? 'Group Chat' : 'Direct Chat',
      };
    } catch (err) {
      console.error('Error enriching thread:', err);
      // Fallback
      return {
        id: threadId,
        name: `Thread ${threadId.slice(0, 8)}`,
        lastMessage: 'No messages yet',
        timestamp: createdAt || new Date().toISOString(),
        unread: 0,
        avatar: '/api/placeholder/40/40',
        online: false,
        role: 'Chat',
      };
    }
  }, [currentUserId]); // Depends on currentUserId

  // Fetch initial list of threads
  const fetchThreads = useCallback(async (silent: boolean = false) => {
    if (!currentUserId) return;
    try {
      if (!silent) setIsLoading(true);
      // This hits your GET /threads/student/{studentId} endpoint
      const res = await axios.get(`${API_BASE_URL}/threads/student/${currentUserId}`);
      const threads: { threadId: string; created_at?: string }[] = res.data || [];

      const enrichedThreads = await Promise.all(
        threads.map(async (thread) => enrichThread(thread.threadId, thread.created_at))
      );

      enrichedThreads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setConversations(enrichedThreads);
    } catch (err){
      console.error('Error fetching threads:', err);
      if (!silent) toast({ title: 'Error', description: 'Failed to load conversations', variant: 'destructive' });
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [currentUserId, toast, enrichThread]);

  // 1. Initial fetch for threads (runs once)
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // 2. Subscribe to REAL-TIME conversation list changes
  useEffect(() => {
    if (!currentUserId) return;

    // Listens for when *this* user is added/removed from a chat
    const channel = supabase
      .channel(`user_thread_changes_${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT and DELETE
          schema: 'public',
          table: 'thread_participants',
          filter: `student_id=eq.${currentUserId}`,
        },
        async (payload) => {
          
          if (payload.eventType === 'INSERT') {
            console.log('User added to new thread:', payload);
            const newThreadId = payload.new.thread_id;
            const newConversation = await enrichThread(newThreadId, payload.new.created_at);
            
            setConversations((prev) => {
              // Add new chat to the top, avoiding duplicates
              if (prev.find(c => c.id === newConversation.id)) return prev;
              return [newConversation, ...prev];
            });

          } else if (payload.eventType === 'DELETE') {
            console.log('User removed from thread:', payload);
            const removedThreadId = payload.old.thread_id;
            if (!removedThreadId) return;
            
            setConversations((prev) => prev.filter(c => c.id !== removedThreadId));
            
            if (selectedChat === removedThreadId) {
              setSelectedChat(null);
              if (isMobile) setMobileView('conversations');
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, enrichThread, isMobile, selectedChat]);

  // 3. Fetch initial chat data when a chat is selected
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      setParticipants([]);
      return;
    }

    const fetchInitialChatData = async () => {
      try {
        setIsChatLoading(true);
        const [participantsRes, messagesRes] = await Promise.all([
          // This returns List<ThreadParticipantDTO>
          axios.get(`${API_BASE_URL}/participants/thread/${selectedChat}`),
          // This returns List<MessageDTO>
          axios.get(`${API_BASE_URL}/messages/thread/${selectedChat}`),
        ]);

        // A. Load Participants
        const participantData: Participant[] = await Promise.all(
          (participantsRes.data || []).map(async (p: Participant) => {
            try {
              const sRes = await axios.get(`${STUDENTS_API_BASE_URL}/${p.studentId}`);
              return { ...p, studentName: sRes.data.name };
            } catch {
              return { ...p, studentName: `User ${p.studentId}` };
            }
          })
        );
        setParticipants(participantData);

        // B. Load Messages
        const msgs: Message[] = (messagesRes.data || []).map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          // *** FIX: Read from 'content' (from MessageDTO) ***
          content: m.content,
          timestamp: m.timestamp || new Date().toISOString(),
          isOwn: m.senderId === currentUserId,
          // *** FIX (TYPO): Use p.studentId (from Participant DTO) ***
          senderName: participantData.find((p) => p.studentId === m.senderId)?.studentName || `User ${m.senderId}`,
        }));

        msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMessages(msgs);

        // *** FIX (RACE CONDITION):
        // Re-map sender names for any messages that arrived via Supabase *before*
        // the participant list was finished loading.
        setMessages(prevMsgs => 
          prevMsgs.map(msg => {
            // If the senderName is a placeholder, try to find the real name
            if (msg.senderName.startsWith('User ')) {
              const participant = participantData.find(p => p.studentId === msg.senderId);
              if (participant && participant.studentName) {
                return { ...msg, senderName: participant.studentName };
              }
            }
            return msg; // Otherwise, keep the message as is
          })
        );

      } catch (err) {
        console.error('Error fetching chat data:', err);
        toast({ title: 'Error', description: 'Failed to load chat', variant: 'destructive' });
      } finally {
        setIsChatLoading(false);
      }
    };

    fetchInitialChatData();
  }, [selectedChat, currentUserId, toast]);

  // 4. Subscribe to REAL-TIME messages for the *selected* chat
  useEffect(() => {
    if (!selectedChat) return;

    // This listens to the *database* 'messages' table
    const channel = supabase
      .channel(`messages_thread_${selectedChat}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${selectedChat}`,
        },
        (payload) => {
          console.log('Realtime event:', payload);

          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new;

            // ** FIX: Ignore echos of our own messages (handled by optimistic UI)
            if (newMsg.sender_id === currentUserId) {
              return;
            }

            // This code now only runs for messages from *other* users
            const newMessage: Message = {
              id: newMsg.id,
              senderId: newMsg.sender_id,
              // *** FIX: Read from 'message_text' (from DB column) ***
              content: newMsg.message_text,
              timestamp: newMsg.timestamp || new Date().toISOString(),
              isOwn: false,
              senderName:
                participants.find((p) => p.studentId === newMsg.sender_id)
                  ?.studentName || `User ${newMsg.sender_id}`, // This might fail in a race, but the loader-effect will patch it
            };

            setMessages((prev) => {
              const updated = [...prev, newMessage];
              updated.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
              return updated;
            });

            // Update conversation list with new last message and re-sort
            setConversations(prev => {
              const updatedList = prev.map(conv => 
                conv.id === selectedChat 
                  ? { 
                      ...conv, 
                      // *** FIX: Read from 'message_text' (from DB column) ***
                      lastMessage: newMsg.message_text,
                      timestamp: newMsg.timestamp || new Date().toISOString()
                    }
                  : conv
              );
              updatedList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              return updatedList;
            });
            
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) => {
              const updated = prev.map((m) =>
                m.id === payload.new.id
                  ? {
                      ...m,
                      // *** FIX: Read from 'message_text' (from DB column) ***
                      content: payload.new.message_text,
                      timestamp: payload.new.timestamp || m.timestamp,
                    }
                  : m
              );
              updated.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat, currentUserId, participants]); // No infinite loop

  // --- END REAL-TIME ---

  // Fetch all students when new message modal opens
  useEffect(() => {
    if (!isNewMessageModalOpen || allStudents.length > 0) return;

    const fetchAllStudents = async () => {
      try {
        const res = await axios.get(STUDENTS_API_BASE_URL);
        const students: Student[] = (res.data || []).filter((s: Student) => s.id !== currentUserId);
        setAllStudents(students);
      } catch (err) {
        console.error('Error fetching students:', err);
        toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
      }
    };
    fetchAllStudents();
  }, [isNewMessageModalOpen, allStudents.length, currentUserId, toast]);

  // Local search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = allStudents.filter((s) =>
      s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
    setSearchResults(results);
  }, [searchQuery, allStudents]);

  // Helper: prevent duplicate one-on-one chat
  const checkDuplicateOneOnOne = async (selectedUserId: number) => {
    try {
      const res = await axios.get(`${STUDENTS_API_BASE_URL}/${selectedUserId}`);
      const selectedUserName = res.data?.name;
      if (!selectedUserName) return false;
      return conversations.some(
        (conv) => conv.role === 'Direct Chat' && conv.name === selectedUserName
      );
    } catch {
      return false;
    }
  };

  // Create thread handler used by New Message modal
  const handleCreateThread = async () => {
    if (!currentUserId) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      return;
    }
    if (selectedUsers.length === 0) {
      toast({ title: 'Warning', description: 'Select at least one user', variant: 'destructive' });
      return;
    }

    if (selectedUsers.length === 1) {
      const duplicate = await checkDuplicateOneOnOne(selectedUsers[0]);
      if (duplicate) {
        toast({ title: 'Error', description: 'Chat with this user already exists', variant: 'destructive' });
        return;
      }
    }

    try {
      // Create thread - This hits POST /threads with an empty DTO
      // Your backend controller populates it.
      const threadResp = await axios.post(`${API_BASE_URL}/threads`, {});
      const threadId = threadResp.data?.threadId || threadResp.data?.id || threadResp.data;

      if (!threadId) throw new Error('Invalid threadId from server');

      // Add current user as participant
      await axios.post(`${API_BASE_URL}/participants`, { threadId, studentId: currentUserId });

      // Add selected users
      await Promise.all(
        selectedUsers.map(async (studentId) => {
          await axios.post(`${API_BASE_URL}/participants`, { threadId, studentId });
        })
      );

      // The real-time subscription on 'thread_participants' will
      // automatically add this new thread to our list.
      // We just need to open it.

      setSelectedChat(threadId);
      if (isMobile) setMobileView('chat');

      // Reset modal state
      setIsNewMessageModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);

      toast({ title: 'Success', description: 'Conversation created' });
    } catch (err) {
      console.error('Error creating thread:', err);
      toast({ title: 'Error', description: 'Failed to create conversation', variant: 'destructive' });
    }
  };

  // Send message with OPTIMISTIC UI
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !currentUserId) return;
    
    // --- START OPTIMISTIC UI ---
    
    const messageContent = messageText;
    const newTimestamp = new Date().toISOString();
    const tempId = `temp_${Date.now()}`;

    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUserId,
      content: messageContent, // Use internal 'content' property
      timestamp: newTimestamp,
      isOwn: true,
      senderName: 'You',
    };

    setMessages((prev) => {
      const updated = [...prev, optimisticMessage];
      updated.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return updated;
    });

    setConversations(prev => {
      const updatedList = prev.map(conv => 
        conv.id === selectedChat 
          ? { 
              ...conv, 
              lastMessage: messageContent,
              timestamp: newTimestamp
            }
          : conv
      );
      updatedList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return updatedList;
    });

    setMessageText('');

    // --- END OPTIMISTIC UI ---

    // 6. Send to backend in background
    try {
      const messageDTO = {
        threadId: selectedChat,
        senderId: currentUserId,
        // *** FIX: Send 'content' to match MessageDTO.java ***
        content: messageContent,
        timestamp: newTimestamp,
      };
      
      // This hits POST /messages
      await axios.post(`${API_BASE_URL}/messages`, messageDTO);
      
    } catch (err) {
      console.error('Error sending message:', err);
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
      // Rollback on failure
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      setMessageText(messageContent);
    }
  };

  const toggleSelectUser = (userId: number) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const addEmoji = (emojiData: any) => {
    const char = emojiData?.emoji ?? emojiData?.native ?? '';
    setMessageText((p) => p + char);
  };

  // --- Date Formatting and Grouping ---

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    
    messages.forEach((msg) => {
      const validTimestamp = msg.timestamp || new Date().toISOString();
      const msgDate = format(parseISO(validTimestamp), 'yyyy-MM-dd');
      
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    
    return groups;
  };

  const formatDateHeader = (date: string) => {
    try {
      const parsed = parseISO(date);
      if (isToday(parsed)) return 'Today';
      if (isYesterday(parsed)) return 'Yesterday';
      return format(parsed, 'MMMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      const validTimestamp = timestamp || new Date().toISOString();
      return format(parseISO(validTimestamp), 'h:mm a');
    } catch {
      return 'Unknown time';
    }
  };

  const formatConversationTime = (timestamp: string) => {
    try {
      const validTimestamp = timestamp || new Date().toISOString();
      return formatDistanceToNow(parseISO(validTimestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const currentChat = conversations.find((c) => c.id === selectedChat);

  if (!isAuthenticated) return <div>Redirecting to login...</div>;

  // --- RENDER ---

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        {(!isMobile || mobileView === 'conversations') && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-muted-foreground">Connect with tutors and classmates</p>
            </div>
            <Button className="bg-gradient-primary hover:opacity-90" onClick={() => setIsNewMessageModalOpen(true)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        )}

        {isMobile ? (
          // --- MOBILE VIEW ---
          <>
            {mobileView === 'conversations' ? (
              // Mobile: Conversations List
              <Card className="h-[calc(100vh-120px)] rounded-xl shadow-md">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Chats</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search messages..." className="pl-9 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
                    {isLoading ? (
                      <div className="p-4 text-center text-muted-foreground animate-pulse">Loading conversations...</div>
                    ) : conversations.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">No conversations yet.</div>
                    ) : (
                      conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className="flex items-center p-3 cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted rounded-md mx-2"
                          onClick={() => { setSelectedChat(conversation.id); setMobileView('chat'); }}
                        >
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback className="text-base font-semibold">
                              {conversation.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate text-base">{conversation.name}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">{formatConversationTime(conversation.timestamp)}</span>
                                {conversation.unread > 0 && (
                                  <Badge className="h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center bg-primary">
                                    {conversation.unread}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mt-1">{conversation.lastMessage}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Mobile: Chat Window
              currentChat && (
                <Card className="h-[calc(100vh-80px)] flex flex-col rounded-xl shadow-md">
                  <CardHeader className="border-b p-3">
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setMobileView('conversations')}
                        className="p-2"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentChat.avatar} />
                        <AvatarFallback>{currentChat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{currentChat.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {currentChat.online ? 'Online' : 'Last seen recently'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setDeleteThreadId(selectedChat); setDeleteType('delete'); setIsDeleteConfirmOpen(true); }}>
                          <Trash className="h-5 w-5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setDeleteThreadId(selectedChat); setDeleteType('leave'); setIsDeleteConfirmOpen(true); }}>
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Leave Conversation</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-3 overflow-y-auto">
                    {isChatLoading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <MessageCircle className="h-12 w-12 text-muted-foreground animate-pulse" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {groupMessagesByDate(messages).map((group, index) => (
                          <React.Fragment key={index}>
                            <div className="flex justify-center my-3">
                              <Badge variant="secondary" className="px-2 py-0.5 text-xs rounded-full">
                                {formatDateHeader(group.date)}
                              </Badge>
                            </div>
                            {group.messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-sm ${message.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                                >
                                  {currentChat.role === 'Group Chat' && !message.isOwn && (
                                    <p className="text-xs font-semibold mb-0.5">{message.senderName}</p>
                                  )}
                                  <p>{message.content}</p>
                                  <p className={`text-xs mt-0.5 ${message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {formatMessageTime(message.timestamp)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  {/* Message Input - mobile */}
                  <div className="border-t p-2 bg-background">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1 relative">
                        {showEmojiPicker && (
                          <div className="absolute bottom-full mb-2 left-0 z-50 w-full max-w-xs">
                            <EmojiPicker onEmojiClick={addEmoji} />
                          </div>
                        )}
                        <div className="flex items-center space-x-2 bg-muted rounded-full px-3 py-1.5">
                          <Textarea
                            placeholder="Message..."
                            className="min-h-[36px] max-h-24 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button variant="ghost" size="sm" className="p-1" onClick={() => setShowEmojiPicker((s) => !s)}>
                            <Smile className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!messageText.trim()}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 rounded-full p-2"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            )}
          </>
        ) : (
          // --- DESKTOP LAYOUT ---
          <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search messages..." className="pl-9" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground animate-pulse">Loading conversations...</div>
                  ) : conversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No conversations yet.</div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`flex items-center p-4 cursor-pointer transition-colors hover:bg-muted/50 ${selectedChat === conversation.id ? 'bg-primary/10 border-r-2 border-primary' : ''}`}
                        onClick={() => setSelectedChat(conversation.id)}
                      >
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{conversation.name}</h4>
                            <span className="text-xs text-muted-foreground">{formatConversationTime(conversation.timestamp)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                          <p className="text-xs text-muted-foreground">{conversation.role}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Window */}
            <Card className="lg:col-span-2 flex flex-col">
              {selectedChat ? (
                <>
                  <CardHeader className="border-b flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentChat?.avatar} />
                        <AvatarFallback>{currentChat?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{currentChat?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {participants.filter(p => p.studentId !== currentUserId).map(p => p.studentName || p.studentId).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setDeleteThreadId(selectedChat); setDeleteType('delete'); setIsDeleteConfirmOpen(true); }}>
                        <Trash className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setDeleteThreadId(selectedChat); setDeleteType('leave'); setIsDeleteConfirmOpen(true); }}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Leave Conversation</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-4 overflow-y-auto">
                    {isChatLoading ? (
                      <div className="flex-1 flex items-center justify-center text-muted-foreground animate-pulse">
                        Loading messages...
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {groupMessagesByDate(messages).map((group, index) => (
                          <React.Fragment key={index}>
                            <div className="flex justify-center my-4">
                              <Badge variant="secondary" className="px-3 py-1 text-sm">{formatDateHeader(group.date)}</Badge>
                            </div>
                            {group.messages.map((message) => (
                              <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                  {currentChat?.role === 'Group Chat' && !message.isOwn && (
                                    <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                                  )}
                                  <p className="text-sm">{message.content}</p>
                                  <p className={`text-xs mt-1 ${message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatMessageTime(message.timestamp)}</p>
                                </div>
                              </div>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  {/* Message input - desktop */}
                  <div className="border-t p-4 relative">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1 relative">
                        {showEmojiPicker && (
                          <div className="absolute bottom-full mb-2 left-0 z-50">
                            <EmojiPicker onEmojiClick={addEmoji} />
                          </div>
                        )}
                        <Textarea
                          placeholder="Type your message..."
                          className="min-h-[40px] max-h-32 resize-none"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker((s) => !s)}>
                            <Smile className="h-4 w-4" />
                          </Button>
                          <Button onClick={handleSendMessage} disabled={!messageText.trim()} className="bg-gradient-primary hover:opacity-90">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">Choose a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <Dialog open={isNewMessageModalOpen} onOpenChange={setIsNewMessageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search users</Label>
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {(searchQuery ? searchResults : allStudents).map((student) => (
                <div key={student.id} className="flex items-center space-x-3 p-2 rounded-lg border">
                  <Checkbox
                    checked={selectedUsers.includes(student.id)}
                    onCheckedChange={() => toggleSelectUser(student.id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMessageModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateThread} disabled={selectedUsers.length === 0}>
              Create Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete/Leave Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteType === 'delete' ? 'Delete Conversation' : 'Leave Conversation'}</DialogTitle>
            <DialogDescription>
              {deleteType === 'delete' 
                ? 'Are you sure you want to delete this conversation? This action cannot be undone.'
                : 'Are you sure you want to leave this conversation? You will no longer receive messages from this chat.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              if (!deleteThreadId || !currentUserId) return;
              try {
                if (deleteType === 'delete') {
                  // This hits DELETE /threads/{threadId}
                  await axios.delete(`${API_BASE_URL}/threads/${deleteThreadId}`);
                  toast({ title: 'Success', description: 'Conversation deleted' });
                } else {
                  // This hits DELETE /participants/{threadId}/{studentId}
                  await axios.delete(`${API_BASE_URL}/participants/${deleteThreadId}/${currentUserId}`);
                  toast({ title: 'Success', description: 'You have left the conversation' });
                }
                // The real-time 'DELETE' handler for 'thread_participants'
                // will automatically remove the chat from the list.
              } catch (err) {
                console.error('Error deleting/leaving thread:', err);
                toast({ title: 'Error', description: 'Failed to perform action', variant: 'destructive' });
              } finally {
                setDeleteThreadId(null);
                setIsDeleteConfirmOpen(false);
              }
            }}>
              {deleteType === 'delete' ? 'Delete' : 'Leave'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}