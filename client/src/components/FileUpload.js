import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiFile, FiCheck, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

// Configure axios for development
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '',
  timeout: 30000, // Longer timeout for file uploads
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #64748b;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #475569;
  }
`;

const Dropzone = styled.div`
  border: 2px dashed ${props => props.isDragActive ? '#3b82f6' : '#e2e8f0'};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: ${props => props.isDragActive ? '#eff6ff' : '#f8fafc'};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  color: #3b82f6;
  margin-bottom: 16px;
`;

const UploadText = styled.p`
  font-size: 16px;
  color: #475569;
  margin-bottom: 8px;
  font-weight: 500;
`;

const UploadSubtext = styled.p`
  font-size: 14px;
  color: #94a3b8;
`;

const FileInfo = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const FileName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const FileSize = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const UploadButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  margin-top: 16px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #3b82f6;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ef4444;
  font-size: 14px;
  margin-top: 12px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #10b981;
  font-size: 14px;
  margin-top: 12px;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
`;

const FileUpload = ({ onUpload, onClose }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    setSuccess('');

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMsg = 'Please upload a valid Excel or CSV file';
      
      if (rejection.errors && rejection.errors.length > 0) {
        const error = rejection.errors[0];
        if (error.code === 'file-too-large') {
          errorMsg = 'File size too large. Maximum size is 10MB.';
        } else if (error.code === 'file-invalid-type') {
          errorMsg = 'Invalid file type. Please upload .xlsx, .xls, or .csv files.';
        } else {
          errorMsg = error.message || errorMsg;
        }
      }
      
      setError(errorMsg);
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/csv': ['.csv']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await api.post('/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      setSuccess('File uploaded successfully!');
      setUploadProgress(100);
      
      // Call the parent callback with the processed data
      if (response.data.data) {
        onUpload(response.data.data);
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Upload Well Data</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX size={20} />
          </CloseButton>
        </ModalHeader>

        <Dropzone {...getRootProps()} isDragActive={isDragActive}>
          <input {...getInputProps()} />
          <UploadIcon>
            <FiUpload size={48} />
          </UploadIcon>
          <UploadText>
            {isDragActive
              ? 'Drop the file here'
              : 'Drag & drop an Excel or CSV file here, or click to select'
            }
          </UploadText>
          <UploadSubtext>
            Supports .xlsx, .xls, and .csv files up to 10MB
          </UploadSubtext>
        </Dropzone>

        {uploadedFile && (
          <FileInfo>
            <FileName>
              <FiFile size={16} />
              {uploadedFile.name}
            </FileName>
            <FileSize>
              Size: {formatFileSize(uploadedFile.size)}
            </FileSize>
          </FileInfo>
        )}

        {error && (
          <ErrorMessage>
            <FiAlertCircle size={16} />
            {error}
          </ErrorMessage>
        )}

        {success && (
          <SuccessMessage>
            <FiCheck size={16} />
            {success}
          </SuccessMessage>
        )}

        {isUploading && (
          <ProgressBar>
            <ProgressFill progress={uploadProgress} />
          </ProgressBar>
        )}

        <UploadButton
          onClick={handleUpload}
          disabled={!uploadedFile || isUploading}
        >
          {isUploading ? (
            <>
              <div className="spinner" />
              Uploading... {uploadProgress}%
            </>
          ) : (
            <>
              <FiUpload size={16} />
              Upload File
            </>
          )}
        </UploadButton>
      </ModalContent>
    </Modal>
  );
};

export default FileUpload; 