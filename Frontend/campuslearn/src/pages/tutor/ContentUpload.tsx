import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Video, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/api';
import { Booking, StudentProgress, TutorWithModulesResponse } from '@/types';

interface UploadedContent {
  id: string;
  title: string;
  type: 'document' | 'video' | 'image';
  module: string;
  uploadDate: string;
  file_url?: string;
}

export default function ContentUpload() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadedContent[]>([]);
  const [title, setTitle] = useState('');
  const [module, setModule] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]); // Array of student IDs

  const [tutors, setTutors] = useState<TutorWithModulesResponse[]>([]); // Array with single tutor or empty

  useEffect(() => {
    const fetchTutorsWithModules = async () => {
      try {
        setIsLoadingModules(true);

        // Get single tutor by student ID
        const tutorsResponse = await apiClient.get(`/tutors/student/${user.id}`);
        const tutor = tutorsResponse.data;

        try {
          const modulesResponse = await apiClient.get(`/tutors/${tutor.id}/modules`);
          const modulesData: TutorWithModulesResponse = modulesResponse.data;

          const studentResponse = await apiClient.get(`/student/${tutor.studentId}`);
          const student = studentResponse.data;

          const modules = modulesData.modules || [];

          // Create object that matches TutorWithModulesResponse type
          const tutorWithDetails: TutorWithModulesResponse = {
            tutor: {
              id: tutor.id,
              studentId: tutor.studentId,
              created_at: tutor.created_at || new Date().toISOString(),
              studentEmail: tutor.studentEmail || student.email || '',
            },
            modules: modules,
          };

          setTutors([tutorWithDetails]);

        } catch (error) {
          console.error(`Failed to fetch data for tutor ${tutor.id}:`, error);

          // Create fallback that matches the type
          const tutorWithDetails: TutorWithModulesResponse = {
            tutor: {
              id: tutor.id,
              studentId: tutor.studentId,
              created_at: tutor.created_at || new Date().toISOString(),
              studentEmail: tutor.studentEmail || '',
            },
            modules: [],
          };

          setTutors([tutorWithDetails]);
        }
      } catch (error) {
        console.error('Error fetching tutors:', error);
        toast({ title: 'Error', description: 'Failed to load tutors', variant: 'destructive' });
        setTutors([]);
      } finally {
        setIsLoadingModules(false);
      }
    };

    fetchTutorsWithModules();
  }, [toast, user.id]);

  useEffect(() => {
    fetchTutorStudents();
  }, [user?.id]);

  const fetchTutorStudents = async () => {
    if (!user?.id) return;

    try {
      const tutorResponse = await apiClient.get(`/tutors/student/${user.id}`);
      const tutorData = tutorResponse.data;

      const bookingsResponse = await apiClient.get(`/api/bookings/tutor/${tutorData.id}`);
      const bookings: Booking[] = bookingsResponse.data;

      // Create a set of unique student IDs from bookings
      const studentIds = [...new Set(bookings.map(booking => booking.studentId))];

      // Fetch complete student data for each student ID
      const studentPromises = studentIds.map(async (studentId) => {
        try {
          const studentResponse = await apiClient.get(`/student/${studentId}`);
          return studentResponse.data;
        } catch (error) {
          console.error(`Error fetching student ${studentId}:`, error);
          return null;
        }
      });

      const studentDataArray = await Promise.all(studentPromises);
      const studentDataMap = new Map();

      // Create a map of student ID to student data for easy lookup
      studentDataArray.forEach(student => {
        if (student) {
          studentDataMap.set(student.id, student);
        }
      });
     
      const studentProgressMap = calculateStudentProgress(bookings, studentDataMap);
      const studentProgressArray = Array.from(studentProgressMap.values());

      setStudents(studentProgressArray);
      
    } catch (error) {
      console.error('Error fetching tutor students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStudentProgress = (bookings: Booking[], studentDataMap: Map<number, any>): Map<number, StudentProgress> => {
    const studentMap = new Map<number, StudentProgress>();

    bookings.forEach(booking => {
      if (!studentMap.has(booking.studentId)) {
        // Get student data from the map, or use booking data as fallback
        const studentData = studentDataMap.get(booking.studentId);

        studentMap.set(booking.studentId, {
          studentId: booking.studentId,
          studentName: studentData?.name || booking.studentName || 'Unknown Student',
          studentEmail: studentData?.email || booking.studentEmail || 'No email',
          totalLessons: 0,
          completedLessons: 0,
          completionRate: 0,
          totalLearningHours: 0,
          averageSessionLength: 0,
          subjectProgress: [],
          lastActive: new Date(booking.startDatetime).toLocaleDateString(),
          status: 'active',
          streak: 0,
          attendance: 0
        });
      }

      const student = studentMap.get(booking.studentId)!;
      student.totalLessons++;

      if (booking.status === 'completed') {
        student.completedLessons++;

        const start = new Date(booking.startDatetime);
        const end = new Date(booking.endDatetime);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        student.totalLearningHours += duration;
      }

      let subjectProgress = student.subjectProgress.find(sp => sp.subject === booking.subject);
      if (!subjectProgress) {
        subjectProgress = {
          subject: booking.subject || 'Unknown Subject',
          lessonsCompleted: 0,
          totalLessons: 0,
          progress: 0
        };
        student.subjectProgress.push(subjectProgress);
      }

      subjectProgress.totalLessons++;
      if (booking.status === 'completed') {
        subjectProgress.lessonsCompleted++;
      }
      subjectProgress.progress = (subjectProgress.lessonsCompleted / subjectProgress.totalLessons) * 100;
    });

    // Calculate additional metrics
    studentMap.forEach(student => {
      student.completionRate = student.totalLessons > 0 ? (student.completedLessons / student.totalLessons) * 100 : 0;
      student.averageSessionLength = student.completedLessons > 0 ? student.totalLearningHours / student.completedLessons : 0;
      student.attendance = student.totalLessons > 0 ? (student.completedLessons / student.totalLessons) * 100 : 0;
      student.streak = calculateStudentStreak(bookings, student.studentId);

     
    });

    return studentMap;
  };

  const calculateStudentStreak = (bookings: Booking[], studentId: number): number => {
    const studentBookings = bookings
      .filter(b => b.studentId === studentId && b.status === 'completed')
      .map(b => new Date(b.startDatetime).toDateString())
      .sort();

    if (studentBookings.length === 0) return 0;

    const uniqueDates = [...new Set(studentBookings)].sort();
    let streak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.ceil((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        currentStreak++;
        streak = Math.max(streak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return streak;
  };

  // File validation function
  const validateFile = (file: File): string | null => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];
    
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      return 'File type not supported. Please upload PDF, Word, PowerPoint, video, or image files.';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 100MB';
    }

    return null;
  };

  // Add this function to link learning materials to students via Resources table
  const linkMaterialToStudents = async (materialId: string, studentIds: string[]) => {
  try {
    console.log('🔗 Starting to link material to students...');
    console.log('Material ID:', materialId);
    console.log('Student IDs:', studentIds);
    console.log('Tutor:', tutors[0]?.tutor);

    // Create resource links for each selected student
    const linkPromises = studentIds.map(async (studentId) => {
      const resourceData = {
        studentId: parseInt(studentId),
        learningMaterialsId: materialId, // ✅ Fixed: with 's'
        tutorId: tutors[0]?.tutor?.id,
        moduleId: tutors[0]?.modules?.find(m => 
          m.module_code === selectedModule || m.module_name === selectedModule
        )?.id
      };

      console.log('📤 Sending resource data:', resourceData);

      const response = await apiClient.post('/resources', resourceData);
      console.log('✅ Resource created for student', studentId, ':', response.data);
      return response;
    });

    await Promise.all(linkPromises);
    console.log(`✅ Successfully linked material ${materialId} to ${studentIds.length} students`);
  } catch (error: any) {
    console.error('❌ Error linking material to students:', error);
    console.error('Error response:', error.response?.data);
    throw new Error('Failed to share content with selected students');
  }
};



  // Map file types to document types
  const getDocumentType = (file: File): string => {
    if (file.type.includes('video')) return 'VIDEO';
    if (file.type.includes('image')) return 'IMAGE';
    if (file.type.includes('pdf')) return 'PDF';
    if (file.type.includes('word') || file.type.includes('document')) return 'DOCUMENT';
    if (file.type.includes('presentation') || file.type.includes('powerpoint')) return 'PRESENTATION';
    return 'OTHER';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      document: 'bg-primary text-primary-foreground',
      video: 'bg-destructive text-destructive-foreground',
      image: 'bg-secondary text-secondary-foreground',
    };
    return colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Invalid file",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.split('.').slice(0, -1).join('.'));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!title || !selectedModule || !selectedFile || selectedStudents.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields, select a file, and choose at least one student",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('🚀 Starting upload process...');
      console.log('📊 Upload state:', {
        title,
        selectedModule,
        selectedFile: selectedFile?.name,
        selectedStudents,
        tutors: tutors[0],
        modules: tutors[0]?.modules,
        modulesCount: tutors[0]?.modules?.length
      });

      const formData = new FormData();
      formData.append('title', title);
      formData.append('document_type', getDocumentType(selectedFile));

      // Check if modules are loaded
      if (!tutors[0]?.modules?.length) {
        throw new Error('No modules available. Please wait for modules to load.');
      }

      // Find the selected module with better error handling
      const selectedModuleObj = tutors[0].modules.find(m => 
        m.module_code === selectedModule || m.module_name === selectedModule
      );
      
      console.log('🔍 Selected Module Object:', selectedModuleObj);
      console.log('📋 Available modules:', tutors[0].modules.map(m => ({
        code: m.module_code,
        name: m.module_name,
        id: m.id
      })));

      if (!selectedModuleObj) {
        throw new Error(`Module "${selectedModule}" not found in your assigned modules. Available modules: ${tutors[0].modules.map(m => m.module_name).join(', ')}`);
      }

      if (!selectedModuleObj.id) {
        throw new Error('Module ID is missing for the selected module');
      }

      formData.append('module_id', selectedModuleObj.id.toString());

      // Check if tutor data is available
      if (tutors[0]?.tutor?.id) {
        formData.append('uploader_id', tutors[0]?.tutor?.id.toString());
      } else {
        throw new Error('Tutor information not available');
      }

      formData.append('topic_id', '1');
      formData.append('file', selectedFile);

      // Add description and tags separately
      if (description) {
        formData.append('description', description);
      }
      
      if (tags) {
        formData.append('tags', tags);
      }

      // Log FormData contents for debugging
      console.log('📦 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      console.log('📤 Sending upload request to backend...');
      const response = await apiClient.post('/learning-materials/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
            console.log(`📊 Upload progress: ${progress}%`);
          }
        },
      });

      console.log('✅ Upload successful, response:', response.data);
      const savedMaterial = response.data;

      // ✅ Link the learning material to selected students via Resources table
      console.log('🔗 Linking material to students...');
      await linkMaterialToStudents(savedMaterial.id, selectedStudents);

      const fileType = selectedFile.type.includes('video') ? 'video' :
        selectedFile.type.includes('image') ? 'image' : 'document';

      const newUpload: UploadedContent = {
        id: savedMaterial.id,
        title: savedMaterial.title,
        type: fileType,
        module: selectedModule,
        uploadDate: new Date().toISOString().split('T')[0],
        file_url: savedMaterial.file_url,
      };

      setUploads([newUpload, ...uploads]);

      // Reset form
      setTitle('');
      setSelectedModule('');
      setSelectedStudents([]); // Reset student selection
      setDescription('');
      setTags('');
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Content uploaded successfully!",
        description: `Your content has been uploaded and shared with ${selectedStudents.length} student(s)`,
      });

    } catch (error: any) {
      console.error('❌ Upload error details:', {
        error: error.response?.data || error.message,
        errorStack: error.stack,
        tutors: tutors[0],
        selectedModule,
        availableModules: tutors[0]?.modules?.map(m => m.module_name)
      });
      
      // More detailed error logging
      if (error.response) {
        console.error('📡 Response error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('🌐 No response received:', error.request);
      } else {
        console.error('⚙️ Request setup error:', error.message);
      }
      
      toast({
        title: "Upload failed",
        description: error.response?.data?.error || error.message || "Failed to upload content",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await apiClient.delete(`/learning-materials/${id}`);
      
      setUploads(uploads.filter(u => u.id !== id));
      toast({
        title: "Content deleted",
        description: "The content has been removed from both storage and database",
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.response?.data?.error || "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (content: UploadedContent) => {
    try {
      const response = await apiClient.get(`/learning-materials/${content.id}/download`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = content.title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Your file is being downloaded",
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: error.response?.data?.error || "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "File removed",
      description: "The selected file has been removed",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Upload</h1>
        <p className="text-muted-foreground">Upload and manage your course materials with Supabase Storage</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Content
            </CardTitle>
            <CardDescription>Share materials with your students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Content Title</Label>
              <Input
                id="title"
                placeholder="e.g., Week 1 - Introduction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module">Module</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger id="module">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {tutors[0]?.modules?.map((module) => (
                    <SelectItem key={module.id} value={module.module_code || module.module_name}>
                      {module.module_code ? `${module.module_code} - ${module.module_name}` : module.module_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Send to Students</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">No students available</p>
                ) : (
                  students.map((student) => (
                    <div key={student.studentId} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`student-${student.studentId}`}
                        checked={selectedStudents.includes(student.studentId.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.studentId.toString()]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.studentId.toString()));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label 
                        htmlFor={`student-${student.studentId}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        <span className="font-medium">{student.studentName}</span>
                        {student.studentEmail && (
                          <span className="text-muted-foreground ml-2">({student.studentEmail})</span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
              
              {selectedStudents.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Sharing with {selectedStudents.length} student(s)
                  </p>
                </div>
              )}
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the content"
                rows={3}
                className="resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="e.g., introduction, basics, week1 (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Add relevant tags separated by commas to help with search and organization
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <input
                ref={fileInputRef}
                type="file"
                id="file"
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif"
              />
              {selectedFile ? (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Upload className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {getDocumentType(selectedFile)}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the selected file. You'll need to select a new file if you want to upload content.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveFile}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                    }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, Video, or Image files
                  </p>
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleUpload}
                disabled={isUploading || !title || !selectedFile || !selectedModule || selectedStudents.length === 0}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload & Share Content
                  </>
                )}
              </Button>
              
              
            </div>
          </CardContent>
        </Card>

        {/* Statistics card remains the same */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Statistics</CardTitle>
            <CardDescription>Your content overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{uploads.filter(u => u.type === 'document').length}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Video className="h-6 w-6 mx-auto mb-2 text-destructive" />
                <p className="text-2xl font-bold">{uploads.filter(u => u.type === 'video').length}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <ImageIcon className="h-6 w-6 mx-auto mb-2 text-secondary" />
                <p className="text-2xl font-bold">{uploads.filter(u => u.type === 'image').length}</p>
                <p className="text-xs text-muted-foreground">Images</p>
              </div>
            </div>
            <div className="space-y-3 pt-4">
              <h4 className="font-semibold text-sm">Total Uploads</h4>
              <p className="text-2xl font-bold">{uploads.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Your uploaded content with Supabase Storage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uploads.map((content) => (
              <div key={content.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted">
                    {getTypeIcon(content.type)}
                  </div>
                  <div>
                    <p className="font-medium">{content.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getTypeBadge(content.type)}>
                        {content.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{content.module}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{content.uploadDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {content.file_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(content)}
                    >
                      Download
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this content from both the database and Supabase storage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemove(content.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            {uploads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No content uploaded yet</p>
                <p className="text-sm">Upload your first file to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}