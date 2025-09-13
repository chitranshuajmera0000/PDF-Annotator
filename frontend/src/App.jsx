import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Signup from './components/Signup'
import MyLibrary from './components/MyLibrary'
import PdfViewer from './components/PdfViewer'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login></Login>} />
        <Route path='/signup' element={<Signup></Signup>} />
        <Route path='/library' element={<ProtectedRoute><MyLibrary></MyLibrary></ProtectedRoute>} />
        <Route path='/' element={<ProtectedRoute><MyLibrary></MyLibrary></ProtectedRoute>} />
        <Route path='/viewer/:uuid' element={<ProtectedRoute><PdfViewer></PdfViewer></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
