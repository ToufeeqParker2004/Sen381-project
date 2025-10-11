import React, { useEffect, useState } from 'react';
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

export default function Resources() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();
  
  const [studentResources, setStudentResources] = useState<StudentResourceResponse | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploaderInfo, setUploaderInfo] = useState<{ [tutorId: number]: Student }>({});

  // Helper function to get uploader name
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
        
        // Log detailed information
        resourceData.matches.forEach((match, index) => {
          console.log(`\n--- Match ${index + 1} ---`);
          console.log('📚 Learning Material:', match.learningMaterial);
          console.log('👨‍🏫 Tutor Info:', match.tutor);
          console.log('🔗 Resource ID:', match.resourceId);
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
              <Input placeholder="Search resources..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </SelectItem>
                ))}
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
            {matches.map(resource => {
              const IconComponent = getResourceIcon(resource.learningMaterial.documentType);
              const iconColor = getResourceColor(resource.learningMaterial.documentType);
              
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
                            <Link to={`/resources/${resource.learningMaterial.id}`} className="block hover:text-primary transition-colors">
                              <h3 className="text-base md:text-lg font-semibold mb-1 hover:underline line-clamp-2">
                                {resource.learningMaterial.title}
                              </h3>
                            </Link>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-1 mb-3">
                              {resource.learningMaterial.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {resource.learningMaterial.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{resource.learningMaterial.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 text-xs md:text-sm text-muted-foreground space-y-1 md:space-y-0">
                              <span className="text-center md:text-left">
                                by {getUploaderName(resource.learningMaterial.uploaderId)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="secondary" className="text-xs">
                              {resource.learningMaterial.topicId}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/resources/${resource.resourceId}`}>
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
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Document Resources</h3>
            <p className="text-muted-foreground">Filter view for document resources would be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}