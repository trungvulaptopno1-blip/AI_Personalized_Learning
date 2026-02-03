// frontend/src/components/NameOverlay.jsx
import { useState } from 'react';

export default function NameOverlay({ onSetName }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }
    onSetName(name.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Chào mừng bạn đến với AI Learning
        </h2>
        <p className="text-gray-600 mb-8">
          Nhập tên để bắt đầu trải nghiệm cá nhân hóa
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Tên của bạn..."
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />

          {error && (
            <p className="mt-2 text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="mt-6 w-full py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium"
          >
            Bắt đầu
          </button>
        </form>
      </div>
    </div>
  );
}