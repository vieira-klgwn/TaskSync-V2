
// CommentForm component for adding new comments to tasks
import React, { useState } from 'react';

interface CommentFormProps {
  onAddComment: (content: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onAddComment }) => {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!content.trim()) {
      setError('Comment content is required');
      return;
    }
    
    // Call the parent handler
    onAddComment(content.trim());
    
    // Reset form
    setContent('');
    setError(null);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment here..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue focus:border-teamsync-blue"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-teamsync-blue text-white rounded-md hover:bg-teamsync-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teamsync-blue"
        >
          Add Comment
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
