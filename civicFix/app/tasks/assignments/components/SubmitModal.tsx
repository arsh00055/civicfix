import { useAuth } from "@/features/auth/hooks/useAuth";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface Assignment {
    id: string;
    taskId: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: 'assigned' | 'in_progress' | 'pending_review' | 'resolved' | 'closed';
    location: string;
    latitude: number;
    longitude: number;
    images: string[];
    reportedBy: string;
    reportedAt: string;
    claimedAt: string;
    updatedAt: string;
    progress: number;
    commentsCount: number;
    upvotes: number;
    tags: string[];
    estimatedResolutionTime?: string;
    resolutionNotes?: string;
    resolutionProof?: string[];
    submittedForReview?: boolean;
}

interface SubmitProofModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (proofData: { notes: string; images: string[] }) => Promise<void>;
    assignment: Assignment | null;
    isSubmitting: boolean;
  }
export const SubmitProofModal: React.FC<SubmitProofModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    assignment,
    isSubmitting
  }) => {
    const [notes, setNotes] = useState('');
    const { user } = useAuth();
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
    
      if (images.length + files.length > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }
    
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          return false;
        }
        return true;
      });
    
      if (validFiles.length === 0) return;
    
      setUploading(true);
    
      try {
        const uploadedUrls: string[] = [];
        
        for (const file of validFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('userId', user?.id || '');
          formData.append('issueId', assignment?.taskId || '');
    
          const response = await fetch('/api/upload/resolvedIssue', {
            method: 'POST',
            body: formData,
          });
    
          // Check if response is OK
          if (!response.ok) {
            const text = await response.text();
            console.error('Upload failed:', text);
            
            // Try to parse as JSON, if fails, show error
            try {
              const errorData = JSON.parse(text);
              toast.error(errorData.message || 'Upload failed');
            } catch {
              toast.error(`Upload failed: ${response.status} ${response.statusText}`);
            }
          }
          
          const data = await response.json();
          
          // Get the image URL from response
          const imageUrl = data.url || data.data?.url;
          
          if (!imageUrl) {
            toast.error('No image URL in response');
          }
          
          uploadedUrls.push(imageUrl);
        }
    
        setImages(prev => [...prev, ...uploadedUrls]);
        toast.success(`${validFiles.length} image(s) uploaded`);
      } catch (error: any) {
        console.error('Error uploading images:', error);
        toast.error(error.message || 'Failed to upload images');
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
  
    const removeImage = (index: number) => {
      setImages(prev => prev.filter((_, i) => i !== index));
    };
  
    const handleSubmit = async () => {
      if (!notes.trim()) {
        toast.error('Please add resolution notes');
        return;
      }
      if (images.length === 0) {
        toast.error('Please upload proof of completion');
        return;
      }
      await onSubmit({ notes, images });
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Submit Completion Proof</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
  
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Notes *
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe how you resolved this issue..."
                disabled={isSubmitting}
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proof Images * (up to 5)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= 5}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <PhotoIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </span>
                <span className="text-xs text-gray-400">({images.length}/5)</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
  
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Proof ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
  
          <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !notes.trim() || images.length === 0}
              className="px-4 py-2 bg-green-600 cursor-pointer text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };