import React, { useState } from 'react';
import { Award, CheckCircle, ExternalLink, ChevronDown, ChevronUp, Shield } from 'lucide-react';

interface CertificationItemProps {
  title: string;
  year: string;
  description: string;
  skills: string[];
  certificationLink?: string;
}

const CertificationItem: React.FC<CertificationItemProps> = ({ title, year, description, skills, certificationLink }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl border-2 border-cyan-700 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-500 transform hover:scale-105">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="w-8 h-8 text-cyan-400 mr-4" />
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{title}</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
          aria-label={isExpanded ? "Collapse details" : "Expand details"}
        >
          {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </button>
      </div>
      <p className="text-sm text-cyan-300 mb-4">{year}</p>
      {isExpanded && (
        <>
          <p className="text-gray-300 mb-6">{description}</p>
          <ul className="space-y-3 mb-6">
            {skills.map((skill, index) => (
              <li key={index} className="flex items-center group">
                <CheckCircle className="w-4 h-4 text-cyan-500 mr-3 transition-all duration-300 group-hover:text-cyan-300 group-hover:rotate-12" />
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">{skill}</span>
              </li>
            ))}
          </ul>
          {certificationLink && (
            <a 
              href={certificationLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-4 inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              <span className="font-medium">View Certificate</span>
            </a>
          )}
        </>
      )}
    </div>
  );
};

const Certifications: React.FC = () => {
  const certifications: CertificationItemProps[] = [
    {
      title: "CEH (Certified Ethical Hacker)",
      year: "2024",
      description: "Mastered comprehensive ethical hacking techniques and information security protocols, enhancing cybersecurity expertise.",
      skills: ["Ethical Hacking", "Network Security", "Vulnerability Assessment", "Penetration Testing"],
      certificationLink: "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/"
    },
    {
      title: "OSCP (Offensive Security Certified Professional)",
      year: "2024",
      description: "Demonstrated advanced penetration testing skills through rigorous hands-on examinations, proving real-world offensive security capabilities.",
      skills: ["Advanced Penetration Testing", "Exploit Development", "Buffer Overflow", "Privilege Escalation"],
      certificationLink: "https://www.offensive-security.com/pwk-oscp/"
    },
    {
      title: "Cisco Certified Network Professional Security",
      year: "2024",
      description: "Acquired expertise in designing, implementing, and maintaining complex network security solutions for enterprise environments.",
      skills: ["Network Security Design", "VPN Implementation", "Firewall Configuration", "Threat Detection"],
      certificationLink: "https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/professional/ccnp-security-v2.html"
    },
    {
      title: "Google Marketing Certificate",
      year: "2022",
      description: "Mastered digital marketing strategies, analytics, and tools endorsed by Google, enhancing online presence and campaign effectiveness.",
      skills: ["Digital Marketing", "SEO", "PPC Advertising", "Analytics"],
      certificationLink: "https://grow.google/certificates/digital-marketing-ecommerce/"
    }
  ];

  return (
    <section id="certifications" className="py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-extrabold mb-16 text-center">
          <span className="relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Professional Certifications
            </span>
            <span className="absolute -bottom-4 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></span>
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {certifications.map((cert, index) => (
            <CertificationItem key={index} {...cert} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;