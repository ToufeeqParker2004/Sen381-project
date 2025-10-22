import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Search, Filter, BookOpen, Video, FileImage, Link as LinkIcon, Star, Eye, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/services/api';
import { Match, Student, StudentResourceResponse } from '@/types';
import DocumentPreview from '@/components/ui/DocumentPreview';

export default function Resources() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();

  const [studentResources, setStudentResources] = useState<StudentResourceResponse | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploaderInfo, setUploaderInfo] = useState<{ [tutorId: number]: Student }>({});

  // Helper function to get uploader name - MOVED UP
  const getUploaderName = (uploaderId: number) => {
    const student = uploaderInfo[uploaderId];

    if (student) {
      return student.name || student.email || `Tutor ${uploaderId}`;
    }

    // Fallback to tutor email from match
    const matchWithTutor = matches.find(match =>
      match.learningMaterial.uploaderId === uploaderId
    );

    if (matchWithTutor?.tutor.studentEmail) {
      const email = matchWithTutor.tutor.studentEmail;
      const namePart = email.split('@')[0];
      const formattedName = namePart.split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      return formattedName;
    }

    return `Tutor ${uploaderId}`;
  };

  // Filter resources based on search query and active tab
  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) {
      return matches;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return matches.filter(match => {
      const material = match.learningMaterial;
      
      // Search in title
      if (material.title?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search in tags
      if (material.tags?.some(tag => tag.toLowerCase().includes(query))) {
        return true;
      }
      
      // Search in uploader name
      const uploaderName = getUploaderName(material.uploaderId).toLowerCase();
      if (uploaderName.includes(query)) {
        return true;
      }
      
      // Search in document type
      if (material.documentType?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search in topic/module
      if (material.topicId?.toString().toLowerCase().includes(query)) {
        return true;
      }
      
      return false;
    });
  }, [matches, searchQuery, getUploaderName]);

  // Fetch ALL data from the endpoint (including uploader information)
  useEffect(() => {
    const fetchUploaderInformation = async (matches: Match[]) => {
      try {
        // Step 1: Get all unique uploader IDs (tutor IDs)
        const uniqueUploaderIds = [...new Set(
          matches.map(match => match.learningMaterial.uploaderId)
        )];

        console.log('👨‍🏫 All unique uploader IDs from matches:', uniqueUploaderIds);

        // Step 2: Fetch all tutors in parallel
        const tutorPromises = uniqueUploaderIds.map(async (uploaderId) => {
          try {
            console.log(`📡 Fetching tutor ${uploaderId}...`);
            const response = await apiClient.get(`/tutors/${uploaderId}`);
            console.log(`✅ Tutor ${uploaderId} response:`, response.data);
            return { uploaderId, tutor: response.data };
          } catch (error) {
            console.error(`❌ Error fetching tutor ${uploaderId}:`, error);
            return { uploaderId, tutor: null };
          }
        });

        const tutorResults = await Promise.all(tutorPromises);

        // Log all tutor results
        console.log('📊 All tutor results:', tutorResults);

        const tutorMap: { [key: number]: any } = {};
        tutorResults.forEach(result => {
          if (result.tutor) {
            tutorMap[result.uploaderId] = result.tutor;
          }
        });

        // Step 3: Get all unique student IDs from tutors
        const uniqueStudentIds = [...new Set(
          tutorResults
            .map(result => result.tutor?.studentId) // This should match your Tutor interface
            .filter(Boolean)
        )];

        console.log('🎓 Student IDs found from tutors:', uniqueStudentIds);

        // Step 4: Fetch all students in parallel
        const studentPromises = uniqueStudentIds.map(async (studentId) => {
          try {
            console.log(`📡 Fetching student ${studentId}...`);
            const response = await apiClient.get<Student>(`/student/${studentId}`);
            console.log(`✅ Student ${studentId} response:`, response.data);
            return { studentId, student: response.data };
          } catch (error) {
            console.error(`❌ Error fetching student ${studentId}:`, error);
            return { studentId, student: null };
          }
        });

        const studentResults = await Promise.all(studentPromises);

        // Log all student results
        console.log('📊 All student results:', studentResults);

        const studentMap: { [key: number]: Student } = {};
        studentResults.forEach(result => {
          if (result.student) {
            studentMap[result.studentId] = result.student;
          }
        });

        // Step 5: Create tutorId -> student mapping
        const tutorToStudentMap: { [tutorId: number]: Student } = {};

        tutorResults.forEach(result => {
          if (result.tutor && result.tutor.studentId) {
            const student = studentMap[result.tutor.studentId];
            console.log(`🔗 Mapping tutor ${result.uploaderId} to student ${result.tutor.studentId}:`, student);
            if (student) {
              tutorToStudentMap[result.uploaderId] = student;
            }
          } else {
            console.log(`⚠️ Tutor ${result.uploaderId} has no studentId`, result.tutor);
          }
        });

        setUploaderInfo(tutorToStudentMap);
        console.log('✅ Final uploaderInfo mapping:', tutorToStudentMap);

      } catch (error) {
        console.error('Error fetching uploader information:', error);
      }
    };

    const fetchAllResources = async () => {
      try {
        setIsLoading(true);

        // Fetch the complete response
        const response = await apiClient.get<StudentResourceResponse>(`/resources/search/by-student/${user?.id}`);
        const resourceData: StudentResourceResponse = response.data;

        console.log('📦 Complete API Response:', resourceData);
        console.log('🎯 Student ID:', resourceData.studentId);
        console.log('🔗 Number of matches:', resourceData.matches.length);

        // Store everything
        setStudentResources(resourceData);
        setMatches(resourceData.matches);

        // Log detailed information about document types for debugging
        console.log('📊 Document types found in resources:');
        resourceData.matches.forEach((match, index) => {
          console.log(`Resource ${index + 1}:`, {
            title: match.learningMaterial.title,
            documentType: match.learningMaterial.documentType,
            normalizedType: match.learningMaterial.documentType?.toLowerCase()
          });
        });

        // NEW: Fetch uploader information
        await fetchUploaderInformation(resourceData.matches);

      } catch (error) {
        console.error('Error fetching resources:', error);
        toast({
          title: 'Error',
          description: 'Failed to load resources',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllResources();
  }, [toast, user?.id]);

  // FIXED: Better document type categorization based on your actual data
  const getResourceCategory = (documentType: string): string => {
    const normalizedType = documentType?.toLowerCase() || '';
    
    if (normalizedType === 'video') return 'video';
    if (normalizedType === 'image') return 'image';
    if (normalizedType === 'link') return 'link';
    
    // Everything else is considered a document
    return 'document';
  };

  const getResourceIcon = (documentType: string) => {
    const category = getResourceCategory(documentType);
    switch (category) {
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

  const getResourceColor = (documentType: string) => {
    const category = getResourceCategory(documentType);
    switch (category) {
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

  // FIXED: Better display name for document types
  const getDisplayType = (documentType: string): string => {
    const normalizedType = documentType?.toLowerCase() || '';
    
    switch (normalizedType) {
      case 'pdf':
        return 'PDF';
      case 'word':
        return 'Word Document';
      case 'presentation':
        return 'Presentation';
      case 'video':
        return 'Video';
      case 'image':
        return 'Image';
      case 'link':
        return 'Link';
      case 'document':
      default:
        return 'Document';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading resources...</p>
        </div>
      </div>
    );
  }

  // Safe slice function to prevent null errors
  const safeSlice = (array: any[] | null | undefined, start: number, end?: number): any[] => {
    if (!array) return [];
    return array.slice(start, end);
  };

  // Function to render resource card - FIXED VERSION
  const renderResourceCard = (resource: Match) => {
    const IconComponent = getResourceIcon(resource.learningMaterial.documentType);
    const iconColor = getResourceColor(resource.learningMaterial.documentType);
    const displayType = getDisplayType(resource.learningMaterial.documentType);
    
    // Safe handling of tags array
    const tags = resource.learningMaterial.tags || [];
    const displayedTags = safeSlice(tags, 0, 3);
    const remainingTagsCount = Math.max(0, tags.length - 3);
    
    return (
      <Card key={resource.learningMaterial.id} className="hover:shadow-custom-md transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-4">
            <div className={`p-2 md:p-3 rounded-lg bg-muted self-center md:self-start`}>
              <IconComponent className={`h-6 w-6 md:h-8 md:w-8 ${iconColor}`} />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold mb-1 hover:underline line-clamp-2">
                      {resource.learningMaterial.title || 'Untitled Resource'}
                    </h3>
              
                  <div className="flex flex-wrap justify-center md:justify-start gap-1 mb-3">
                    {displayedTags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {remainingTagsCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        +{remainingTagsCount} more
                      </Badge>
                    )}
                    {tags.length === 0 && (
                      <Badge variant="outline" className="text-xs">
                        No tags
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 text-xs md:text-sm text-muted-foreground space-y-1 md:space-y-0">
                    <span className="text-center md:text-left">
                      by {getUploaderName(resource.learningMaterial.uploaderId)}
                    </span>
                    <span className="hidden md:block">•</span>
                    <span className="text-center md:text-left">
                      {displayType}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    {resource.learningMaterial.topicId || 'General'}
                  </Badge>
                  <div className="flex space-x-2">
                    <DocumentPreview 
                      documentUrl={resource.learningMaterial.fileUrl}
                      documentName={resource.learningMaterial.title}
                      fileType={resource.learningMaterial.documentType}
                    />
                    <Button 
                      size="sm" 
                      className="bg-gradient-primary hover:opacity-90"
                      asChild
                    >
                      <a 
                        href={resource.learningMaterial.fileUrl} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get resources for current tab with search filtering - FIXED
  const getTabResources = (tabValue: string) => {
    let tabResources = filteredResources;

    switch (tabValue) {
      case 'documents':
        tabResources = filteredResources.filter(match => 
          getResourceCategory(match.learningMaterial.documentType) === 'document'
        );
        break;
      case 'videos':
        tabResources = filteredResources.filter(match => 
          getResourceCategory(match.learningMaterial.documentType) === 'video'
        );
        break;
      case 'images':
        tabResources = filteredResources.filter(match => 
          getResourceCategory(match.learningMaterial.documentType) === 'image'
        );
        break;
      case 'links':
        tabResources = filteredResources.filter(match => 
          getResourceCategory(match.learningMaterial.documentType) === 'link'
        );
        break;
      default:
        // 'all' tab - use all filtered resources
        break;
    }

    return tabResources;
  };

  // Empty State Component
  const EmptyState: React.FC<{ type: string; hasSearchQuery: boolean }> = ({ type, hasSearchQuery }) => (
    <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
      {type === 'documents' && <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
      {type === 'videos' && <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
      {type === 'images' && <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
      {type === 'links' && <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
      {type === 'all' && <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
      
      <h3 className="text-lg font-semibold mb-2 capitalize">
        {hasSearchQuery ? 'No resources found' : `No ${type} found`}
      </h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        {hasSearchQuery 
          ? `No ${type} resources match your search for "${searchQuery}". Try different keywords.`
          : type === 'documents' && "You don't have any document resources yet."
        }
        {hasSearchQuery 
          ? `No ${type} resources match your search for "${searchQuery}". Try different keywords.`
          : type === 'videos' && "You don't have any video resources yet."
        }
        {hasSearchQuery 
          ? `No ${type} resources match your search for "${searchQuery}". Try different keywords.`
          : type === 'images' && "You don't have any image resources yet."
        }
        {hasSearchQuery 
          ? `No ${type} resources match your search for "${searchQuery}". Try different keywords.`
          : type === 'links' && "You don't have any link resources yet."
        }
        {hasSearchQuery && type === 'all' 
          ? `No resources match your search for "${searchQuery}". Try different keywords.`
          : type === 'all' && "You don't have any resources yet."
        }
      </p>
      {hasSearchQuery && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => setSearchQuery('')}
        >
          Clear Search
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
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
              <Input 
                placeholder="Search by title, tags, uploader, type..." 
                className="pl-9" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
            {searchQuery && (
              <div className="flex items-center">
                <p className="text-sm text-muted-foreground">
                  {filteredResources.length} result{filteredResources.length !== 1 ? 's' : ''} found
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="all" className="text-xs md:text-sm">
            All ({getTabResources('all').length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs md:text-sm">
            Documents ({getTabResources('documents').length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="text-xs md:text-sm">
            Videos ({getTabResources('videos').length})
          </TabsTrigger>
          <TabsTrigger value="images" className="text-xs md:text-sm">
            Images ({getTabResources('images').length})
          </TabsTrigger>
          <TabsTrigger value="links" className="text-xs md:text-sm">
            Links ({getTabResources('links').length})
          </TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-4 md:gap-6">
            {getTabResources('all').map(resource => renderResourceCard(resource))}
            {getTabResources('all').length === 0 && (
              <EmptyState type="all" hasSearchQuery={!!searchQuery} />
            )}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="grid gap-4 md:gap-6">
            {getTabResources('documents').map(resource => renderResourceCard(resource))}
            {getTabResources('documents').length === 0 && (
              <EmptyState type="documents" hasSearchQuery={!!searchQuery} />
            )}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-6">
          <div className="grid gap-4 md:gap-6">
            {getTabResources('videos').map(resource => renderResourceCard(resource))}
            {getTabResources('videos').length === 0 && (
              <EmptyState type="videos" hasSearchQuery={!!searchQuery} />
            )}
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          <div className="grid gap-4 md:gap-6">
            {getTabResources('images').map(resource => renderResourceCard(resource))}
            {getTabResources('images').length === 0 && (
              <EmptyState type="images" hasSearchQuery={!!searchQuery} />
            )}
          </div>
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="space-y-6">
          <div className="grid gap-4 md:gap-6">
            {getTabResources('links').map(resource => renderResourceCard(resource))}
            {getTabResources('links').length === 0 && (
              <EmptyState type="links" hasSearchQuery={!!searchQuery} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}