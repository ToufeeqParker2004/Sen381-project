import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Share, MoreHorizontal, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  student?: { id: number; name?: string };
  content: string;
  createdAt: string;
  userName?: string | null;
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
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPostType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false); // New state for posting status
  const { toast } = useToast();

  const token = localStorage.getItem("authToken");

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleString();
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date().toLocaleString() : date.toLocaleString();
  };

  useEffect(() => {
    if (!id || !token) return;
    const postId = id;

    // Fetch post
    fetch(`http://localhost:9090/ForumPosts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(async (data: ForumPostType) => {
        setPost(data);

        // Fetch post author
        try {
          const authorRes = await fetch(`http://localhost:9090/student/${data.authorId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (authorRes.ok) {
            const authorData = await authorRes.json();
            setAuthorName(authorData.name);
          }
        } catch (err) {
          console.error(err);
        }

        // Fetch comments
        try {
          setLoadingComments(true);
          const commentsRes = await fetch(`http://localhost:9090/api/comments/post/${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!commentsRes.ok) return;

          const commentsData: Comment[] = await commentsRes.json();

          const commentsWithUsernames = await Promise.all(
            commentsData.map(async (comment) => {
              let userName = "Unknown";
              const studentId = comment.student?.id;
              if (studentId) {
                try {
                  const studentRes = await fetch(
                    `http://localhost:9090/student/${studentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  if (studentRes.ok) {
                    const studentData = await studentRes.json();
                    userName = studentData.name;
                  }
                } catch (err) {
                  console.error(err);
                }
              }

              return {
                ...comment,
                userName,
                createdAt: formatDate(comment.createdAt),
              };
            })
          );

          setComments(commentsWithUsernames);
          setLoadingComments(false);
        } catch (err) {
          console.error(err);
          setLoadingComments(false);
        }
      })
      .catch(console.error);
  }, [id, token]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !post || isPostingComment) return; // Prevent if already posting

    try {
      setIsPostingComment(true); // Disable the button

      const res = await fetch(
        `http://localhost:9090/api/comments/post/${post.id}/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            Authorization: `Bearer ${token}`,
          },
          body: newComment,
        }
      );
      const comment = await res.json();
      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: comment.error || comment.message || "Failed to create post",
        });
        setIsPostingComment(false); // Re-enable on error
        return;
      }

      setComments([
        ...comments,
        {
          ...comment,
          userName: user?.name || "You",
          createdAt: formatDate(comment.createdAt),
        },
      ]);

      setNewComment("");
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: "Failed to post comment",
      });
    } finally {
      setIsPostingComment(false); // Re-enable button whether success or error
    }
  };

  if (!post) return <p className="text-muted-foreground text-center mt-10">Loading post...</p>;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/forum')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Forum
      </Button>

      {/* Post */}
      <Card className="hover:shadow-custom-md transition-shadow border-l-2 border-l-transparent hover:border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="font-medium hover:underline cursor-pointer">{post.community || "Community"}</span>
              <span>•</span>
              <span>Posted by u/{authorName || "User #" + post.authorId}</span>
              <span>•</span>
              <span>{formatDate(post.created_at)}</span>
            </div>

            <h2 className="text-2xl font-semibold text-foreground">{post.title || "Untitled Post"}</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-4">
              <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-muted">
                <MessageCircle className="mr-1 h-3 w-3" />
                {comments.length} Comments
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-4">
        {loadingComments ? (
          <p className="text-muted-foreground text-center">Loading comments...</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="bg-muted/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>u/{comment.userName}</span>
                  <span>{comment.createdAt}</span>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
              </CardContent>
            </Card>
          ))
        )}

        {user && (
          <div className="flex flex-col space-y-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-muted/20 text-foreground"
              disabled={isPostingComment} // Disable input while posting
            />
            <Button 
              className="self-end bg-gradient-primary hover:opacity-90" 
              onClick={handleAddComment}
              disabled={isPostingComment || !newComment.trim()} // Disable when posting or empty
            >
              {isPostingComment ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}