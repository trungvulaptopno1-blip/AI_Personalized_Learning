// frontend/src/App.jsx
import { useState } from 'react';
import NameOverlay from './components/NameOverlay';
import CourseList from './components/CourseList';
import Header from './components/layout/Header';

export default function App() {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [showOverlay, setShowOverlay] = useState(!userName);

  // Lưu tên vào localStorage khi user nhập xong
  const handleSetName = (name) => {
    localStorage.setItem('userName', name);
    setUserName(name);
    setShowOverlay(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header chung */}
      <Header userName={userName} />

      {/* Overlay nhập tên lần đầu */}
      {showOverlay && (
        <NameOverlay onSetName={handleSetName} />
      )}

      {/* Màn hình chính */}
      {!showOverlay && (
        <main className="container mx-auto px-6 py-10">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">
            Chào {userName}, đây là các tài liệu sẵn có
          </h2>

          {/* Danh sách tài liệu */}
          <CourseList />

          {/* Các nút chức năng (upload, đánh giá, settings) */}
          <div className="mt-12 flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition">
              Upload tài liệu mới
            </button>
            <button className="px-8 py-4 bg-white text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
              Xem đánh giá
            </button>
            <button className="px-8 py-4 bg-white text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
              Điều chỉnh cài đặt
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
frontend/src/App.jsx
