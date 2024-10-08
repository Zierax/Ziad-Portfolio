import React from 'react';
import { Shield, Code, Zap, ChevronRight } from 'lucide-react';

interface SkillCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SkillCard: React.FC<SkillCardProps> = ({ icon, title, description }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-cyan-500/30 hover:border-cyan-400/50">
    <div className="flex items-center mb-6">
      <div className="text-cyan-400 mr-4 transition-all duration-500 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{title}</h3>
    </div>
    <p className="text-gray-300 mb-6 text-sm sm:text-base">{description}</p>
    <a href="#" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-300 group">
      <span className="font-medium mr-2 text-sm sm:text-base">Learn more</span>
      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
    </a>
  </div>
);

const AboutMe: React.FC = () => {
  const skills = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Penetration Testing",
      description: "Expert in identifying and exploiting vulnerabilities across Web2 and Web3 platforms, ensuring robust security measures."
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Custom Security Tools",
      description: "Develop state-of-the-art tools for comprehensive security assessments, vulnerability scanning, and automated defense mechanisms."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Contract Auditing",
      description: "Meticulous auditing of blockchain-based applications to ensure ironclad security and integrity in decentralized systems."
    }
  ];

  return (
    <section id="about-me" className="py-24 bg-gradient-radial from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl sm:text-6xl font-extrabold mb-20 text-center relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">About Me</span>
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full"></span>
        </h2>
        <div className="mb-16 text-base sm:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto space-y-6">
          <p className="transition-all duration-300 hover:text-white">
            As a cutting-edge cybersecurity expert, I specialize in fortifying digital assets across the evolving landscapes of Web2 and Web3 platforms. My expertise lies in crafting bespoke security solutions, executing comprehensive penetration tests, and providing unparalleled smart contract auditing services.
          </p>
          <p className="transition-all duration-300 hover:text-white">
            Since embarking on my freelance journey in March 2024, I've been at the vanguard of combating sophisticated and ever-evolving cyber threats. By seamlessly blending state-of-the-art technical prowess with a profound understanding of modern cybersecurity paradigms, I deliver proactive, innovative, and highly effective security measures meticulously tailored to each client's unique requirements and challenges.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {skills.map((skill, index) => (
            <SkillCard key={index} {...skill} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutMe;