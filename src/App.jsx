import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Contact from './pages/Contact';
import About from './pages/About';
import Login from './pages/Login';
import MyVehicles from './pages/MyVehicles';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-slate-900 text-white font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-vehicles" element={<MyVehicles />} />
        </Routes>

        <footer className="bg-slate-800 py-6 mt-12 border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
            <div className="flex justify-center gap-6 mb-4">
              <a href="/privacy" className="hover:text-cyan-400">Privacy Policy</a>
              <a href="/terms" className="hover:text-cyan-400">Terms & Conditions</a>
              <a href="/contact" className="hover:text-cyan-400">Contact</a>
            </div>
            <p>&copy; {new Date().getFullYear()} OBD.ai. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;