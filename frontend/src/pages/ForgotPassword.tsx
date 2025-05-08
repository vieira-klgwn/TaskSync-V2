import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.text();
      if (!response.ok) {
        throw new Error(data || 'Failed to request password reset');
      }
      setSuccess('Password reset instructions have been sent to your email.');
      toast({
        title: 'Success',
        description: 'Check your email for password reset instructions.',
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teamsync-blue"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-teamsync-blue text-white rounded-md hover:bg-teamsync-blue-dark focus:outline-none focus:ring-2 focus:ring-teamsync-blue"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Request Password Reset'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Remember your password?{' '}
          <Link to="/login" className="text-teamsync-blue hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;