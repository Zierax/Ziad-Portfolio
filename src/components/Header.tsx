import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Calendar, Link, Zap, ChevronDown, Terminal, Shield, Twitter } from 'lucide-react';

const Header: React.FC = () => {
  const [glowColor, setGlowColor] = useState('cyber-green');
  const [paintedText, setPaintedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const fullName = 'Ziad Salah';

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowColor(prevColor => 
        prevColor === 'cyber-green' ? 'cyber-blue' : 
        prevColor === 'cyber-blue' ? 'cyber-purple' : 'cyber-green'
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let index = 0;
    const paintInterval = setInterval(() => {
      if (index <= fullName.length) {
        setPaintedText(fullName.slice(0, index));
        index++;
      } else {
        clearInterval(paintInterval);
        setTimeout(() => {
          setShowCursor(false);
        }, 1000); // Wait 1 second after finishing typing before hiding the cursor
      }
    }, 200); // Adjust this value to control the painting speed

    return () => clearInterval(paintInterval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const opacity = Math.max(0, 1 - (scrollPosition / (windowHeight * 0.5)));
      setScrollOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const socialLinks = [
    { href: "https://linktr.ee/Zierax", Icon: Link, label: "Linktree", color: "cyber-green" },
    { href: "https://github.com/Zierax", Icon: Github, label: "GitHub", color: "cyber-blue" },
    { href: "https://linkedin.com/in/z14d", Icon: Linkedin, label: "LinkedIn", color: "cyber-purple" },
    { href: "https://calendly.com/Zierax", Icon: Calendar, label: "Calendly", color: "cyber-orange" },
    { href: "https://x.com/Zierax_x", Icon: Twitter, label: "Twitter", color: "cyber-cyan" },
  ];

  return (
    <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-matrix-pattern opacity-10 animate-matrix"></div>
      <div className="container mx-auto text-center relative z-10">
        <h1 
          className={`text-9xl font-extrabold mb-8 tracking-tighter ${glowColor}-glow transition-all duration-1000 ease-in-out animate-pulse`}
          style={{textShadow: `0 0 30px var(--${glowColor}), 0 0 60px var(--${glowColor}), 0 0 90px var(--${glowColor})`}}
        >
          {paintedText}
          {showCursor && <span className="animate-blink">|</span>}
        </h1>
        <p className="text-4xl mb-6 font-light tracking-wide text-gray-300 flex justify-center items-center space-x-4">
          <span className="inline-block transition-colors duration-300 hover:text-cyber-green flex items-center">
            <Terminal className="w-8 h-8 mr-2" />
            Web3 Hacker
          </span>
          <span className="text-cyber-green">|</span>
          <span className="inline-block transition-colors duration-300 hover:text-cyber-blue flex items-center">
            <Shield className="w-8 h-8 mr-2" />
            Offensive Security Expert
          </span>
        </p>
        <p className="text-2xl mb-12 font-medium text-cyber-purple animate-pulse flex justify-center items-center">
          Ready to <Zap className="w-6 h-6 mx-2 text-cyber-green" /> <span className="font-bold text-cyber-green">Hack The Planet</span>
        </p>
        <div className="flex justify-center space-x-8 mb-16">
          {socialLinks.map(({ href, Icon, label, color }, index) => (
            <a 
              key={index}
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`group flex flex-col items-center justify-center w-24 h-24 bg-gray-800 rounded-full hover:bg-${color} transition-all duration-300 transform hover:scale-105`}
            >
              <Icon className={`w-10 h-10 text-${color} group-hover:text-black transition-colors duration-300`} />
              <span className={`mt-2 text-xs font-semibold text-${color} group-hover:text-black transition-colors duration-300`}>{label}</span>
            </a>
          ))}
        </div>
        <div className="mt-16 animate-bounce" style={{ opacity: scrollOpacity, transition: 'opacity 0.3s ease-out' }}>
          <ChevronDown className="w-12 h-12 text-cyber-green mx-auto" />
        </div>
      </div>
    </header>
  );
};

export default Header;