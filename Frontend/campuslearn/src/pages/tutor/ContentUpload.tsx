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
import { TutorWithModulesResponse } from '@/types';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const { toast } = useToast();

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
  if (!title || !selectedModule || !selectedFile) {
    toast({
      title: "Missing information",
      description: "Please fill in all fields and select a file",
      variant: "destructive",
    });
    return;
  }

  setIsUploading(true);
  setUploadProgress(0);

  try {
    // Debug: Log current state
    console.log('Upload state:', {
      title,
      selectedModule,
      selectedFile: selectedFile?.name,
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
    
    console.log('Found module:', selectedModuleObj);
    console.log('Available modules:', tutors[0].modules.map(m => ({
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
      formData.append('uploader_id', tutors[0].tutor.id.toString());
    } else {
      throw new Error('Tutor information not available');
    }

    formData.append('topic_id', '1');
    formData.append('file', selectedFile);

    if (description) {
      formData.append('tags', description);
    }

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
        }
      },
    });

    const savedMaterial = response.data;

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
    setDescription('');
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast({
      title: "Content uploaded successfully!",
      description: "Your content has been uploaded to Supabase Storage",
    });

  } catch (error) {
    console.error('Upload error details:', {
      error,
      tutors: tutors[0],
      selectedModule,
      availableModules: tutors[0]?.modules?.map(m => m.module_name)
    });
    
    toast({
      title: "Upload failed",
      description: error instanceof Error ? error.message : "Failed to upload content",
      variant: "destructive",
    });
  } finally {
    setIsUploading(false);
  }
};

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/learning-materials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setUploads(uploads.filter(u => u.id !== id));
      toast({
        title: "Content deleted",
        description: "The content has been removed from both storage and database",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (content: UploadedContent) => {
    try {
      const response = await fetch(`http://localhost:8080/learning-materials/${content.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
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
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download file",
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
  /*
    // Load existing uploads on component mount
    const loadUploads = async () => {
      try {
        const response = await fetch('http://localhost:8080/learning-materials', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        if (response.ok) {
          const materials = await response.json();
          // Transform backend data to frontend format
          const transformedUploads = materials.map((material: any) => ({
            id: material.id,
            title: material.title,
            type: material.document_type?.toLowerCase() || 'document',
            module: `CS${material.module_id}`, // Map module_id back to module code
            uploadDate: new Date(material.created_at).toISOString().split('T')[0],
            file_url: material.file_url,
          }));
          setUploads(transformedUploads);
        }
      } catch (error) {
        console.error('Failed to load uploads:', error);
      }
    };
  
    // Call loadUploads on component mount
    useState(() => {
      loadUploads();
    });*/

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
              <Label htmlFor="description">Description / Tags</Label>
              <Textarea
                id="description"
                placeholder="Brief description or tags for the content"
                rows={3}
                className="resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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

            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={isUploading || !title || !selectedFile || !selectedFile}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Content
                </>
              )}
            </Button>
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