import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface EditRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: Record<string, any> | null;
  tableName: string;
  onSave: (updatedRecord: Record<string, any>) => void;
}

// Define immutable fields that shouldn't be edited
const immutableFields = ['id', 'size', 'downloads', 'views', 'replies', 'sessions', 'rating'];

export function EditRecordDialog({
  open,
  onOpenChange,
  record,
  tableName,
  onSave,
}: EditRecordDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});

  React.useEffect(() => {
    if (record) {
      setFormData({ ...record });
    }
  }, [record]);

  const handleSave = () => {
    onSave(formData);
    toast({
      title: 'Record updated',
      description: `Successfully updated ${tableName} record.`,
    });
    onOpenChange(false);
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (key: string, value: any) => {
    const isImmutable = immutableFields.includes(key);
    
    if (isImmutable) {
      return (
        <div key={key} className="space-y-2">
          <Label className="text-muted-foreground">{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
          <Input value={value} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">This field is read-only</p>
        </div>
      );
    }

    // Handle status/role fields with select
    if (key === 'status') {
      return (
        <div key={key} className="space-y-2">
          <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
          <Select value={formData[key]} onValueChange={(val) => handleFieldChange(key, val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (key === 'role') {
      return (
        <div key={key} className="space-y-2">
          <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
          <Select value={formData[key]} onValueChange={(val) => handleFieldChange(key, val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Tutor">Tutor</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (key === 'type') {
      return (
        <div key={key} className="space-y-2">
          <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
          <Select value={formData[key]} onValueChange={(val) => handleFieldChange(key, val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Spam">Spam</SelectItem>
              <SelectItem value="Harassment">Harassment</SelectItem>
              <SelectItem value="Inappropriate Content">Inappropriate Content</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Regular text input for other fields
    return (
      <div key={key} className="space-y-2">
        <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
        <Input
          value={formData[key] || ''}
          onChange={(e) => handleFieldChange(key, e.target.value)}
        />
      </div>
    );
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {tableName.slice(0, -1)} Record</DialogTitle>
          <DialogDescription>
            Update the fields below. Read-only fields cannot be modified.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {Object.entries(record).map(([key, value]) => renderField(key, value))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}