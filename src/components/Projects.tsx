import React, { useState } from 'react';
import { Github, ExternalLink, Calendar, Tag, Zap } from 'lucide-react';

interface ProjectItemProps {
  title: string;
  date: string;
  description: string;
  githubLink: string;
  demoLink?: string;
  tags: string[];
}

const ProjectItem: React.FC<ProjectItemProps> = ({ title, date, description, githubLink, demoLink, tags }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl border-2 ${isHovered ? 'border-cyan-400 shadow-2xl shadow-cyan-500/40' : 'border-cyan-700'} transition-all duration-500 transform ${isHovered ? 'scale-105' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center mb-6">
        <div className={`text-cyan-400 mr-4 transition-all duration-500 ${isHovered ? 'scale-125' : ''}`}>
          <Github className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{title}</h3>
      </div>
      <div className="flex items-center text-sm text-gray-300 mb-4">
        <Calendar className="w-4 h-4 mr-2 text-cyan-500" />
        <p>{date}</p>
      </div>
      <p className="mb-6 text-gray-300">{description}</p>
      <ul className="space-y-3 mb-6">
        {tags.map((tag, index) => (
          <li key={index} className="flex items-center group">
            <Zap className="w-4 h-4 text-cyan-500 mr-3 transition-all duration-300 group-hover:text-cyan-300 group-hover:rotate-12" />
            <span className="text-gray-300 group-hover:text-white transition-colors duration-300">{tag}</span>
          </li>
        ))}
      </ul>
      <div className="flex space-x-6">
        <a href={githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
          <Github className="w-5 h-5 mr-2" />
          <span className="font-medium">GitHub</span>
        </a>
        {demoLink && (
          <a href={demoLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
            <ExternalLink className="w-5 h-5 mr-2" />
            <span className="font-medium">Live Demo</span>
          </a>
        )}
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const projects: ProjectItemProps[] = [
    {
      title: "HackFunction (Python Library)",
      date: "May 2024 - Jun 2024",
      description: "An advanced Python library for vulnerability scanning and information gathering, featuring automated penetration testing tools and customizable security assessments.",
      githubLink: "https://github.com/Zierax/HackFunction",
      demoLink: "https://example.com/hackfunction-demo",
      tags: ["Python", "Cybersecurity", "Penetration Testing", "Automation"]
    },
    {
      title: "Mr-Zierax Frontend Project",
      date: "Mar 2024 - May 2024",
      description: "A responsive frontend project showcasing modern web development skills, built with React and Tailwind CSS, featuring a cybersecurity-themed portfolio design.",
      githubLink: "https://github.com/Zierax/Mr-Zierax-Frontend",
      tags: ["React", "TypeScript", "Tailwind CSS", "Responsive Design"]
    }
  ];

  return (
    <section id="projects" className="py-24 bg-gradient-radial from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-6xl font-extrabold mb-20 text-center relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Projects</span>
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full"></span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {projects.map((project, index) => (
            <ProjectItem key={index} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;