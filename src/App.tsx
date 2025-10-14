import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { MainLayout } from './components/MainLayout';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-rose-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <MainLayout />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
