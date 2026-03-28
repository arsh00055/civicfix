import { motion } from "framer-motion";
import { XCircleIcon } from "lucide-react";
import { useState } from "react";

interface Issue {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    location: string;
    reporter?: { name: string; avatar?: string };
    assignedTo?: { name: string };
    resolutionNotes?: string;
    resolutionProof?: string[];
    submittedForReviewAt?: string;
    createdAt: string;
    updatedAt: string;
    upvotes: number;
    commentsCount: number;
  }

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (approved: boolean, reviewNotes: string, rejectionReason?: string) => Promise<void>;
    issue: Issue | null;
    isSubmitting: boolean;
  }
  
export const ReviewModal: React.FC<ReviewModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    issue,
    isSubmitting
  }) => {
    const [action, setAction] = useState<'approve' | 'reject'>('approve');
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
    if (!isOpen || !issue) return null;
  
    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Review Resolution</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircleIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
  
            <div className="p-6 space-y-6">
              {/* Issue Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{issue.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    {issue.category}
                  </span>
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                    {issue.priority}
                  </span>
                </div>
              </div>
  
              {/* Volunteer Notes */}
              {issue.resolutionNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volunteer's Resolution Notes
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    {issue.resolutionNotes}
                  </div>
                </div>
              )}
  
              {/* Proof Images */}
              {issue.resolutionProof && issue.resolutionProof.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proof Images
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {issue.resolutionProof.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(image)}
                        className="relative group"
                      >
                        <img
                          src={image}
                          alt={`Proof ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
  
              {/* Action Selection */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="approve"
                    checked={action === 'approve'}
                    onChange={(e) => setAction(e.target.value as 'approve')}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Approve</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="reject"
                    checked={action === 'reject'}
                    onChange={(e) => setAction(e.target.value as 'reject')}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Reject</span>
                </label>
              </div>
  
              {/* Review Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add your review notes..."
                />
              </div>
  
              {/* Rejection Reason */}
              {action === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Why is this being rejected? What needs to be improved?"
                  />
                </div>
              )}
            </div>
  
            <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 cursor-pointer text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => onSubmit(action === 'approve', reviewNotes, rejectionReason)}
                disabled={isSubmitting || (action === 'reject' && !rejectionReason.trim())}
                className={`px-4 py-2 cursor-pointer rounded-lg transition-colors disabled:opacity-50 ${
                  action === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : action === 'approve' ? 'Approve & Resolve' : 'Reject & Send Back'}
              </button>
            </div>
          </motion.div>
        </div>
  
        {/* Image Preview Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </>
    );
  };