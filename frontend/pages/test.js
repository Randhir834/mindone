export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">Test Page</h1>
        <p className="text-xl text-blue-600">If you can see this, React is working!</p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-lg">
          <p className="text-gray-800">Current time: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
