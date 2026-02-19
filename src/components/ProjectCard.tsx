import { Github, ExternalLink } from "lucide-react";

interface Project {
  title: string;
  description: string;
  tags: string[];
  date: string;
  highlights: string;
  github?: string;
  demo?: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <div className="glass-panel rounded-lg p-6 hover:border-primary/50 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold terminal-text group-hover:text-secondary transition-colors">
          {project.title}
        </h3>
        <div className="flex gap-2">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/60 hover:text-primary transition-colors"
            >
              <Github size={20} />
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/60 hover:text-primary transition-colors"
            >
              <ExternalLink size={20} />
            </a>
          )}
        </div>
      </div>
      
      <p className="text-sm text-primary/60 mb-3">{project.date}</p>
      
      <p className="text-primary/80 text-sm mb-4 leading-relaxed">
        {project.description}
      </p>
      
      {project.highlights && (
        <p className="text-terminal-amber text-sm mb-4 italic">
          💡 {project.highlights}
        </p>
      )}
      
      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 rounded border border-primary/30 text-primary/70"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;
