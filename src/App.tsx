import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Navigation from './components/Navigation'
import AboutMe from './components/AboutMe'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Certifications from './components/Certifications'
import Consultations from './components/Consultations'
import Contact from './components/Contact'
import SecretPage from './components/SecretPage'
import ToolsPage from './components/ToolsPage'


function HomePage() {
  return (
    <>
      <Header />
      <Navigation />
      <AboutMe />
      <Skills />
      <Experience />
      <Projects />
      <ToolsPage />
      <Certifications />
      <Consultations />
      <Contact />
    </>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/secret" element={<SecretPage />} />
          <Route path="/tools" element={<ToolsPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
