
// Landing page for the TeamSync PMS application
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Welcome to TeamSync PMS
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Streamline your team projects with our intuitive project management system
          </p>
          <div className="mt-8">
            <Link
              to="/teams"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teamsync-blue hover:bg-teamsync-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teamsync-blue"
            >
              View Your Teams
            </Link>
          </div>
        </div>
        
        <div className="mt-16 bg-white rounded-lg shadow px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teamsync-blue text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900">Team Management</h3>
                <p className="mt-2 text-base text-gray-500">
                  Organize your teams and manage team members efficiently.
                </p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teamsync-blue text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900">Project Tracking</h3>
                <p className="mt-2 text-base text-gray-500">
                  Track project progress with visual indicators and detailed reports.
                </p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teamsync-blue text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900">Task Management</h3>
                <p className="mt-2 text-base text-gray-500">
                  Create, assign, and track tasks with comments and status updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
