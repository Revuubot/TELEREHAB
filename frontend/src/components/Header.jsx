import { Link } from 'react-router-dom';
import { auth } from '../auth';

export default function Header() {
  const handleLogout = () => {
    auth.logout();
    window.location.href = '/login';
  };

  const isAuthenticated = auth.isAuthenticated();
  const user = auth.getUser();

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-bold text-xl text-blue-600">
            TeleRehab
          </Link>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600">
                  Welcome, {user?.first_name}
                </span>
                
                {auth.isPatientRole() && (
                  <Link
                    to="/upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Upload Session
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}