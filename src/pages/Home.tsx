// src/pages/Home.tsx
import { Link } from 'react-router-dom';
import { Upload, Search, Shield, Clock, ChevronRight } from 'lucide-react';

interface RecentCheck {
  id: string;
  imageUrl: string;
  confidence: number;
  timestamp: Date;
  status: 'authentic' | 'suspicious' | 'reviewing';
}

const mockRecentChecks: RecentCheck[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop',
    confidence: 85,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: 'authentic'
  },
  {
    id: '2', 
    imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=150&h=100&fit=crop',
    confidence: 42,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'suspicious'
  }
];

const quickSearchProviders = [
  { name: 'Google Lens', icon: Search, color: 'bg-blue-500' },
  { name: 'TinEye', icon: Search, color: 'bg-purple-500' },
  { name: 'Bing Visual', icon: Search, color: 'bg-orange-500' },
  { name: 'Yandex', icon: Search, color: 'bg-red-500' },
];

export default function Home() {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authentic': return 'text-primary-600 bg-primary-50';
      case 'suspicious': return 'text-red-600 bg-red-50';
      case 'reviewing': return 'text-amber-600 bg-amber-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Veritas
              </h1>
            </div>
            <nav className="hidden sm:flex gap-6">
              <Link 
                to="/analyze" 
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Analyze
              </Link>
              <Link 
                to="/reverse-search" 
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Reverse Search
              </Link>
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI-Powered Image Authenticity Analysis
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Verify image authenticity using advanced AI detection, forensic analysis, 
            and reverse image search technology.
          </p>
          
          {/* Primary CTA */}
          <Link
            to="/analyze"
            className="inline-flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-touch"
          >
            <Upload className="w-6 h-6" />
            Start Analysis
          </Link>
        </div>

        {/* Quick Search Tools */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Quick External Search Tools
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickSearchProviders.map((provider) => (
              <button
                key={provider.name}
                className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 min-h-touch"
                onClick={() => {
                  // This would open search in new tab with image URL
                  console.log(`Opening ${provider.name} search`);
                }}
              >
                <div className={`w-12 h-12 ${provider.color} rounded-lg flex items-center justify-center`}>
                  <provider.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {provider.name}
                </span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Upload an image first to use external search tools
          </p>
        </section>

        {/* Recent Checks */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Authenticity Checks
            </h3>
            <Link
              to="/history"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {mockRecentChecks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No recent authenticity checks
              </h4>
              <p className="text-gray-500 mb-6">
                Upload an image to get started with your first analysis
              </p>
              <Link
                to="/analyze"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Analyze Image
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockRecentChecks.map((check) => (
                <div
                  key={check.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex gap-4">
                    <img
                      src={check.imageUrl}
                      alt="Analyzed image"
                      className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                          {check.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        {formatTimeAgo(check.timestamp)}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {check.status === 'authentic' ? 'Likely authentic' : 
                         check.status === 'suspicious' ? 'Needs review' : 'Analyzing'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:hidden">
        <div className="grid grid-cols-4 gap-1">
          <Link
            to="/"
            className="flex flex-col items-center py-3 px-2 text-primary-600 bg-primary-50 dark:bg-primary-900/20"
          >
            <Shield className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            to="/analyze"
            className="flex flex-col items-center py-3 px-2 text-gray-500 hover:text-gray-700"
          >
            <Upload className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Analyze</span>
          </Link>
          <Link
            to="/reverse-search"
            className="flex flex-col items-center py-3 px-2 text-gray-500 hover:text-gray-700"
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Search</span>
          </Link>
          <Link
            to="/history"
            className="flex flex-col items-center py-3 px-2 text-gray-500 hover:text-gray-700"
          >
            <Clock className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">History</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}