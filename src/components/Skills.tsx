import React, { useState } from 'react';
import { Shield, Code, Briefcase, FileCode, Search, Globe, Zap } from 'lucide-react';

const SkillCategory: React.FC<{ title: string; skills: string[]; experience: string; icon: React.ReactNode }> = ({ title, skills, experience, icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl border-2 ${isHovered ? 'border-cyan-400 shadow-2xl shadow-cyan-500/40' : 'border-cyan-700'} transition-all duration-500 transform ${isHovered ? 'scale-105' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center mb-6">
        <div className={`text-cyan-400 mr-4 transition-all duration-500 ${isHovered ? 'scale-125' : ''}`}>{icon}</div>
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{title}</h3>
      </div>
      <ul className="space-y-3 mb-6">
        {skills.map((skill, index) => (
          <li key={index} className="flex items-center group">
            <Zap className="w-4 h-4 text-cyan-500 mr-3 transition-all duration-300 group-hover:text-cyan-300 group-hover:rotate-12" />
            <span className="text-gray-300 group-hover:text-white transition-colors duration-300">{skill}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-cyan-300 italic">{experience}</p>
    </div>
  );
};

const Skills: React.FC = () => {
  const skillCategories = [
    {
      title: "Cybersecurity",
      skills: ["Penetration Testing", "OWASP", "Network Security", "Vulnerability Exploitation", "Linux, Databases", "Cryptography"],
      experience: "Years of experience: 2024 - Present",
      icon: <Shield className="w-8 h-8" />
    },
    {
      title: "Programming",
      skills: ["Python", "Golang", "HTML, CSS, JavaScript", "React, Tailwind, NextJS"],
      experience: "Languages used in various projects from 2022 - Present",
      icon: <Code className="w-8 h-8" />
    },
    {
      title: "Business & Marketing",
      skills: ["Leadership", "Digital Advertising", "Copywriting", "Basic Financial Accounting", "AI-Driven Market Analysis"],
      experience: "Experience: 2023 - Present",
      icon: <Briefcase className="w-8 h-8" />
    },
    {
      title: "Smart Contract Auditing",
      skills: ["Auditing of smart contracts on blockchain platforms", "Deep knowledge of Solidity and contract vulnerabilities"],
      experience: "Experience: 2024 - Present",
      icon: <FileCode className="w-8 h-8" />
    },
    {
      title: "Auditing Assessment",
      skills: ["Comprehensive security audits for Web2/Web3 platforms", "Extensive experience in code review and vulnerability testing"],
      experience: "Experience: 2024 - Present",
      icon: <Search className="w-8 h-8" />
    },
    {
      title: "Languages",
      skills: ["Arabic (C1)", "English (B2)", "Spanish (A2)", "Binary (More Than Native)"],
      experience: "",
      icon: <Globe className="w-8 h-8" />
    }
  ];

  return (
    <section id="skills" className="py-24 bg-gradient-radial from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-6xl font-extrabold mb-20 text-center relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Skill Matrix</span>
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full"></span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {skillCategories.map((category, index) => (
            <SkillCategory key={index} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;