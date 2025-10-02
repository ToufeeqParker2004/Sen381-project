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
  Image as ImageIcon,
  List,
  ListOrdered,
  Code,
  Quote,
  MoreHorizontal,
} from 'lucide-react';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  onPostCreated?: () => void;
}

export function CreatePostModal({ open, onOpenChange, userId, onPostCreated }: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [community, setCommunity] = useState('');
  const [postType, setPostType] = useState('text');
  const [link, setLink] = useState('');
  const [media, setMedia] = useState<File | null>(null);

  const communities = [
    'Mathematics',
    'Computer Science',
    'Chemistry',
    'Physics',
    'General Discussion',
    'Study Groups'
  ];

  const formatButtons = [
    { icon: Bold, label: 'Bold' },
    { icon: Italic, label: 'Italic' },
    { icon: Strikethrough, label: 'Strikethrough' },
    { icon: Superscript, label: 'Superscript' },
    { icon: Type, label: 'Text' },
    { icon: LinkIcon, label: 'Link' },
    { icon: ImageIcon, label: 'Image' },
    { icon: List, label: 'Bullet List' },
    { icon: ListOrdered, label: 'Numbered List' },
    { icon: Code, label: 'Code Block' },
    { icon: Quote, label: 'Quote' },
    { icon: MoreHorizontal, label: 'More' },
  ];

  const handlePost = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const payload: any = {
        author_id: userId,
        title,
        content,
        community,
        tags,
        postType,
      };

      if (postType === 'link') {
        payload.link = link;
      }

      if (postType === 'images' && media) {
        // for now just send filename; adjust later for upload
        payload.mediaName = media.name;
      }

      const res = await fetch("http://localhost:9090/ForumPosts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || data.message || "Failed to create post");
        return;
      }

      alert(data.message || "Post created successfully!");
      setTitle("");
      setContent("");
      setCommunity("");
      setTags([]);
      setLink("");
      setMedia(null);
      onOpenChange(false);

      if (onPostCreated) onPostCreated();

    } catch (err: any) {
      alert(err.message || "Network error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 pb-4">
          <DialogTitle className="text-2xl">Create post</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden min-h-0">
          {/* Community Selection */}
          <Select value={community} onValueChange={setCommunity}>
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
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="images">Images & Video</TabsTrigger>
              <TabsTrigger value="link">Link</TabsTrigger>
            </TabsList>

            {/* Text Tab */}
            <TabsContent value="text" className="flex-1 flex flex-col space-y-4 overflow-hidden min-h-0">
              <Input
                placeholder="Title*"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
                maxLength={300}
              />
              <Input
                placeholder="Add tags (comma separated)"
                value={tags.join(",")}
                onChange={(e) => setTags(e.target.value.split(",").map(tag => tag.trim()))}
              />
              <div className="flex-1 flex flex-col border rounded-lg overflow-hidden min-h-0">
                <div className="flex items-center space-x-1 p-2 border-b bg-muted/30 shrink-0 overflow-x-auto">
                  {formatButtons.map((button, index) => (
                    <Button key={index} variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" title={button.label}>
                      <button.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
                <Textarea
                  placeholder="Body text (optional)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-full w-full border-0 resize-none focus-visible:ring-0 rounded-none"
                />
              </div>
            </TabsContent>

            {/* Images & Video Tab */}
            <TabsContent value="images" className="flex flex-col space-y-4">
              <Input
                placeholder="Title*"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setMedia(e.target.files ? e.target.files[0] : null)}
              />
            </TabsContent>

            {/* Link Tab */}
            <TabsContent value="link" className="flex flex-col space-y-4">
              <Input
                placeholder="Title*"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
              <Input
                placeholder="Paste a link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t shrink-0">
            <Button
              onClick={handlePost}
              disabled={!title.trim() || !community}
              className="bg-gradient-primary hover:opacity-90"
            >
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
