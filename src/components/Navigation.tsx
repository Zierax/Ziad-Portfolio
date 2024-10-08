import React, { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const navItems = ['About Me', 'Skills', 'Experience', 'Projects', 'Certifications', 'Consultations', 'Contact'];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.toLowerCase().replace(' ', '-')));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i] && sections[i]!.offsetTop !== undefined && scrollPosition >= sections[i]!.offsetTop) {
          setActiveSection(navItems[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-black py-4 px-6 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 flex items-center">
          <Shield className="w-8 h-8 mr-2 text-cyan-400" />
          <span>Zierax</span>
        </div>
        <div className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className={`text-sm uppercase tracking-wider transition-all duration-300 ${
                activeSection === item
                  ? 'text-cyan-400 font-bold'
                  : 'text-gray-300 hover:text-cyan-400'
              }`}
            >
              {item}
            </a>
          ))}
        </div>
        <button
          className="md:hidden text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-gray-800 rounded-lg shadow-xl">
          <ul className="flex flex-col space-y-2 p-4">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className={`block py-2 px-4 rounded-md transition-all duration-300 ${
                    activeSection === item
                      ? 'bg-cyan-400 text-black font-bold'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-cyan-400'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navigation;