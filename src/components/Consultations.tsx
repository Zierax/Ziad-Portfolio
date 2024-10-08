import React from 'react';
import { Calendar, Shield, Lock, Search } from 'lucide-react';

interface ConsultationOption {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ConsultationCard: React.FC<ConsultationOption> = ({ icon, title, description }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400/50">
    <div className="flex items-center mb-4">
      <div className="text-cyan-400 mr-3">{icon}</div>
      <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{title}</h3>
    </div>
    <p className="text-gray-300">{description}</p>
  </div>
);

const Consultations: React.FC = () => {
  const consultationOptions: ConsultationOption[] = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Penetration Testing Consultation",
      description: "Expert advice on identifying and mitigating vulnerabilities in your systems."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Security Assessment",
      description: "Comprehensive evaluation of your current security posture and improvement strategies."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Free Security Consulting",
      description: "Initial consultation to discuss your security concerns and potential solutions."
    }
  ];

  return (
    <section id="consultations" className="py-24 bg-gradient-radial from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl sm:text-6xl font-extrabold mb-20 text-center relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Book a Consultation</span>
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full"></span>
        </h2>
        <p className="text-base sm:text-xl text-gray-300 mb-16 text-center max-w-4xl mx-auto">
          Need expert cybersecurity advice? Schedule a personalized consultation to discuss your specific needs and challenges.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {consultationOptions.map((option, index) => (
            <ConsultationCard key={index} {...option} />
          ))}
        </div>
        <div className="text-center">
          <a
            href="https://calendly.com/Zierax"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 shadow-lg hover:from-blue-500 hover:to-purple-600"
          >
            <Calendar className="w-6 h-6 mr-3" />
            Schedule Your Consultation
          </a>
        </div>
      </div>
    </section>
  );
};

export default Consultations;