export default function Unauthorised() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">403</h1>
        <p className="mt-2 text-lg text-gray-700">You do not have permission to view this page.</p>
        <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Return to Home
        </a>
      </div>
    </div>
  );
}
