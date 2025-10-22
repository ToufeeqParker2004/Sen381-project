import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bold,
  Italic,
  Strikethrough,
  Superscript,
  Type,
  Link as LinkIcon,
  List,
  ListOrdered,
  Code,
  Quote,
  MoreHorizontal,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  onPostCreated?: () => void;
}

export function CreatePostModal({
  open,
  onOpenChange,
  userId,
  onPostCreated,
}: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [community, setCommunity] = useState('');
  const [postType, setPostType] = useState('text');
  const [link, setLink] = useState('');
  const [isPosting, setIsPosting] = useState(false); // New state for posting status
  const { toast } = useToast();

  const communities = [
    'General Discussions',
    '1st Years',
    '2nd Years',
    '3rd Years',
    'Software Engineering stream',
    'Data Science stream',
  ];

  const formatButtons = [
    { icon: Bold, label: 'Bold' },
    { icon: Italic, label: 'Italic' },
    { icon: Strikethrough, label: 'Strikethrough' },
    { icon: Superscript, label: 'Superscript' },
    { icon: Type, label: 'Text' },
    { icon: LinkIcon, label: 'Link' },
    { icon: List, label: 'Bullet List' },
    { icon: ListOrdered, label: 'Numbered List' },
    { icon: Code, label: 'Code Block' },
    { icon: Quote, label: 'Quote' },
    { icon: MoreHorizontal, label: 'More' },
  ];

  const handlePost = async () => {
    if (isPosting) return; // Prevent if already posting

    try {
      setIsPosting(true); // Disable the button

      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          variant: "destructive",
          title: 'Error',
          description: "Authentication token not found",
        });
        setIsPosting(false);
        return;
      }

      let finalContent = content;

      // Handle link posts
      if (postType === 'link') {
        if (!link.trim()) {
          toast({
            variant: "destructive",
            title: 'Error',
            description: 'Please paste a valid link before posting.',
          });
          setIsPosting(false);
          return;
        }

        try {
          new URL(link);
        } catch {
          toast({
            variant: "destructive",
            title: 'Error',
            description: 'Invalid URL format.',
          });
          setIsPosting(false);
          return;
        }

        finalContent = `🔗 ${link}`;
      }

      const payload: any = {
        author_id: userId,
        title,
        content: finalContent,
        community,
        tags,
        postType,
      };

      const res = await fetch('http://localhost:9090/ForumPosts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: 'Error',
          description: data.error || data.message || "Failed to create post",
        });
        setIsPosting(false);
        return;
      }

      toast({ 
        title: 'Success', 
        description: data.message || 'Post created successfully!' 
      });
      
      // Reset form
      setTitle('');
      setContent('');
      setCommunity('');
      setTags([]);
      setLink('');
      onOpenChange(false);

      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: 'Error',
        description: err.message || 'Network error',
      });
    } finally {
      setIsPosting(false); // Re-enable button whether success or error
    }
  };

  // Determine if form is valid and ready for submission
  const isFormValid = title.trim() && community && !isPosting;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!isPosting) { // Only allow closing if not posting
        onOpenChange(open);
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 pb-4">
          <DialogTitle className="text-2xl">Create post</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden min-h-0">
          {/* Community Selection */}
          <Select value={community} onValueChange={setCommunity} disabled={isPosting}>
            <SelectTrigger className="w-full border-2 border-warning/50 focus:border-warning">
              <SelectValue placeholder="Select a community" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {communities.map((comm) => (
                <SelectItem key={comm} value={comm.toLowerCase().replace(' ', '-')}>
                  {comm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Post Type Tabs */}
          <Tabs value={postType} onValueChange={setPostType} className="w-full shrink-0">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="text" disabled={isPosting}>Text</TabsTrigger>
              <TabsTrigger value="link" disabled={isPosting}>Link</TabsTrigger>
            </TabsList>

            {/* Text Tab */}
            <TabsContent
              value="text"
              className="flex-1 flex flex-col space-y-4 overflow-hidden min-h-0"
            >
              <Input
                placeholder="Title*"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
                maxLength={300}
                disabled={isPosting}
              />
              <Input
                placeholder="Add tags (comma separated)"
                value={tags.join(',')}
                onChange={(e) =>
                  setTags(e.target.value.split(',').map((tag) => tag.trim()))
                }
                disabled={isPosting}
              />
              <div className="flex-1 flex flex-col border rounded-lg overflow-hidden min-h-0">
                <div className="flex items-center space-x-1 p-2 border-b bg-muted/30 shrink-0 overflow-x-auto">
                  {formatButtons.map((button, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      title={button.label}
                      disabled={isPosting}
                    >
                      <button.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
                <Textarea
                  placeholder="Body text (optional)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-full w-full border-0 resize-none focus-visible:ring-0 rounded-none"
                  disabled={isPosting}
                />
              </div>
            </TabsContent>

            {/* Link Tab (now supports tags) */}
            <TabsContent value="link" className="flex flex-col space-y-4">
              <Input
                placeholder="Title*"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
                disabled={isPosting}
              />
              <Input
                placeholder="Add tags (comma separated)"
                value={tags.join(',')}
                onChange={(e) =>
                  setTags(e.target.value.split(',').map((tag) => tag.trim()))
                }
                disabled={isPosting}
              />
              <Input
                placeholder="Paste a link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                disabled={isPosting}
              />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t shrink-0">
            <Button
              onClick={handlePost}
              disabled={!isFormValid}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}