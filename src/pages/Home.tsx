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
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Free Reverse Image Search Tool
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Find Similar Images, Discover Sources & Check Duplicates
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Upload any image to instantly search across Google, Bing, Yandex, and TinEye. 
            Our powerful reverse image search engine helps you find similar pictures, 
            discover image sources, detect duplicates, and verify authenticity. 
            Fast, accurate, and completely free.
          </p>
          
          {/* Primary CTA */}
          <Link
            to="/reverse-search"
            className="inline-flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-touch mr-4"
          >
            <Upload className="w-6 h-6" />
            Start Reverse Image Search
          </Link>
          
          <Link
            to="/analyze"
            className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-h-touch"
          >
            <Shield className="w-6 h-6" />
            Analyze Authenticity
          </Link>
        </div>

        {/* SEO Features Section */}
        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Multi-Engine Reverse Search
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Search across Google Images, Bing Visual Search, Yandex, and TinEye 
                simultaneously to find the most comprehensive results for your image.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Instant Image Upload
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Drag and drop or click to upload any image format. Our secure platform 
                processes your images instantly and generates public URLs for searching.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Privacy & Security
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your images are processed securely with temporary storage. We don't store, 
                analyze, or share your personal images beyond the reverse search functionality.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Search Tools */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            Reverse Image Search Engines
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-2xl mx-auto">
            Choose from the most popular reverse image search tools. Each engine uses different 
            algorithms to help you find image sources, duplicates, and similar pictures online.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {quickSearchProviders.map((provider) => (
              <Link
                key={provider.name}
                to="/reverse-search"
                className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 min-h-touch hover:scale-105"
              >
                <div className={`w-12 h-12 ${provider.color} rounded-lg flex items-center justify-center`}>
                  <provider.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {provider.name}
                </span>
                <span className="text-xs text-gray-500">
                  Click to start search
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            How Reverse Image Search Works
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What is Reverse Image Search?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Reverse image search is a powerful tool that allows you to upload an image 
                and find similar or identical images across the internet. Unlike traditional 
                text-based searches, this technology analyzes visual elements like colors, 
                shapes, patterns, and objects within your image.
              </p>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Benefits of Reverse Image Search
              </h4>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Find the original source of an image</li>
                <li>• Discover higher resolution versions</li>
                <li>• Detect unauthorized use of your photos</li>
                <li>• Verify image authenticity and detect fakes</li>
                <li>• Find similar images for research or inspiration</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Why Use Our Reverse Image Search Tool?
              </h4>
              <ul className="text-gray-600 dark:text-gray-300 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Multiple Search Engines:</strong> Search across Google, Bing, Yandex, and TinEye simultaneously</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>100% Free:</strong> No registration, watermarks, or hidden fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Privacy Protected:</strong> Secure upload with temporary storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Mobile Friendly:</strong> Works perfectly on all devices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Fast Results:</strong> Instant search across multiple platforms</span>
                </li>
              </ul>
            </div>
          </div>
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