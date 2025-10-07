import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Search, Filter, BookOpen, Video, FileImage, Link as LinkIcon, Star, Eye, Upload } from 'lucide-react';
export default function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const resources = [{
    id: 1,
    title: 'Calculus Cheat Sheet',
    description: 'Complete reference for integration and differentiation',
    type: 'document',
    category: 'Mathematics',
    author: 'Dr. Sarah Wilson',
    downloads: 245,
    rating: 4.8,
    size: '2.3 MB',
    uploadDate: '2023-11-15',
    tags: ['calculus', 'integration', 'differentiation']
  }, {
    id: 2,
    title: 'Data Structures Video Tutorial',
    description: 'Comprehensive video series on arrays, linked lists, and trees',
    type: 'video',
    category: 'Computer Science',
    author: 'Prof. Mike Chen',
    downloads: 156,
    rating: 4.9,
    size: '120 min',
    uploadDate: '2023-11-10',
    tags: ['data-structures', 'algorithms', 'programming']
  }, {
    id: 3,
    title: 'Organic Chemistry Reaction Map',
    description: 'Visual guide to common organic chemistry reactions',
    type: 'image',
    category: 'Chemistry',
    author: 'Dr. Emma Rodriguez',
    downloads: 89,
    rating: 4.7,
    size: '5.1 MB',
    uploadDate: '2023-11-08',
    tags: ['organic-chemistry', 'reactions', 'visual-guide']
  }, {
    id: 4,
    title: 'Physics Problem Solver',
    description: 'Interactive web tool for solving physics problems',
    type: 'link',
    category: 'Physics',
    author: 'Physics Department',
    downloads: 312,
    rating: 4.6,
    size: 'Web App',
    uploadDate: '2023-11-05',
    tags: ['physics', 'problem-solving', 'interactive']
  }];
  const categories = [{
    value: 'all',
    label: 'All Categories',
    count: 156
  }, {
    value: 'mathematics',
    label: 'Mathematics',
    count: 45
  }, {
    value: 'computer-science',
    label: 'Computer Science',
    count: 38
  }, {
    value: 'chemistry',
    label: 'Chemistry',
    count: 29
  }, {
    value: 'physics',
    label: 'Physics',
    count: 22
  }, {
    value: 'biology',
    label: 'Biology',
    count: 18
  }, {
    value: 'general',
    label: 'General Study',
    count: 34
  }];
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'video':
        return Video;
      case 'image':
        return FileImage;
      case 'link':
        return LinkIcon;
      default:
        return FileText;
    }
  };
  const getResourceColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'text-primary';
      case 'video':
        return 'text-secondary';
      case 'image':
        return 'text-success';
      case 'link':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Resources</h1>
          <p className="text-muted-foreground">Access study materials, guides, and tools</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search resources..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => <SelectItem key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="all" className="text-xs md:text-sm">All</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs md:text-sm">Documents</TabsTrigger>
          <TabsTrigger value="videos" className="text-xs md:text-sm">Videos</TabsTrigger>
          <TabsTrigger value="images" className="text-xs md:text-sm">Images</TabsTrigger>
          <TabsTrigger value="links" className="text-xs md:text-sm">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-4 md:gap-6">
            {resources.map(resource => {
            const IconComponent = getResourceIcon(resource.type);
            const iconColor = getResourceColor(resource.type);
            return <Card key={resource.id} className="hover:shadow-custom-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-4">
                      <div className={`p-2 md:p-3 rounded-lg bg-muted self-center md:self-start`}>
                        <IconComponent className={`h-6 w-6 md:h-8 md:w-8 ${iconColor}`} />
                      </div>
                      
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            <Link to={`/resources/${resource.id}`} className="block hover:text-primary transition-colors">
                              <h3 className="text-base md:text-lg font-semibold mb-1 hover:underline line-clamp-2">{resource.title}</h3>
                            </Link>
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{resource.description}</p>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-1 mb-3">
                              {resource.tags.slice(0, 3).map(tag => <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>)}
                              {resource.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{resource.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 text-xs md:text-sm text-muted-foreground space-y-1 md:space-y-0">
                              <span className="text-center md:text-left">by {resource.author}</span>
                              <span className="text-center md:text-left">{resource.size}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="secondary" className="text-xs">
                              {resource.category}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/resources/${resource.id}`}>
                                  <Eye className="mr-1 h-3 w-3" />
                                  Preview
                                </Link>
                              </Button>
                              <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                                <Download className="mr-1 h-3 w-3" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>
        </TabsContent>

        {/* Additional tab contents would go here for documents, videos, etc. */}
        <TabsContent value="documents" className="space-y-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Document Resources</h3>
            <p className="text-muted-foreground">Filter view for document resources would be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      
    </div>;
}