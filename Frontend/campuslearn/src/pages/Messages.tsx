import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
} from 'lucide-react';

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      lastMessage: 'Great progress on the calculus problems!',
      timestamp: '2 min ago',
      unread: 2,
      avatar: '/api/placeholder/40/40',
      online: true,
      role: 'Mathematics Tutor'
    },
    {
      id: 2,
      name: 'Study Group - CS 101',
      lastMessage: 'Anyone available for the project meeting?',
      timestamp: '15 min ago',
      unread: 0,
      avatar: '/api/placeholder/40/40',
      online: false,
      role: 'Group Chat'
    },
    {
      id: 3,
      name: 'Prof. Mike Chen',
      lastMessage: 'The assignment deadline has been extended',
      timestamp: '1 hour ago',
      unread: 1,
      avatar: '/api/placeholder/40/40',
      online: true,
      role: 'Computer Science'
    },
    {
      id: 4,
      name: 'Emma Rodriguez',
      lastMessage: 'Thanks for the chemistry notes!',
      timestamp: '3 hours ago',
      unread: 0,
      avatar: '/api/placeholder/40/40',
      online: false,
      role: 'Fellow Student'
    },
  ];

  const messages = [
    {
      id: 1,
      senderId: 2,
      content: 'Hi John! How are you finding the integration problems?',
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      id: 2,
      senderId: 1,
      content: 'They\'re challenging but I think I\'m getting the hang of it!',
      timestamp: '10:32 AM',
      isOwn: true
    },
    {
      id: 3,
      senderId: 2,
      content: 'That\'s great to hear! Remember, the key is to identify which function to choose as u and which as dv.',
      timestamp: '10:33 AM',
      isOwn: false
    },
    {
      id: 4,
      senderId: 1,
      content: 'Yes, I\'ve been practicing that. Should we schedule another session this week?',
      timestamp: '10:35 AM',
      isOwn: true
    },
    {
      id: 5,
      senderId: 2,
      content: 'Absolutely! How about Thursday at 2 PM?',
      timestamp: '10:36 AM',
      isOwn: false
    }
  ];

  const currentChat = conversations.find(c => c.id === selectedChat);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Add message logic here
      setMessageText('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Connect with tutors and classmates</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <MessageCircle className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

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
              {conversations.map((conversation) => (
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
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                        {conversation.unread > 0 && (
                          <Badge className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    <p className="text-xs text-muted-foreground">{conversation.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col">
          {currentChat ? (
            <>
              {/* Chat Header */}
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
                        {currentChat.online ? 'Online' : 'Last seen 2 hours ago'}
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
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input */}
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
    </div>
  );
}