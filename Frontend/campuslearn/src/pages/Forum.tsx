import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreatePostModal } from '@/components/ui/CreatePostModal';
import {
  MessageSquare,
  Search,
  Plus,
  TrendingUp,
  Clock,
  Users,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Pin,
  ArrowUp,
  ArrowDown,
  Share,
  MoreHorizontal,
} from 'lucide-react';

export default function Forum() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [recentEngagedPosts, setRecentEngagedPosts] = useState<any[]>([]);

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
      upvotes: 12,
      downvotes: 2,
      isPinned: true,
      tags: ['calculus', 'integration', 'help'],
      community: 'r/Mathematics'
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
      upvotes: 23,
      downvotes: 1,
      isPinned: false,
      tags: ['data-structures', 'resources', 'practice'],
      community: 'r/ComputerScience'
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
      upvotes: 9,
      downvotes: 0,
      isPinned: false,
      tags: ['chemistry', 'study-group', 'finals'],
      community: 'r/Chemistry'
    },
  ];

  // Handle post engagement tracking
  const handlePostEngage = (post: any) => {
    const newEngagement = {
      ...post,
      engagedAt: new Date().toISOString(),
    };
    
    setRecentEngagedPosts(prev => {
      const filtered = prev.filter(p => p.id !== post.id);
      return [newEngagement, ...filtered].slice(0, 5);
    });
  };

  const clearRecentPosts = () => {
    setRecentEngagedPosts([]);
  };

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
        <Button 
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setCreatePostOpen(true)}
        >
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
          <div className="space-y-2">
            {forumPosts.filter(post => 
              searchQuery === '' || 
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map((post) => (
              <Card key={post.id} className="hover:shadow-custom-md transition-shadow border-l-2 border-l-transparent hover:border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                        <span className="font-medium hover:underline cursor-pointer">{post.community}</span>
                        <span>•</span>
                        <span>Posted by u/{post.author}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </div>

                      <h3 
                        className="font-medium text-foreground hover:text-primary cursor-pointer mb-2 line-clamp-2"
                        onClick={() => navigate('/forum/post')}
                      >
                        {post.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{post.content}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 hover:bg-muted"
                          onClick={() => handlePostEngage(post)}
                        >
                          <MessageCircle className="mr-1 h-3 w-3" />
                          {post.replies} Comments
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-muted">
                          <Share className="mr-1 h-3 w-3" />
                          Share
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-muted">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
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
                <div 
                  key={topic.tag} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSearchQuery(topic.tag)}
                >
                  <span className="text-sm font-medium">#{topic.tag}</span>
                  <Badge variant="outline" className="text-xs">
                    {topic.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Engaged Posts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80"
                onClick={clearRecentPosts}
              >
                Clear
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentEngagedPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity. Engage with posts to see them here.
                </p>
              ) : (
                recentEngagedPosts.map((post) => (
                  <div key={`${post.id}-${post.engagedAt}`} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-1">
                        <span className="font-medium">{post.community}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </div>
                      <h4 className="text-sm font-medium line-clamp-2 mb-2">
                        {post.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <span>{post.upvotes - post.downvotes} upvotes</span>
                        <span>{post.replies} comments</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreatePostModal 
        open={createPostOpen} 
        onOpenChange={setCreatePostOpen}
      />
    </div>
  );
}