import React from 'react';
import { Comment } from '../types/comment';

interface CommentListProps {
  comments: Comment[];
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium text-gray-900">{comment.createdBy || 'Unknown'}</h4>
            <span className="text-xs text-gray-500">{formatDate(comment.createdDate)}</span>
          </div>
          <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentList;