import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface DocumentPreviewProps {
  documentUrl: string;
  documentName: string;
  fileType?: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  documentUrl, 
  documentName, 
  fileType 
}) => {
  const [showModal, setShowModal] = useState(false);

  const getFileCategory = (url: string, type?: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (type?.includes('pdf') || extension === 'pdf') return 'pdf';
    if (type?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) return 'image';
    if (type?.includes('text') || extension === 'txt') return 'text';
    if (type?.includes('word') || ['doc', 'docx'].includes(extension || '')) return 'word';
    if (type?.includes('excel') || ['xls', 'xlsx'].includes(extension || '')) return 'excel';
    if (type?.includes('powerpoint') || ['ppt', 'pptx'].includes(extension || '')) return 'powerpoint';
    return 'other';
  };

  const canPreviewInBrowser = (category: string): boolean => {
    return ['pdf', 'image', 'text'].includes(category);
  };

  const getOfficeOnlineUrl = (url: string): string => {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  };

  const fileCategory = getFileCategory(documentUrl, fileType);

  const handlePreview = () => {
    setShowModal(true);
  };

  return (
    <div className="document-preview">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePreview}
        className="flex items-center gap-1"
      >
        <Eye className="h-3 w-3" />
        Preview
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg w-11/12 max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Preview: {documentName}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              {canPreviewInBrowser(fileCategory) ? (
                <iframe
                  src={documentUrl}
                  title={`Preview: ${documentName}`}
                  className="w-full h-96 border rounded"
                />
              ) : ['word', 'excel', 'powerpoint'].includes(fileCategory) ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Previewing {fileCategory} document using Microsoft Office Online
                  </p>
                  <iframe
                    src={getOfficeOnlineUrl(documentUrl)}
                    title={`Office Preview: ${documentName}`}
                    className="w-full h-96 border rounded"
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>
                      For best experience,{' '}
                      <a 
                        href={documentUrl} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        download the file
                      </a>
                      {' '}and open in native application.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">This file type cannot be previewed in the browser.</p>
                  <Button asChild>
                    <a 
                      href={documentUrl} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Download File
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button asChild variant="outline">
                <a 
                  href={documentUrl} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </Button>
              <Button onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;