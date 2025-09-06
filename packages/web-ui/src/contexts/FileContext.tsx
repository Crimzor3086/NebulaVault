import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  hash: string;
  merkleRoot: string;
  chunks: string[];
  uploadedAt: string;
  userId: string;
  isPublic: boolean;
  downloadCount: number;
}

interface FileContextType {
  files: FileMetadata[];
  setFiles: (files: FileMetadata[]) => void;
  addFile: (file: FileMetadata) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<FileMetadata>) => void;
  getFile: (fileId: string) => FileMetadata | undefined;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const useFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

interface FileProviderProps {
  children: ReactNode;
}

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);

  const addFile = (file: FileMetadata) => {
    setFiles(prev => [...prev, file]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const updateFile = (fileId: string, updates: Partial<FileMetadata>) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      )
    );
  };

  const getFile = (fileId: string) => {
    return files.find(file => file.id === fileId);
  };

  const value: FileContextType = {
    files,
    setFiles,
    addFile,
    removeFile,
    updateFile,
    getFile,
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
};
