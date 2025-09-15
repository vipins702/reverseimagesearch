import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Editor from './pages/Editor'
import ReverseSearch from './pages/ReverseSearch'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Editor />} />
        <Route path="/reverse-search" element={<ReverseSearch />} />
        <Route path="/editor" element={<Navigate to="/analyze" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App