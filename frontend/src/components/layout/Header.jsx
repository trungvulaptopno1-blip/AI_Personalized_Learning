// frontend/src/components/layout/Header.jsx
export default function Header({ userName }) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            AI Personalized Learning
          </h1>
        </div>

        {userName && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Xin chào, <strong>{userName}</strong></span>
            <button className="text-sm text-gray-500 hover:text-gray-900">
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}