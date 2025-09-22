import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share,
  MoreHorizontal,
  Pin,
  Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForumPost() {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');

  // Sample post data - in real app, this would come from router state or API
  const post = {
    id: 1,
    title: 'Help with Calculus Integration by Parts',
    content: `I'm struggling with integration by parts. Can someone explain the u-dv method?

I understand the basic formula ∫u dv = uv - ∫v du, but I'm having trouble deciding which part should be u and which should be dv. 

For example, with ∫x e^x dx, should x be u or should e^x be u?

Any tips or mnemonics would be really helpful!`,
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
  };

  const comments = [
    {
      id: 1,
      author: 'Prof. Anderson',
      avatar: '/api/placeholder/40/40',
      content: `Great question! For integration by parts, I teach my students the LIATE rule:

L - Logarithmic functions
I - Inverse trig functions  
A - Algebraic functions
T - Trigonometric functions
E - Exponential functions

Choose u in this order of priority. So for ∫x e^x dx, x is algebraic and e^x is exponential, so u = x and dv = e^x dx.`,
      timestamp: '1 hour ago',
      upvotes: 15,
      downvotes: 1,
      replies: 3
    },
    {
      id: 2,
      author: 'MathStudent2024',
      avatar: '/api/placeholder/40/40',
      content: `I remember it as "DETAIL":
- Derivatives get simpler
- Exponentials stay the same  
- Trig functions cycle
- Algebraic terms simplify
- Inverse trig gets messy
- Logs become fractions

Pick the one that gets simpler when differentiated!`,
      timestamp: '45 minutes ago',
      upvotes: 8,
      downvotes: 0,
      replies: 1
    },
    {
      id: 3,
      author: 'CalcTutor',
      avatar: '/api/placeholder/40/40',
      content: `Here's a worked example:

∫x e^x dx

Let u = x, then du = dx
Let dv = e^x dx, then v = e^x

Using the formula:
∫x e^x dx = x·e^x - ∫e^x dx = x·e^x - e^x + C = e^x(x-1) + C`,
      timestamp: '30 minutes ago',
      upvotes: 12,
      downvotes: 0,
      replies: 0
    }
  ];

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      console.log('Submitting comment:', newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/forum')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Forum
      </Button>

      {/* Main Post */}
      <Card className="border-l-2 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Voting */}
            <div className="flex flex-col items-center space-y-2 min-w-[40px]">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-orange-500">
                <ArrowUp className="h-5 w-5" />
              </Button>
              <span className="text-lg font-bold text-muted-foreground">
                {post.upvotes - post.downvotes}
              </span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-blue-500">
                <ArrowDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                <span className="font-medium hover:underline cursor-pointer">{post.community}</span>
                <span>•</span>
                <span>Posted by u/{post.author}</span>
                <span>•</span>
                <span>{post.timestamp}</span>
                {post.isPinned && (
                  <>
                    <span>•</span>
                    <div className="flex items-center text-green-600">
                      <Pin className="h-3 w-3 mr-1" />
                      <span>Pinned</span>
                    </div>
                  </>
                )}
              </div>

              <h1 className="text-2xl font-bold text-foreground mb-4">
                {post.title}
              </h1>

              <div className="prose max-w-none text-foreground mb-4">
                <p className="whitespace-pre-line">{post.content}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  {post.replies} Comments
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-muted">
                  <Share className="mr-1 h-3 w-3" />
                  Share
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-muted">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Comment Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Send className="mr-2 h-3 w-3" />
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>
        
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                {/* Voting */}
                <div className="flex flex-col items-center space-y-1 min-w-[30px]">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-orange-500">
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {comment.upvotes - comment.downvotes}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-blue-500">
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Comment Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{comment.author}</span>
                    <span>•</span>
                    <span>{comment.timestamp}</span>
                  </div>

                  <div className="prose max-w-none text-sm text-foreground mb-3">
                    <p className="whitespace-pre-line">{comment.content}</p>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-6 px-2 hover:bg-muted">
                      <MessageCircle className="mr-1 h-2 w-2" />
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 hover:bg-muted">
                      <Share className="mr-1 h-2 w-2" />
                      Share
                    </Button>
                    {comment.replies > 0 && (
                      <span>{comment.replies} replies</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}