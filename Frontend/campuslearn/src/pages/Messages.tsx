import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isToday, isYesterday, parseISO, formatDistanceToNow } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { MessageCircle, Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, Trash, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteThreadId, setDeleteThreadId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'leave' | 'delete'>('leave');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  const currentUserId = user ? parseInt(user.id) : null;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Axios interceptor for JWT
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Fetch user-specific threads with polling
  useEffect(() => {
    if (currentUserId) {
      const fetchThreads = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/threads/student/${currentUserId}`);
          const threads = response.data;
          const enrichedThreads = await Promise.all(
            threads.map(async (thread: { threadId: string; created_at: string }) => {
              // Fetch messages for lastMessage
              const messagesRes = await axios.get(`${API_BASE_URL}/messages/thread/${thread.threadId}`);
              const lastMessage = messagesRes.data.length > 0 ? messagesRes.data[messagesRes.data.length - 1].content : '';

              // Fetch participants for thread name, excluding self
              let threadName = `Thread ${thread.threadId.slice(0, 8)}`;
              let role = 'Direct Chat';
              try {
                const participantsRes = await axios.get(`${API_BASE_URL}/participants/thread/${thread.threadId}`);
                const participantData = await Promise.all(
                  participantsRes.data.map(async (p: Participant) => {
                    try {
                      const studentRes = await axios.get(`${STUDENTS_API_BASE_URL}/${p.studentId}`);
                      return { ...p, studentName: studentRes.data.name || `User ${p.studentId}` };
                    } catch {
                      return { ...p, studentName: `User ${p.studentId}` };
                    }
                  })
                );
                const otherParticipants = participantData.filter(p => p.studentId !== currentUserId);
                threadName = otherParticipants.map(p => p.studentName).join(', ') || 'Self Chat';
                role = otherParticipants.length > 1 ? 'Group Chat' : 'Direct Chat';
              } catch {
                // Fallback
              }

              return {
                id: thread.threadId,
                name: threadName,
                lastMessage,
                timestamp: thread.created_at || 'Unknown',
                unread: 0,
                avatar: '/api/placeholder/40/40',
                online: false,
                role,
              };
            })
          );
          // Update conversations only if changed
          setConversations(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(enrichedThreads)) {
              return enrichedThreads;
            }
            return prev;
          });
        } catch (error) {
          console.error('Error fetching threads:', error);
          // Don't toast every poll
        }
      };
      fetchThreads();
      const intervalId = setInterval(fetchThreads, 10000); // Poll every 10 seconds
      return () => clearInterval(intervalId);
    }
  }, [currentUserId]);

  // Poll for new messages when a chat is selected
  useEffect(() => {
    const pollMessages = async () => {
      if (selectedChat) {
        try {
          const response = await axios.get(`${API_BASE_URL}/messages/thread/${selectedChat}`);
          const newMessages = response.data.map((message: any) => ({
            id: message.id,
            senderId: message.senderId,
            content: message.content,
            timestamp: message.timestamp || 'Unknown',
            isOwn: message.senderId === currentUserId,
            senderName: participants.find(p => p.studentId === message.senderId)?.studentName || `User ${message.senderId}`,
          }));
          // Update messages if new ones are found
          if (newMessages.length > messages.length) {
            setMessages(newMessages);
            // Update conversation lastMessage
            const lastMessage = newMessages[newMessages.length - 1].content;
            setConversations(prev =>
              prev.map(conv =>
                conv.id === selectedChat ? { ...conv, lastMessage } : conv
              )
            );
          }
        } catch (error) {
          console.error('Error polling messages:', error);
        }
      }
    };

    const intervalId = setInterval(pollMessages, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [selectedChat, messages.length, currentUserId, participants]);

  // Fetch participants and messages for selected thread (names included)
  useEffect(() => {
    if (selectedChat) {
      const fetchData = async () => {
        setIsChatLoading(true);
        try {
          const participantsRes = await axios.get(`${API_BASE_URL}/participants/thread/${selectedChat}`);
          const participantsData = await Promise.all(
            participantsRes.data.map(async (p: Participant) => {
              try {
                const studentRes = await axios.get(`${STUDENTS_API_BASE_URL}/${p.studentId}`);
                return { ...p, studentName: studentRes.data.name || `User ${p.studentId}` };
              } catch {
                return { ...p, studentName: `User ${p.studentId}` };
              }
            })
          );
          setParticipants(participantsData);

          const messagesRes = await axios.get(`${API_BASE_URL}/messages/thread/${selectedChat}`);
          const newMessages = messagesRes.data.map((message: any) => ({
            id: message.id,
            senderId: message.senderId,
            content: message.content,
            timestamp: message.timestamp || 'Unknown',
            isOwn: message.senderId === currentUserId,
            senderName: participantsData.find(p => p.studentId === message.senderId)?.studentName || `User ${message.senderId}`,
          }));
          setMessages(newMessages);
        } catch (error) {
          console.error('Error fetching chat data:', error);
          toast({ title: 'Error', description: 'Failed to load chat data', variant: 'destructive' });
        } finally {
          setIsChatLoading(false);
        }
      };
      fetchData();
    } else {
      setMessages([]);
      setParticipants([]);
      setIsChatLoading(false);
    }
  }, [selectedChat, currentUserId, toast]);

  // Fetch all students once for search (on modal open)
  useEffect(() => {
    if (isNewMessageModalOpen && allStudents.length === 0) {
      const fetchAllStudents = async () => {
        try {
          const response = await axios.get(STUDENTS_API_BASE_URL);
          const students = response.data.filter((s: Student) => s.id !== currentUserId);
          setAllStudents(students);
        } catch (error) {
          console.error('Error fetching all students:', error);
          toast({ title: 'Error', description: 'Failed to load users for search', variant: 'destructive' });
        }
      };
      fetchAllStudents();
    }
  }, [isNewMessageModalOpen, allStudents.length, currentUserId, toast]);

  // Filter search results locally
  useEffect(() => {
    if (searchQuery.trim() && allStudents.length > 0) {
      const results = allStudents.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allStudents]);

  const handleToggleUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const checkDuplicateOneOnOne = async (selectedUserId: number) => {
    const selectedUserName = (await axios.get(`${STUDENTS_API_BASE_URL}/${selectedUserId}`)).data.name;
    return conversations.some(conv => conv.role === 'Direct Chat' && conv.name === selectedUserName);
  };

  const handleCreateThread = async () => {
    if (selectedUsers.length === 0) {
      toast({ title: 'Warning', description: 'Select at least one user', variant: 'destructive' });
      return;
    }

    if (selectedUsers.length === 1) {
      const isDuplicate = await checkDuplicateOneOnOne(selectedUsers[0]);
      if (isDuplicate) {
        toast({ title: 'Error', description: 'Chat with this user already exists', variant: 'destructive' });
        return;
      }
    }

    try {
      const threadResponse = await axios.post(`${API_BASE_URL}/threads`, {});
      const threadId = threadResponse.data.threadId;

      // Add current user
      await axios.post(`${API_BASE_URL}/participants`, { threadId, studentId: currentUserId });

      // Add selected users
      await Promise.all(
        selectedUsers.map(async (studentId) => {
          await axios.post(`${API_BASE_URL}/participants`, { threadId, studentId });
        })
      );

      // Fetch participant names for new conversation name
      const participantNames = await Promise.all(
        selectedUsers.map(async (id) => {
          try {
            const res = await axios.get(`${STUDENTS_API_BASE_URL}/${id}`);
            return res.data.name || `User ${id}`;
          } catch {
            return `User ${id}`;
          }
        })
      );
      const threadName = participantNames.join(', ');

      // Add to conversations state
      setConversations(prev => [
        ...prev,
        {
          id: threadId,
          name: threadName,
          lastMessage: '',
          timestamp: threadResponse.data.created_at || 'Unknown',
          unread: 0,
          avatar: '/api/placeholder/40/40',
          online: false,
          role: selectedUsers.length > 1 ? 'Group Chat' : 'Direct Chat',
        },
      ]);

      setSelectedChat(threadId);
      setIsNewMessageModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      toast({ title: 'Success', description: 'New conversation created' });
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({ title: 'Error', description: 'Failed to create conversation', variant: 'destructive' });
    }
  };

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedChat && currentUserId) {
      try {
        const messageDTO = {
          threadId: selectedChat,
          senderId: currentUserId,
          content: messageText,
          timestamp: new Date().toISOString(),
        };
        const response = await axios.post(`${API_BASE_URL}/messages`, messageDTO);
        setMessages(prev => [
          ...prev,
          {
            id: response.data.id,
            senderId: response.data.senderId,
            content: response.data.content,
            timestamp: response.data.timestamp || 'Unknown',
            isOwn: response.data.senderId === currentUserId,
            senderName: 'You',
          },
        ]);
        setMessageText('');
        // Update conversation's lastMessage and timestamp
        const threadResponse = await axios.get(`${API_BASE_URL}/threads/${selectedChat}`);
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedChat
              ? { ...conv, lastMessage: messageText, timestamp: threadResponse.data.created_at }
              : conv
          )
        );
      } catch (error) {
        console.error('Error sending message:', error);
        toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
      }
    }
  };

  const handleOpenDeleteConfirm = (threadId: string, type: 'leave' | 'delete') => {
    setDeleteThreadId(threadId);
    setDeleteType(type);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteThread = async () => {
    if (deleteThreadId && currentUserId) {
      try {
        if (deleteType === 'delete') {
          await axios.delete(`${API_BASE_URL}/threads/${deleteThreadId}`);
          toast({ title: 'Success', description: 'Conversation deleted' });
        } else {
          await axios.delete(`${API_BASE_URL}/participants/${deleteThreadId}/${currentUserId}`);
          toast({ title: 'Success', description: 'You have left the conversation' });
        }
        // Remove from conversations
        setConversations(prev => prev.filter(conv => conv.id !== deleteThreadId));
        if (selectedChat === deleteThreadId) {
          setSelectedChat(null);
          if (isMobile) {
            setMobileView('conversations');
          }
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        toast({ title: 'Error', description: 'Failed to delete conversation', variant: 'destructive' });
      } finally {
        setIsDeleteConfirmOpen(false);
        setDeleteThreadId(null);
      }
    }
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
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) return 'Today';
    if (isYesterday(parsedDate)) return 'Yesterday';
    return format(parsedDate, 'MMMM d, yyyy');
  };

  const formatMessageTime = (timestamp: string) => {
    return format(parseISO(timestamp), 'h:mm a');
  };

  const formatConversationTime = (timestamp: string) => {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  };

  const handleChatSelection = (chatId: string) => {
    setSelectedChat(chatId);
    if (isMobile) {
      setMobileView('chat');
    }
  };

  const handleBackToConversations = () => {
    if (isMobile) {
      setMobileView('conversations');
    }
  };

  const currentChat = conversations.find(c => c.id === selectedChat);

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header - only show on desktop or when viewing conversations on mobile */}
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

        {/* Mobile: Show either conversations or chat */}
        {isMobile ? (
          <>
            {mobileView === 'conversations' ? (
              /* Conversations List - Mobile */
              <Card className="h-[calc(100vh-120px)]">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Chats</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search messages..." className="pl-9" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
                    {isLoading ? (
                      <div>Loading conversations...</div>
                    ) : conversations.length === 0 ? (
                      <div>No conversations yet.</div>
                    ) : (
                      conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className="flex items-center p-4 cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted"
                          onClick={() => handleChatSelection(conversation.id)}
                        >
                          <div className="relative mr-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={conversation.avatar} />
                              <AvatarFallback className="text-lg font-semibold">
                                {conversation.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.online && (
                              <div className="absolute bottom-0 right-0 h-3 w-3 bg-success rounded-full border-2 border-background" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate text-base">{conversation.name}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">{formatConversationTime(conversation.timestamp)}</span>
                                {conversation.unread > 0 && (
                                  <Badge className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-primary">
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
              /* Chat View - Mobile */
              currentChat && (
                <Card className="h-[calc(100vh-80px)] flex flex-col">
                  {/* Chat Header with Back Button */}
                  <CardHeader className="border-b p-3">
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleBackToConversations}
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
                        <p className="text-sm text-muted-foreground">
                          {currentChat.online ? 'Online' : 'Last seen 2 hours ago'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Video className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDeleteConfirm(selectedChat, 'delete')}>
                          <Trash className="h-5 w-5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDeleteConfirm(selectedChat, 'leave')}>
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Leave Conversation</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-4 overflow-y-auto">
                    {isChatLoading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                          <h3 className="text-lg font-semibold mb-2">Loading messages...</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {groupMessagesByDate(messages).map((group, index) => (
                          <React.Fragment key={index}>
                            <div className="flex justify-center my-4">
                              <Badge variant="secondary" className="px-3 py-1 text-sm">
                                {formatDateHeader(group.date)}
                              </Badge>
                            </div>
                            {group.messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                                    message.isOwn
                                      ? 'bg-primary text-primary-foreground rounded-br-md'
                                      : 'bg-muted text-foreground rounded-bl-md'
                                  }`}
                                >
                                  {currentChat.role === 'Group Chat' && (
                                    <p className="text-xs font-semibold mb-1">{message.isOwn ? 'You' : message.senderName}</p>
                                  )}
                                  <p className="text-sm">{message.content}</p>
                                  <p className={`text-xs mt-1 ${
                                    message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  }`}>
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

                  {/* Message Input */}
                  <div className="border-t p-3">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 bg-muted rounded-full px-4 py-2">
                          <Button variant="ghost" size="sm" className="p-1">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Textarea
                            placeholder="Message..."
                            className="min-h-[36px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button variant="ghost" size="sm" className="p-1">
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
          /* Desktop: Side by side layout */
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
                    <div>Loading conversations...</div>
                  ) : conversations.length === 0 ? (
                    <div>No conversations yet.</div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`flex items-center p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedChat === conversation.id ? 'bg-primary/10 border-r-2 border-primary' : ''
                        }`}
                        onClick={() => setSelectedChat(conversation.id)}
                      >
                        <div className="relative mr-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {conversation.online && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-success rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{conversation.name}</h4>
                            <span className="text-xs text-muted-foreground">{formatConversationTime(conversation.timestamp)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                          <p className="text-xs text-muted-foreground">{conversation.role}</p>
                          {conversation.unread > 0 && (
                            <Badge className="ml-auto">{conversation.unread}</Badge>
                          )}
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
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={currentChat.avatar} />
                          <AvatarFallback>{currentChat.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{currentChat.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {participants.filter(p => p.studentId !== currentUserId).map(p => p.studentName || p.studentId).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDeleteConfirm(selectedChat, 'delete')}>
                          <Trash className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDeleteConfirm(selectedChat, 'leave')}>
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Leave Conversation</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-4 overflow-y-auto">
                    {isChatLoading ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                          <h3 className="text-lg font-semibold mb-2">Loading messages...</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {groupMessagesByDate(messages).map((group, index) => (
                          <React.Fragment key={index}>
                            <div className="flex justify-center my-4">
                              <Badge variant="secondary" className="px-3 py-1 text-sm">
                                {formatDateHeader(group.date)}
                              </Badge>
                            </div>
                            {group.messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                                >
                                  {currentChat.role === 'Group Chat' && (
                                    <p className="text-xs font-semibold mb-1">{message.isOwn ? 'You' : message.senderName}</p>
                                  )}
                                  <p className="text-sm">{message.content}</p>
                                  <p className={`text-xs mt-1 ${message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
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
                  <div className="border-t p-4">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
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
                            <Button variant="ghost" size="sm">
                              <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Smile className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!messageText.trim()}
                            className="bg-gradient-primary hover:opacity-90"
                          >
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleToggleUser(user.id)}
                  />
                  <Label htmlFor={`user-${user.id}`} className="flex-1">
                    {user.name} ({user.email})
                  </Label>
                </div>
              ))}
              {searchResults.length === 0 && searchQuery && <p>No users found.</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMessageModalOpen(false)}>
              Cancel
            </Button>
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
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteThread}>
              {deleteType === 'delete' ? 'Delete' : 'Leave'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}