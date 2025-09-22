import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Link,
  Image,
  List,
  ListOrdered,
  Code,
  Quote,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [community, setCommunity] = useState('');
  const [postType, setPostType] = useState('text');

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
    { icon: Link, label: 'Link' },
    { icon: Image, label: 'Image' },
    { icon: List, label: 'Bullet List' },
    { icon: ListOrdered, label: 'Numbered List' },
    { icon: Code, label: 'Code Block' },
    { icon: Quote, label: 'Quote' },
    { icon: MoreHorizontal, label: 'More' },
  ];

  const handleSaveDraft = () => {
    // For now, we'll just show an alert. In a real app, this would save to backend
    alert('To save drafts, you need to connect to Supabase for backend storage.');
  };

  const handlePost = () => {
    // For now, we'll just show an alert. In a real app, this would post to backend
    alert('To create posts, you need to connect to Supabase for backend storage.');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0 pb-4">
          <DialogTitle className="text-2xl">Create post</DialogTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Drafts</span>
            <Badge variant="secondary" className="bg-warning text-warning-foreground">1</Badge>
          </div>
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
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="images">Images & Video</TabsTrigger>
              <TabsTrigger value="link">Link</TabsTrigger>
              <TabsTrigger value="poll">Poll</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="flex-1 flex flex-col space-y-4 overflow-hidden min-h-0">
              {/* Title */}
              <div className="space-y-2 shrink-0">
                <Input
                  placeholder="Title*"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                  maxLength={300}
                />
                <div className="text-right text-xs text-muted-foreground">
                  {title.length}/300
                </div>
              </div>

              {/* Tags */}
              <Input
                placeholder="Add tags"
                className="shrink-0"
              />

              {/* Content Editor */}
              <div className="flex-1 flex flex-col border rounded-lg overflow-hidden min-h-0">
                {/* Formatting Toolbar */}
                <div className="flex items-center space-x-1 p-2 border-b bg-muted/30 shrink-0 overflow-x-auto">
                  {formatButtons.map((button, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      title={button.label}
                    >
                      <button.icon className="h-4 w-4" />
                    </Button>
                  ))}
                  <div className="ml-auto shrink-0">
                    <Button variant="ghost" size="sm" className="text-xs whitespace-nowrap">
                      Switch to Markdown Editor
                    </Button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                  <Textarea
                    placeholder="Body text (optional)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="h-full w-full border-0 resize-none focus-visible:ring-0 rounded-none"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="images" className="flex-1 overflow-hidden">
              <div className="h-full flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center space-y-2">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Drag & drop images or videos</p>
                  <Button variant="outline">Browse Files</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="link" className="flex-1 overflow-auto">
              <div className="space-y-4">
                <Input placeholder="URL" />
                <Textarea placeholder="Description (optional)" className="min-h-[200px]" />
              </div>
            </TabsContent>

            <TabsContent value="poll" className="flex-1 overflow-auto">
              <div className="space-y-4">
                <Input placeholder="Poll question" />
                <div className="space-y-2">
                  <Input placeholder="Option 1" />
                  <Input placeholder="Option 2" />
                  <Button variant="outline" size="sm">Add Option</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t shrink-0">
            <Button variant="outline" onClick={handleSaveDraft}>
              Save Draft
            </Button>
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