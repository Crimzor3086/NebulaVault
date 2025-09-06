import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Key, 
  Database,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'storage', name: 'Storage', icon: Database },
    { id: 'api', name: 'API Keys', icon: Key },
  ];

  const ProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">First Name</label>
            <input type="text" className="input" defaultValue="John" />
          </div>
          <div>
            <label className="label">Last Name</label>
            <input type="text" className="input" defaultValue="Doe" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" defaultValue="john.doe@example.com" />
          </div>
          <div>
            <label className="label">Username</label>
            <input type="text" className="input" defaultValue="johndoe" />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Enable 2FA</p>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <button className="btn-secondary btn-sm">Enable</button>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          Update Security
        </button>
      </div>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Upload Complete</p>
              <p className="text-sm text-gray-600">Notify when file uploads are complete</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Storage Alerts</p>
              <p className="text-sm text-gray-600">Alert when storage quota is reached</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Security Alerts</p>
              <p className="text-sm text-gray-600">Notify about security-related events</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  const StorageSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Configuration</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Storage Usage</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Used: 2.4 GB</span>
              <span className="text-sm text-gray-600">Total: 10 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '24%' }}></div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Auto-cleanup</h4>
            <p className="text-sm text-gray-600 mb-3">Automatically remove temporary files after upload</p>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Chunk Size</h4>
            <p className="text-sm text-gray-600 mb-3">Size of file chunks for processing</p>
            <select className="input">
              <option value="1024">1 KB (Default)</option>
              <option value="4096">4 KB</option>
              <option value="8192">8 KB</option>
              <option value="16384">16 KB</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const ApiSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="label">0G Storage API Key</label>
            <div className="relative">
              <input 
                type={showApiKey ? "text" : "password"} 
                className="input pr-10" 
                defaultValue="sk-1234567890abcdef..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Your API key for 0G Storage network access</p>
          </div>
          
          <div>
            <label className="label">API Endpoint</label>
            <input 
              type="text" 
              className="input" 
              defaultValue="https://api.0g.ai"
            />
            <p className="text-sm text-gray-600 mt-1">0G Storage API endpoint URL</p>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Keep your API keys secure and never share them publicly. Regenerate keys if compromised.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          Save API Settings
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'storage':
        return <StorageSettings />;
      case 'api':
        return <ApiSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
