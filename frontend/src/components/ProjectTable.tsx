import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types/project';
import ProgressBar from './ProgressBar';

interface ProjectTableProps {
  projects: Project[];
}

const ProjectTable: React.FC<ProjectTableProps> = ({ projects }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                No projects found
              </td>
            </tr>
          ) : (
            projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link 
                    to={`/projects/${project.id}/tasks`}
                    className="text-teamsync-blue hover:text-teamsync-blue-dark hover:underline"
                  >
                    {project.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-grow mr-2">
                      <ProgressBar percentage={project.progress} />
                    </div>
                    <div className="text-sm text-gray-500">
                      {project.progress}%
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;