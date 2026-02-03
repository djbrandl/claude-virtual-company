import { useState, useEffect } from 'react';
import { FolderOpen, Check, RefreshCw } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';

interface Project {
  path: string;
  name: string;
  lastModified: number;
}

export function ProjectSelector() {
  const { projectPath, setProjectPath } = useDashboardStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customPath, setCustomPath] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchProject = async (newPath: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath: newPath }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Switch project error:', error);
        const errorMsg = error.error || 'Failed to switch project';
        const details = error.path ? `\n\nPath: ${error.path}` : '';
        const companyPath = error.companyPath ? `\nCompany path: ${error.companyPath}` : '';
        alert(errorMsg + details + companyPath);
        return;
      }

      const data = await res.json();
      setProjectPath(data.projectPath);
      setIsOpen(false);
      setCustomPath('');
    } catch (err) {
      console.error('Failed to switch project:', err);
      alert('Failed to switch project');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPath = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPath.trim()) {
      switchProject(customPath.trim());
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
        title="Switch Project"
      >
        <FolderOpen className="w-4 h-4" />
        <span className="hidden md:inline">
          {projectPath ? projectPath.split(/[\\/]/).pop() : 'Select Project'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Select Project</h3>
              <button
                onClick={() => {
                  fetchProjects();
                }}
                className="p-1 hover:bg-gray-700 rounded"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {/* Recent Projects */}
              {projects.length > 0 && (
                <div className="p-2">
                  <div className="text-xs text-gray-400 px-2 py-1">Recent Projects</div>
                  {projects.map((project) => (
                    <button
                      key={project.path}
                      onClick={() => switchProject(project.path)}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {project.name}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {project.path}
                        </div>
                      </div>
                      {projectPath === project.path && (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom Path */}
              <form onSubmit={handleCustomPath} className="p-3 border-t border-gray-700">
                <label className="text-xs text-gray-400 block mb-2">
                  Custom Path
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="/path/to/project"
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !customPath.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
                  >
                    Load
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
