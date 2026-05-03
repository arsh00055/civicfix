'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import apiClient from '@/lib/services/api/client';
import { toast } from 'sonner';
import type { Issue } from '@/types/issue.types';

type EscalateAction = 'warn_volunteer' | 'reassign' | 'bump_priority' | 'close';

interface EscalateModalProps {
  isOpen:      boolean;
  onClose:     () => void;
  onSuccess:   () => void;
  issue:       Issue | null;
}

const ACTION_OPTIONS: {
  value:       EscalateAction;
  label:       string;
  description: string;
  color:       string;
  requiresAssignee?: boolean;
}[] = [
  {
    value:       'warn_volunteer',
    label:       '⚠️ Warn Volunteer',
    description: 'Send a warning notification and extend their deadline by 2 days.',
    color:       'border-yellow-300 bg-yellow-50 text-yellow-900',
    requiresAssignee: true,
  },
  {
    value:       'reassign',
    label:       '🔄 Reassign to Pool',
    description: 'Remove the current volunteer and put the task back for anyone to claim.',
    color:       'border-orange-300 bg-orange-50 text-orange-900',
    requiresAssignee: true,
  },
  {
    value:       'bump_priority',
    label:       '🔺 Bump Priority',
    description: 'Increase the priority level so it becomes more visible to volunteers.',
    color:       'border-blue-300 bg-blue-50 text-blue-900',
  },
  {
    value:       'close',
    label:       '🔒 Close Issue',
    description: 'Mark the issue as closed (e.g. resolved outside the system, or invalid).',
    color:       'border-gray-300 bg-gray-50 text-gray-900',
  },
];

export const EscalateModal: React.FC<EscalateModalProps> = ({
  isOpen, onClose, onSuccess, issue,
}) => {
  const [selectedAction, setSelectedAction] = useState<EscalateAction | null>(null);
  const [reason, setReason]                 = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);

  const handleSubmit = async () => {
    if (!issue || !selectedAction) return;

    setIsSubmitting(true);
    try {
      const res = await apiClient.post(`/admin/issues/${issue.id}/escalate`, {
        action: selectedAction,
        reason: reason.trim() || undefined,
      });

      toast.success(res.data.message || 'Action completed successfully');
      setSelectedAction(null);
      setReason('');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to apply action. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setSelectedAction(null);
    setReason('');
    onClose();
  };

  const daysOverdue = issue?.assignedAt
    ? Math.floor((Date.now() - new Date(issue.assignedAt).getTime()) / 86_400_000) - 7
    : null;

  const daysSinceReported = issue?.createdAt
    ? Math.floor((Date.now() - new Date(issue.createdAt).getTime()) / 86_400_000)
    : null;

  return (
    <AnimatePresence>
      {isOpen && issue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                  <h2 className="text-lg font-bold">Take Action</h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-1 rounded-full cursor-pointer hover:bg-white/20 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-200">
                <p className="font-semibold text-gray-900 truncate">{issue.title}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                  <span className="capitalize">{issue.status.replace('_', ' ')}</span>
                  <span>•</span>
                  <span className="capitalize">{issue.priority} priority</span>
                  {daysOverdue !== null && daysOverdue > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-red-600 font-medium">{daysOverdue}d overdue</span>
                    </>
                  )}
                  {daysSinceReported !== null && (
                    <>
                      <span>•</span>
                      <span>{daysSinceReported}d old</span>
                    </>
                  )}
                  {issue.assignedTo && (
                    <>
                      <span>•</span>
                      <span>Assigned to {issue.assignedTo.name}</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-3">Choose an action:</p>
              <div className="space-y-2 mb-5">
                {ACTION_OPTIONS.map(opt => {
                  const disabled = opt.requiresAssignee && !issue.assignedTo;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => !disabled && setSelectedAction(opt.value)}
                      disabled={disabled}
                      className={`
                        w-full text-left px-4 py-3 rounded-xl border-2 transition-all
                        ${selectedAction === opt.value ? opt.color + ' ring-2 ring-offset-1 ring-orange-400' : 'border-gray-200 hover:border-gray-300 bg-white'}
                        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <p className="font-medium text-black text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                      {disabled && (
                        <p className="text-xs text-gray-400 mt-1 italic">Requires an assigned volunteer</p>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reason / Note <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Explain why you're taking this action…"
                  rows={3}
                  className="w-full text-black border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAction || isSubmitting}
                  className="px-5 py-2 text-sm cursor-pointer font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Applying…
                    </>
                  ) : 'Apply Action'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};