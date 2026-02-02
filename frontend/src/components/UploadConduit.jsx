// frontend/src/components/UploadConduit.jsx
import { useState } from 'react';
import axios from 'axios';

export default function UploadConduit() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setStatusMessage(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(
        '/api/upload/documents',  // proxy qua vite.config.js
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const { successful, failed, results } = response.data;
      setStatusMessage({
        type: 'success',
        text: `Upload thành công ${successful}/${files.length} file. ${failed ? `Lỗi ${failed} file` : ''}`
      });

      console.log("Kết quả chi tiết:", results);
      setFiles([]); // clear danh sách
    } catch (error) {
      console.error("Upload lỗi:", error);
      setStatusMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Lỗi khi upload, kiểm tra kết nối hoặc file'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 flex items-center justify-center p-6 font-mono text-gray-300 relative overflow-hidden">
      {/* ... toàn bộ JSX giao diện futuristic "DATA CONDUIT" bạn đã cung cấp trước đó ... */}

      {/* Chỉ thêm phần logic hiển thị status sau khi upload */}
      {statusMessage && (
        <div className={`mt-6 p-4 rounded-xl text-center font-bold uppercase tracking-wider ${
          statusMessage.type === 'success' 
            ? 'bg-green-900/60 border border-green-500 text-green-200' 
            : 'bg-red-900/60 border border-red-500 text-red-200'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Nút upload đã có trong JSX gốc, thêm onClick và disabled */}
      {/* Ví dụ: thay phần button cũ bằng */}
      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className={`w-full relative group overflow-hidden rounded-xl p-[2px] mt-6 ${
          uploading || files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 animate-gradient-x"></div>
        <div className="relative bg-gray-900 group-hover:bg-transparent transition-all duration-300 py-4 rounded-[10px] flex items-center justify-center">
          <span className="text-white font-black text-sm tracking-widest group-hover:scale-110 transition-transform">
            {uploading ? 'TRANSFERRING...' : 'ACTIVATE TRANSFER PROTOCOL'}
          </span>
        </div>
      </button>

      {/* ... phần còn lại của JSX bạn đã có ... */}
    </div>
  );
}