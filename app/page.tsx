export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-center mt-10 text-black">
        Welcome to Gigflow Authentication
      </h1>
      <p className="text-center mt-4 text-black">
        Please login or register to access your account.
      </p>
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        <a href="/login">Login</a>
      </button>
      <button className="mt-6 ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        <a href="/register">Register</a>
      </button>

    </div>
  );
}