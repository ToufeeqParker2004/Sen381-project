import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Comment {
  id: string;
  studentId: number;
  content: string;
  createdAt: string;
}

interface ForumPostType {
  id: string;
  title?: string | null;
  content: string;
  author?: string | null;
  authorId: number;
  created_at?: string;
  tags?: string[];
  community?: string | null;
  upvotes?: number;
  replies?: number;
}

export default function ForumPost() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPostType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!id || !token) return;

    // Fetch post
    fetch(`http://localhost:9090/ForumPosts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch(console.error);

    // Fetch comments
    fetch(`http://localhost:9090/api/comments/post/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch(console.error);
  }, [id, token]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !post) return;
    try {
      const res = await fetch(`http://localhost:9090/api/comments/post/${post.id}/add?studentId=${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newComment),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const comment = await res.json();
      setComments([...comments, comment]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  if (!post) return <p className="text-muted-foreground text-center mt-10">Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Post */}
      <Card className="hover:shadow-custom-md transition-shadow border-l-2 border-l-transparent hover:border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="font-medium hover:underline cursor-pointer">{post.community || "Community"}</span>
              <span>•</span>
              <span>Posted by u/{post.author || "User #" + post.authorId}</span>
              <span>•</span>
              <span>{new Date(post.created_at || "").toLocaleString()}</span>
            </div>

            <h2 className="text-2xl font-semibold text-foreground">{post.title || "Untitled Post"}</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-4">
              <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-muted">
                <MessageCircle className="mr-1 h-3 w-3" />
                {comments.length} Comments
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
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="bg-muted/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>u/{comment.studentId}</span>
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-foreground">{comment.content}</p>
            </CardContent>
          </Card>
        ))}

        {/* Add new comment */}
        {user && (
          <div className="flex flex-col space-y-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-muted/20 text-foreground"
            />
            <Button className="self-end bg-gradient-primary hover:opacity-90" onClick={handleAddComment}>
              Post Comment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
