// frontend/src/components/CourseList.jsx (placeholder)
export default function CourseList() {
  // Sau này fetch từ API
  const mockCourses = [
    { title: "Kinh tế học", subject: "Kinh tế", author: "Alex" },
    { title: "Lập trình Python", subject: "Công nghệ", author: "Huy" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockCourses.map((course, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <h3 className="text-lg font-medium text-gray-900">
            {course.title} ({course.subject})
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Tác giả: {course.author}
          </p>
        </div>
      ))}
    </div>
  );
}