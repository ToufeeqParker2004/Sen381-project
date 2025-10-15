import React, { useState, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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

const API_BASE_URL = 'http://localhost:9090/messaging';
const STUDENTS_API_BASE_URL = 'http://localhost:9090/student';

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

interface Message {
  id: string;
  senderId: number;
  content: string;
  timestamp: string;
  isOwn: boolean;
  senderName: string;
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

  // Fetch threads function (with silent mode for polling)
  const fetchThreads = async (silent: boolean = false) => {
    if (!currentUserId) return;
    try {
      if (!silent) setIsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/threads/student/${currentUserId}`);
      const threads = res.data || [];

      const enrichedThreads = await Promise.all(
        threads.map(async (thread: { threadId: string; created_at?: string }) => {
          try {
            const [participantsRes, messagesRes] = await Promise.all([
              axios.get(`${API_BASE_URL}/participants/thread/${thread.threadId}`),
              axios.get(`${API_BASE_URL}/messages/thread/${thread.threadId}`),
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

            const lastMsgData = messagesRes.data && messagesRes.data.length > 0
              ? messagesRes.data[messagesRes.data.length - 1]
              : null;

            return {
              id: thread.threadId,
              name: otherParticipants.join(', ') || 'Self Chat',
              lastMessage: lastMsgData ? lastMsgData.content : '',
              timestamp: lastMsgData ? lastMsgData.timestamp : thread.created_at || new Date().toISOString(),
              unread: 0,
              avatar: '/api/placeholder/40/40',
              online: false,
              role: otherParticipants.length > 1 ? 'Group Chat' : 'Direct Chat',
            } as Conversation;
          } catch (err) {
            // Fallback minimal conversation
            return {
              id: thread.threadId,
              name: `Thread ${thread.threadId.slice(0, 8)}`,
              lastMessage: '',
              timestamp: thread.created_at || new Date().toISOString(),
              unread: 0,
              avatar: '/api/placeholder/40/40',
              online: false,
              role: 'Chat',
            } as Conversation;
          }
        })
      );

      // Sort by timestamp descending
      enrichedThreads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setConversations(enrichedThreads);
    } catch (err) {
      console.error('Error fetching threads:', err);
      if (!silent) toast({ title: 'Error', description: 'Failed to load conversations', variant: 'destructive' });
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Initial fetch and polling for threads
  useEffect(() => {
    fetchThreads();
    const interval = setInterval(() => fetchThreads(true), 10000); // Poll every 5 seconds silently
    return () => clearInterval(interval);
  }, [currentUserId, toast]);

  // Fetch chat data function (with silent mode for polling)
  const fetchChatData = async (silent: boolean = false) => {
    if (!selectedChat) return;
    try {
      if (!silent) setIsChatLoading(true);
      const [participantsRes, messagesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/participants/thread/${selectedChat}`),
        axios.get(`${API_BASE_URL}/messages/thread/${selectedChat}`),
      ]);

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

      const msgs: Message[] = (messagesRes.data || []).map((m: any) => ({
        id: m.id,
        senderId: m.senderId,
        content: m.content,
        timestamp: m.timestamp || new Date().toISOString(),
        isOwn: m.senderId === currentUserId,
        senderName: participantData.find((p) => p.studentId === m.senderId)?.studentName || `User ${m.senderId}`,
      }));

      setMessages(msgs);
    } catch (err) {
      console.error('Error fetching chat data:', err);
      if (!silent) toast({ title: 'Error', description: 'Failed to load chat', variant: 'destructive' });
    } finally {
      if (!silent) setIsChatLoading(false);
    }
  };

  // Fetch participants & messages for selected chat, plus polling
  useEffect(() => {
    setMessages([]);
    setParticipants([]);
    if (!selectedChat) {
      setIsChatLoading(false);
      return;
    }
    fetchChatData();
  }, [selectedChat, currentUserId, toast]);

  useEffect(() => {
    if (!selectedChat) return;
    const interval = setInterval(() => fetchChatData(true), 10000); // Poll every 3 seconds silently
    return () => clearInterval(interval);
  }, [selectedChat]);

  // Fetch all students when new message modal opens (only once)
  useEffect(() => {
    if (!isNewMessageModalOpen) return;
    if (allStudents.length > 0) return;

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

    // Prevent duplicate one-on-one
    if (selectedUsers.length === 1) {
      const duplicate = await checkDuplicateOneOnOne(selectedUsers[0]);
      if (duplicate) {
        toast({ title: 'Error', description: 'Chat with this user already exists', variant: 'destructive' });
        return;
      }
    }

    try {
      // Create thread
      const threadResp = await axios.post(`${API_BASE_URL}/threads`, {});
      const threadId = threadResp.data?.threadId || threadResp.data?.id || threadResp.data;

      if (!threadId) {
        throw new Error('Invalid threadId from server');
      }

      // Add current user as participant
      await axios.post(`${API_BASE_URL}/participants`, { threadId, studentId: currentUserId });

      // Add selected users
      await Promise.all(
        selectedUsers.map(async (studentId) => {
          await axios.post(`${API_BASE_URL}/participants`, { threadId, studentId });
        })
      );

      // Build thread name from selectedUsers (fetch names)
      const participantNames = await Promise.all(
        selectedUsers.map(async (id) => {
          try {
            const r = await axios.get(`${STUDENTS_API_BASE_URL}/${id}`);
            return r.data?.name || `User ${id}`;
          } catch {
            return `User ${id}`;
          }
        })
      );

      const threadName = participantNames.join(', ');

      // Insert new conversation at top
      const newConv: Conversation = {
        id: threadId,
        name: threadName,
        lastMessage: '',
        timestamp: threadResp.data?.created_at || new Date().toISOString(),
        unread: 0,
        avatar: '/api/placeholder/40/40',
        online: false,
        role: selectedUsers.length > 1 ? 'Group Chat' : 'Direct Chat',
      };
      setConversations((prev) => [newConv, ...prev]);

      // Open the new chat
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

  // Send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !currentUserId) return;
    try {
      const messageDTO = {
        threadId: selectedChat,
        senderId: currentUserId,
        content: messageText,
        timestamp: new Date().toISOString(),
      };
      const res = await axios.post(`${API_BASE_URL}/messages`, messageDTO);

      setMessages((prev) => [
        ...prev,
        {
          id: res.data?.id || Math.random().toString(36).slice(2, 9),
          senderId: res.data?.senderId || currentUserId,
          content: res.data?.content || messageText,
          timestamp: res.data?.timestamp || new Date().toISOString(),
          isOwn: true,
          senderName: 'You',
        },
      ]);
      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    }
  };

  const toggleSelectUser = (userId: number) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const addEmoji = (emojiData: any) => {
    // emojiData may contain .emoji property depending on version
    const char = emojiData?.emoji ?? emojiData?.native ?? '';
    setMessageText((p) => p + char);
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    messages.forEach((msg) => {
      const msgDate = format(parseISO(msg.timestamp), 'yyyy-MM-dd');
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
    const parsed = parseISO(date);
    if (isToday(parsed)) return 'Today';
    if (isYesterday(parsed)) return 'Yesterday';
    return format(parsed, 'MMMM d, yyyy');
  };
  const formatMessageTime = (timestamp: string) => format(parseISO(timestamp), 'h:mm a');
  const formatConversationTime = (timestamp: string) => formatDistanceToNow(parseISO(timestamp), { addSuffix: true });

  const currentChat = conversations.find((c) => c.id === selectedChat);

  if (!isAuthenticated) return <div>Redirecting to login...</div>;

  return (
    <>
      <div className="space-y-6">
        {/* Header - show on desktop or when on conversations view on mobile */}
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
          <>
            {mobileView === 'conversations' ? (
              <Card className="h-[600px] rounded-xl shadow-md flex flex-col">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Chats</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search messages..." className="pl-9 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-220px)]">
                    <div className="space-y-1 px-2">
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
                          <div className="relative mr-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.avatar} />
                              <AvatarFallback className="text-base font-semibold">
                                {conversation.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>

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
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              currentChat && (
                <Card className="h-[600px] flex flex-col rounded-xl shadow-md">
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

                  <ScrollArea className="flex-1">
                    <CardContent className="p-3">
                      {isChatLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                            <h3 className="text-lg font-semibold mb-2">Loading messages...</h3>
                          </div>
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
                                    {currentChat.role === 'Group Chat' && (
                                      <p className="text-xs font-semibold mb-0.5">{message.isOwn ? 'You' : message.senderName}</p>
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
                  </ScrollArea>

                  {/* Message Input - mobile */}
                  <div className="border-t p-2 bg-background">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1 relative">
                        {/* emoji picker placed relative to this container, adjusted to left-0 for better mobile positioning */}
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
          /* Desktop layout */
          <div className="grid gap-6 lg:grid-cols-3 h-[600px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search messages..." className="pl-9" />
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-1 px-2">
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
                        <div className="relative mr-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
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
                </ScrollArea>
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

                  <ScrollArea className="flex-1">
                    <CardContent className="p-4">
                      {isChatLoading ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground animate-pulse">
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
                                    {currentChat?.role === 'Group Chat' && <p className="text-xs font-semibold mb-1">{message.isOwn ? 'You' : message.senderName}</p>}
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
                  </ScrollArea>

                  {/* Message input - desktop */}
                  <div className="border-t p-4 relative">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1 relative">
                        {/* Emoji picker anchored above the input, left-aligned for consistency */}
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
                          <div className="flex items-center space-x-2">
                            {/* attachment removed as requested */}
                            <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker((s) => !s)}>
                              <Smile className="h-4 w-4" />
                            </Button>
                          </div>
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
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((s) => (
                  <div key={s.id} className="flex items-center space-x-2">
                    <Checkbox id={`user-${s.id}`} checked={selectedUsers.includes(s.id)} onCheckedChange={() => toggleSelectUser(s.id)} />
                    <Label htmlFor={`user-${s.id}`} className="flex-1">
                      {s.name} ({s.email})
                    </Label>
                  </div>
                ))
              ) : searchQuery ? (
                <p className="text-sm text-muted-foreground">No users found.</p>
              ) : (
                <p className="text-sm text-muted-foreground">Type to search users...</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMessageModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateThread}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {deleteType === 'delete'
                ? 'Are you sure you want to delete this conversation? This action cannot be undone.'
                : 'Are you sure you want to leave this conversation?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              if (!deleteThreadId || !currentUserId) return;
              try {
                if (deleteType === 'delete') {
                  await axios.delete(`${API_BASE_URL}/threads/${deleteThreadId}`);
                  toast({ title: 'Success', description: 'Conversation deleted' });
                } else {
                  await axios.delete(`${API_BASE_URL}/participants/${deleteThreadId}/${currentUserId}`);
                  toast({ title: 'Success', description: 'You have left the conversation' });
                }
                setConversations(prev => prev.filter(c => c.id !== deleteThreadId));
                if (selectedChat === deleteThreadId) {
                  setSelectedChat(null);
                  if (isMobile) setMobileView('conversations');
                }
              } catch (err) {
                console.error('Error deleting thread:', err);
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