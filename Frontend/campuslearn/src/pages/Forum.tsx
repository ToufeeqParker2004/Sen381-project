import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CreatePostModal } from '@/components/ui/CreatePostModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Search, Plus, TrendingUp, Share, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ForumPost {
  id: string;
  authorId: number;
  parent_post_id?: string | null;
  content: string;
  attatchments?: string[];
  upvotes?: number;
  created_at?: string;
  title?: string | null;
  author?: string | null;
  tags?: string[];
  replies?: number;
  downvotes?: number;
  community?: string | null;
  timestamp?: string | null;
}

export default function Forum() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [recentEngagedPosts, setRecentEngagedPosts] = useState<ForumPost[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);

  // Fetch forum posts
  const fetchPosts = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:9090/ForumPosts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch posts');

      const data: any[] = await res.json();
      setForumPosts(data.map(post => ({
        id: post.id,
        authorId: post.authorId,
        content: post.content,
        attatchments: post.attatchments || [],
        upvotes: post.upvotes || 0,
        created_at: post.created_at || new Date().toISOString(),
        title: post.title || null,
        author: post.author || null,
        tags: post.tags || [],
        replies: post.replies || 0,
        downvotes: post.downvotes || 0,
        community: post.community || null,
        timestamp: post.timestamp || null,
        parent_post_id: post.parent_post_id || null,
      })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Refresh posts after a new post
  const handlePostCreated = () => fetchPosts();

  // Track post engagement
  const handlePostEngage = (post: ForumPost) => {
    const newEngagement = { ...post, timestamp: new Date().toISOString() };
    setRecentEngagedPosts(prev => [newEngagement, ...prev.filter(p => p.id !== post.id)].slice(0, 5));
  };

  const clearRecentPosts = () => setRecentEngagedPosts([]);

  const trendingTopics = [
    { tag: 'finals-prep', count: 24 },
    { tag: 'study-tips', count: 18 },
    { tag: 'calculus', count: 15 },
    { tag: 'programming', count: 12 },
    { tag: 'exam-help', count: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">Connect, share knowledge, and get help from fellow students</p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setCreatePostOpen(true)}
          disabled={!user} // Disable if user not logged in
        >
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          {/* Search & Tabs */}
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
              post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.authorId.toString().includes(searchQuery.toLowerCase())
            ).map(post => (
              <Card key={post.id} className="hover:shadow-custom-md transition-shadow border-l-2 border-l-transparent hover:border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                        <span className="font-medium hover:underline cursor-pointer">{post.community || "Community"}</span>
                        <span>•</span>
                        <span>Posted by u/{post.author || "User #" + post.authorId}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at!).toLocaleString()}</span>
                      </div>

                      <h3 
                        className="font-medium text-foreground hover:text-primary cursor-pointer mb-2 line-clamp-2"
                        onClick={() => navigate(`/forum/post/${post.id}`)}
                      >
                        {post.title || post.content.slice(0, 50) + '...'}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{post.content}</p>

                      {post.attatchments?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.attatchments.map((att, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">📎 {att}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-muted" onClick={() => handlePostEngage(post)}>
                          <MessageCircle className="mr-1 h-3 w-3" />
                          {post.replies || 0} Comments
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-muted">
                          <Share className="mr-1 h-3 w-3" />
                          Share
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-muted">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                        <span>{post.upvotes || 0} upvotes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
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
              {trendingTopics.map(topic => (
                <div key={topic.tag} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSearchQuery(topic.tag)}>
                  <span className="text-sm font-medium">#{topic.tag}</span>
                  <Badge variant="outline" className="text-xs">{topic.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Render CreatePostModal only if user exists */}
      {user && (
        <CreatePostModal 
          open={createPostOpen} 
          onOpenChange={setCreatePostOpen} 
          userId={Number(user.id)}  
          onPostCreated={handlePostCreated} 
        />
      )}
    </div>
  );
}