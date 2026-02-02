// frontend/src/App.jsx
import { useState } from 'react';

export default function App() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setMessage({ type: '', text: '' });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('/api/upload/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload thất bại');

      const data = await response.json();
      setMessage({
        type: 'success',
        text: `Đã upload thành công ${data.successful}/${files.length} tệp`
      });
      setFiles([]);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Có lỗi xảy ra khi upload'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-10 py-8 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <h1 className="text-3xl font-semibold tracking-tight">
            Upload Tài Liệu Học Tập
          </h1>
          <p className="mt-2 text-gray-300 text-sm">
            Thêm kiến thức mới cho cộng đồng – cá nhân hóa hành trình học tập của bạn
          </p>
        </div>

        {/* Dropzone */}
        <label className="block px-10 py-16 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
          <input
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Kéo thả tệp hoặc <span className="text-blue-600 hover:underline">chọn từ máy tính</span>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Hỗ trợ PDF, DOCX, PPTX – tối đa 50MB mỗi tệp
              </p>
            </div>
          </div>
        </label>

        {/* Danh sách file */}
        {files.length > 0 && (
          <div className="px-10 py-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Tệp đã chọn ({files.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                      {file.name.split('.').pop().toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nút Upload */}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`mt-8 w-full py-4 px-6 bg-gray-900 text-white font-medium rounded-lg 
                hover:bg-gray-800 transition-colors duration-200 shadow-md
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
            >
              {uploading ? 'Đang tải lên...' : 'Tải lên ngay'}
            </button>
          </div>
        )}

        {/* Thông báo */}
        {message.text && (
          <div className="px-10 py-4 border-t border-gray-100">
            <div
              className={`p-4 rounded-lg text-center text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}