import React from 'react';
import { Briefcase, Calendar, ChevronRight, Star } from 'lucide-react';

interface ExperienceItemProps {
  title: string;
  company: string;
  date: string;
  description: string[];
  skills: string[];
  highlight?: string;
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({ title, company, date, description, skills, highlight }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl mb-10 border-2 border-indigo-500 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 transform hover:-translate-y-2">
    <div className="flex items-center mb-6">
      <Briefcase className="w-8 h-8 text-indigo-400 mr-4" />
      <div>
        <h3 className="text-2xl font-bold text-indigo-300">{title}</h3>
        <p className="text-lg text-indigo-500">{company}</p>
      </div>
    </div>
    <div className="flex items-center mb-6 text-gray-300">
      <Calendar className="w-5 h-5 mr-3" />
      <p className="text-md">{date}</p>
    </div>
    <ul className="mb-6 space-y-3">
      {description.map((item, index) => (
        <li key={index} className="flex items-start">
          <ChevronRight className="w-5 h-5 text-pink-400 mr-3 mt-1 flex-shrink-0" />
          <p className="text-gray-200 text-lg">{item}</p>
        </li>
      ))}
    </ul>
    <div className="flex flex-wrap gap-3 mb-6">
      {skills.map((skill, index) => (
        <span key={index} className="px-4 py-2 bg-gray-700 text-emerald-300 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
          {skill}
        </span>
      ))}
    </div>
    {highlight && (
      <div className="flex items-center text-yellow-400">
        <Star className="w-5 h-5 mr-2" />
        <p className="text-sm font-semibold">{highlight}</p>
      </div>
    )}
  </div>
);

const Experience: React.FC = () => {
  const experiences: ExperienceItemProps[] = [
    {
      title: "Web2/Web3 Penetration Tester & Bug Hunter",
      company: "Freelance",
      date: "Mar 2024 - Present",
      description: [
        "Develop custom tools and automation scripts for vulnerability detection in Web2/Web3 systems.",
        "Conduct comprehensive security assessments and penetration tests for clients.",
        "Participate in bug bounty programs to identify and report critical vulnerabilities."
      ],
      skills: ["Penetration Testing", "Web3 Security", "Custom Tool Development", "Bug Hunting"],
      highlight: "Discovered and responsibly disclosed 5 critical vulnerabilities in major DeFi protocols"
    },
    {
      title: "Marketing Manager",
      company: "Graphics Studio",
      date: "Jan 2024 - Apr 2024",
      description: [
        "Led strategic marketing campaigns resulting in a 30% increase in brand awareness.",
        "Developed and implemented data-driven marketing strategies across multiple channels.",
        "Collaborated with cross-functional teams to align marketing efforts with business goals."
      ],
      skills: ["Digital Marketing", "Brand Strategy", "Data Analysis", "Team Leadership"],
      highlight: "Achieved 150% ROI on marketing campaigns within first quarter"
    },
    {
      title: "Copywriter/Social Media Manager",
      company: "Multiple Brands",
      date: "May 2022 - Feb 2023",
      description: [
        "Created engaging content for various social media platforms, increasing follower engagement by 25%.",
        "Developed and executed social media strategies tailored to each brand's unique voice and audience.",
        "Analyzed social media metrics to optimize content performance and ROI."
      ],
      skills: ["Content Creation", "Social Media Management", "Analytics", "Brand Voice Development"],
      highlight: "Grew combined social media following by 50,000+ across all managed accounts"
    }
  ];

  return (
    <section id="experience" className="py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-extrabold mb-16 text-center">
          <span className="relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-500 to-emerald-400">
              Work Experience
            </span>
            <span className="absolute -bottom-4 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-pink-500 to-emerald-400"></span>
          </span>
        </h2>
        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <ExperienceItem key={index} {...exp} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;