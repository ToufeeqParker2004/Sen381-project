import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreatePostModal } from "@/components/ui/CreatePostModal";
import { MessageCircle, Search, Plus, TrendingUp, Share, MoreHorizontal, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  const fetchPosts = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:9090/ForumPosts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch posts");

      const data: any[] = await res.json();

      // Fetch comments count for each post
      const postsWithReplies = await Promise.all(
        data.map(async (post) => {
          let replies = 0;
          try {
            const resComments = await fetch(`http://localhost:9090/api/comments/post/${post.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resComments.ok) {
              const comments = await resComments.json();
              replies = comments.length;
            }
          } catch (err) {
            console.error(err);
          }

          return {
            id: post.id,
            authorId: post.authorId,
            content: post.content,
            attatchments: post.attatchments || [],
            upvotes: post.upvotes || 0,
            created_at: post.created_at || new Date().toISOString(),
            title: post.title || null,
            author: post.author || null,
            tags: post.tags || [],
            replies,
            downvotes: post.downvotes || 0,
            community: post.community || null,
            timestamp: post.timestamp || null,
            parent_post_id: post.parent_post_id || null,
          };
        })
      );

      setForumPosts(postsWithReplies);

      // Trending topics
      const tagCount: Record<string, number> = {};
      postsWithReplies.forEach((post) => {
        post.tags?.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

      const sortedTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));

      setTrendingTopics(sortedTags);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => fetchPosts();

  const filteredPosts = forumPosts.filter(
    (post) =>
      searchQuery === "" ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorId.toString().includes(searchQuery.toLowerCase()) ||
      post.tags?.some((tag) => tag.toLowerCase() === searchQuery.toLowerCase())
  );

  const resetFilter = () => setSearchQuery("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">
            Connect, share knowledge, and get help from fellow students
          </p>
        </div>
        <Button
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setCreatePostOpen(true)}
          disabled={!user}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Search & Reset */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 flex items-center gap-1"
          onClick={resetFilter}
        >
          <X className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Loading indicator */}
      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          Loading posts...
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Forum Posts - Left */}
          <div className="flex-1 space-y-2">
            {filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 border border-dashed border-muted rounded-lg bg-muted/20 text-center text-muted-foreground">
                <p className="text-lg font-medium mb-2">No posts yet</p>
                <p className="text-sm">Be the first to create a post in this community!</p>
                {user && (
                  <Button
                    className="mt-4 bg-gradient-primary hover:opacity-90"
                    onClick={() => setCreatePostOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                )}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-custom-md transition-shadow border-l-2 border-l-transparent hover:border-l-primary"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                          <span className="font-medium hover:underline cursor-pointer">
                            {post.community || "Community"}
                          </span>
                          <span>•</span>
                          <span>Posted by u/{post.author || "User #" + post.authorId}</span>
                          <span>•</span>
                          <span>{new Date(post.created_at!).toLocaleString()}</span>
                        </div>

                        <h3
                          className="font-medium text-foreground hover:text-primary cursor-pointer mb-2 line-clamp-2"
                          onClick={() => navigate(`/forum/post/${post.id}`)}
                        >
                          {post.title || post.content.slice(0, 50) + "..."}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{post.content}</p>

                        {post.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 hover:bg-muted"
                            onClick={() => navigate(`/forum/post/${post.id}`)}
                          >
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
              ))
            )}
          </div>

          {/* Sidebar - Trending Topics */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Trending Topics by tag
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trendingTopics.length > 0 ? (
                  trendingTopics.map((topic) => (
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
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">No trending topics yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
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
