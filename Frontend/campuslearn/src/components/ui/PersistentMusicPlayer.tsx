import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PersistentMusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && isMinimized) {
        e.preventDefault();
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, isMinimized]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMinimized && e.target === e.currentTarget) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg"
        size="icon"
      >
        <Music className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "fixed z-50 shadow-2xl transition-all duration-300",
        isMinimized ? "w-80 cursor-move" : "w-[95vw] md:w-[90vw] lg:w-[1200px]",
        isMinimized ? "" : "bottom-6 right-6"
      )}
      style={isMinimized ? {
        bottom: `${24 - position.y}px`,
        right: `${24 - position.x}px`,
      } : undefined}
    >
      <div 
        className={cn(
          "p-3 border-b flex items-center justify-between bg-muted/50",
          isMinimized && "cursor-move"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Study Vibes</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className={cn(
        "p-4 flex flex-col md:flex-row gap-4 max-h-[70vh] overflow-auto",
        isMinimized && "h-0 max-h-0 p-0 opacity-0 pointer-events-none overflow-hidden"
      )}>
        {/* Apple Music */}
        <iframe
          allow="autoplay *; encrypted-media *;"
          frameBorder="0"
          height="352"
          style={{
            width: "100%",
            maxWidth: "660px",
            overflow: "hidden",
            background: "transparent",
          }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src="https://embed.music.apple.com/za/playlist/hitting-the-books/pl.5aedf81bd67d478fa0a17fd58a95a2bc"
        />

        {/* Spotify */}
        <iframe
          style={{ borderRadius: "12px" }}
          src="https://open.spotify.com/embed/playlist/37i9dQZF1EIfMdgv54LYV9?utm_source=generator"
          width="100%"
          height="352"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />

        {/* YouTube Music (via YouTube playlist embed) */}
    <iframe
      width="100%"
      height="352"
      src="https://www.youtube.com/embed?listType=playlist&list=PLjPNN6q0vqfKP7DlR4i0A5evoAd9PYv_l"
      frameBorder="0"
      allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture"
      allowFullScreen
    />
      </div>
    </Card>
  );
}