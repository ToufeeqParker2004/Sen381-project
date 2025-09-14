import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Search,
  Plus,
  TrendingUp,
  Clock,
  Users,
  ThumbsUp,
  MessageCircle,
  Pin,
} from 'lucide-react';

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState('');

  const forumPosts = [
    {
      id: 1,
      title: 'Help with Calculus Integration by Parts',
      content: 'I\'m struggling with integration by parts. Can someone explain the u-dv method?',
      author: 'Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      timestamp: '2 hours ago',
      category: 'Mathematics',
      replies: 8,
      likes: 12,
      isPinned: true,
      tags: ['calculus', 'integration', 'help']
    },
    {
      id: 2,
      title: 'Best Resources for Data Structures Practice',
      content: 'Looking for good websites or books to practice data structures problems.',
      author: 'Mike Chen',
      avatar: '/api/placeholder/40/40',
      timestamp: '4 hours ago',
      category: 'Computer Science',
      replies: 15,
      likes: 23,
      isPinned: false,
      tags: ['data-structures', 'resources', 'practice']
    },
    {
      id: 3,
      title: 'Study Group for Organic Chemistry Final',
      content: 'Anyone interested in forming a study group for the upcoming org chem final?',
      author: 'Emma Rodriguez',
      avatar: '/api/placeholder/40/40',
      timestamp: '6 hours ago',
      category: 'Chemistry',
      replies: 6,
      likes: 9,
      isPinned: false,
      tags: ['chemistry', 'study-group', 'finals']
    },
  ];

  const categories = [
    { name: 'Mathematics', count: 45, color: 'bg-primary' },
    { name: 'Computer Science', count: 38, color: 'bg-secondary' },
    { name: 'Chemistry', count: 22, color: 'bg-success' },
    { name: 'Physics', count: 19, color: 'bg-warning' },
    { name: 'General', count: 67, color: 'bg-muted' },
  ];

  const trendingTopics = [
    { tag: 'finals-prep', count: 24 },
    { tag: 'study-tips', count: 18 },
    { tag: 'calculus', count: 15 },
    { tag: 'programming', count: 12 },
    { tag: 'exam-help', count: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">Connect, share knowledge, and get help from fellow students</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Tabs */}
          <Card>
            <CardContent className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search discussions..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                  <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Forum Posts */}
          <div className="space-y-4">
            {forumPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-custom-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                            <h3 className="font-semibold text-lg hover:text-primary cursor-pointer">
                              {post.title}
                            </h3>
                          </div>
                          <p className="text-muted-foreground mb-3">{post.content}</p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="font-medium">{post.author}</span>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {post.timestamp}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {post.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center space-x-4">
                          <Button variant="ghost" size="sm" className="h-8">
                            <ThumbsUp className="mr-1 h-3 w-3" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8">
                            <MessageCircle className="mr-1 h-3 w-3" />
                            {post.replies} replies
                          </Button>
                        </div>
                        <Button variant="outline" size="sm">
                          View Discussion
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trendingTopics.map((topic) => (
                <div key={topic.tag} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <span className="text-sm font-medium">#{topic.tag}</span>
                  <Badge variant="outline" className="text-xs">
                    {topic.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Forum Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Forum Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gradient-subtle rounded-lg">
                <div className="text-2xl font-bold text-primary">1,234</div>
                <div className="text-sm text-muted-foreground">Total Posts</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">567</div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">89</div>
                  <div className="text-xs text-muted-foreground">Online Now</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}