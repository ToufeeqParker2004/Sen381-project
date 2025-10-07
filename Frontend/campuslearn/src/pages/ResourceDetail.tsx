import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Star, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChatbotBox } from '@/components/ui/chatbot-box';

// Mock resource data - in a real app, this would come from an API
const mockResource = {
  id: '1',
  title: 'Introduction to React Hooks',
  description: 'A comprehensive guide to understanding and using React Hooks in modern applications. This resource covers useState, useEffect, useContext, and custom hooks with practical examples.',
  type: 'document',
  category: 'Programming',
  author: 'Dr. Sarah Johnson',
  downloads: 1234,
  rating: 4.8,
  size: '2.3 MB',
  uploadDate: '2024-01-15',
  tags: ['React', 'JavaScript', 'Frontend', 'Hooks', 'Modern Development'],
  content: `
# Introduction to React Hooks

React Hooks revolutionized how we write React components by allowing us to use state and other React features without writing class components.

## What are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8.

## Basic Hooks

### useState
The useState Hook allows you to add state to functional components:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### useEffect
The useEffect Hook lets you perform side effects in function components:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Advanced Hooks

### useContext
The useContext Hook accepts a context object and returns the current context value:

\`\`\`javascript
import React, { useContext } from 'react';

const ThemeContext = React.createContext();

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
\`\`\`

## Custom Hooks

Custom Hooks are JavaScript functions whose names start with "use" and that may call other Hooks:

\`\`\`javascript
import { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
\`\`\`

## Best Practices

1. **Only call Hooks at the top level** - Don't call Hooks inside loops, conditions, or nested functions
2. **Only call Hooks from React functions** - Call them from React function components or custom Hooks
3. **Use the ESLint plugin** - Install eslint-plugin-react-hooks to enforce these rules

## Conclusion

React Hooks provide a more direct API to the React concepts you already know. They offer a powerful way to compose behavior and share stateful logic between components.
  `
};
export default function ResourceDetail() {
  const {
    id
  } = useParams();

  // In a real app, you'd fetch the resource based on the ID
  const resource = mockResource;
  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 text-yellow-400" />);
    }
    return stars;
  };
  return <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/resources">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Link>
        </Button>
      </div>

      {/* Resource Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{resource.title}</CardTitle>
              <p className="text-muted-foreground">{resource.description}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {resource.tags.map(tag => <Badge key={tag} variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>)}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{resource.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>{resource.downloads.toLocaleString()} downloads</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex">{getRatingStars(resource.rating)}</div>
              <span>{resource.rating} ({resource.size})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      

      {/* AI Chatbot Box */}
      <ChatbotBox />
    </div>;
}