import React from 'react';
import { 
  Upload, 
  Download, 
  FolderOpen, 
  Shield,
  TrendingUp,
  Clock,
  HardDrive
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Files',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: FolderOpen,
    },
    {
      name: 'Storage Used',
      value: '2.4 GB',
      change: '+8%',
      changeType: 'positive',
      icon: HardDrive,
    },
    {
      name: 'Downloads',
      value: '5,678',
      change: '+23%',
      changeType: 'positive',
      icon: Download,
    },
    {
      name: 'Uploads Today',
      value: '45',
      change: '+5%',
      changeType: 'positive',
      icon: Upload,
    },
  ];

  const recentFiles = [
    {
      id: '1',
      name: 'project-document.pdf',
      size: '2.4 MB',
      uploadedAt: '2 hours ago',
      status: 'uploaded',
    },
    {
      id: '2',
      name: 'presentation.pptx',
      size: '15.2 MB',
      uploadedAt: '4 hours ago',
      status: 'processing',
    },
    {
      id: '3',
      name: 'data-backup.zip',
      size: '156.8 MB',
      uploadedAt: '1 day ago',
      status: 'uploaded',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to NebularVault - Your decentralized storage solution</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Files */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Files</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{file.uploadedAt}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    file.status === 'uploaded' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {file.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Overview */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Used Storage</span>
              <span className="text-sm font-medium text-gray-900">2.4 GB / 10 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '24%' }}></div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                <span className="text-gray-600">Files</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Available</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Security Status</p>
                <p className="text-xs text-green-600">All files encrypted and verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
            <Upload className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Upload Files</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Download className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Download All</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
