import { SKILLS_PART_1 } from './curriculum-part1';
import { SKILLS_PART_2 } from './curriculum-part2';
import { SkillDomain } from './types';

export const ALL_SKILLS: SkillDomain[] = [...SKILLS_PART_1, ...SKILLS_PART_2];

export function getSkillBySlug(slug: string): SkillDomain | undefined {
  return ALL_SKILLS.find((s) => s.slug === slug || s.id === slug);
}

export function getTotalLessonsForSkill(skill: SkillDomain): number {
  return skill.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
}

export interface TargetRoleBenchmark {
  role: string;
  requiredSkills: string[];
  preferredSkills: string[];
  summary: string;
}

export const TARGET_ROLE_BENCHMARKS: TargetRoleBenchmark[] = [
  {
    role: 'Machine Learning Engineer',
    requiredSkills: ['Python', 'NumPy', 'Pandas', 'SQL', 'Scikit-learn', 'Machine Learning', 'Model Deployment'],
    preferredSkills: ['TensorFlow', 'PyTorch', 'Deep Learning', 'Docker', 'MLOps', 'FastAPI'],
    summary: 'Designs, trains, evaluates, and productionizes predictive ML models and pipelines.',
  },
  {
    role: 'AI Engineer / GenAI Developer',
    requiredSkills: ['Python', 'TypeScript', 'LLM APIs', 'Prompt Engineering', 'RAG', 'Vector Databases', 'REST APIs'],
    preferredSkills: ['Next.js', 'Structured Outputs', 'Evaluation Harnesses', 'Docker', 'Cloud Deployment'],
    summary: 'Builds production AI applications powered by Gemini/LLMs, retrieval pipelines, and tool calling.',
  },
  {
    role: 'Data Analyst',
    requiredSkills: ['SQL', 'Excel', 'Data Visualization', 'Pandas', 'Statistics', 'KPI Reporting'],
    preferredSkills: ['Python', 'Tableau', 'Power BI', 'A/B Testing'],
    summary: 'Transforms operational datasets into clear SQL queries, metrics, and business insights.',
  },
  {
    role: 'Data Scientist',
    requiredSkills: ['Python', 'SQL', 'Statistics', 'Pandas', 'NumPy', 'Hypothesis Testing', 'Scikit-learn'],
    preferredSkills: ['Experimentation', 'Feature Engineering', 'Data Visualization', 'Bayesian Inference'],
    summary: 'Conducts statistical modeling, experimentation, and predictive analytics.',
  },
  {
    role: 'Frontend Web Developer',
    requiredSkills: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Tailwind CSS', 'Git'],
    preferredSkills: ['Next.js', 'Accessibility (WCAG)', 'Testing', 'REST APIs'],
    summary: 'Builds responsive, accessible, interactive web interfaces.',
  },
  {
    role: 'Backend Developer',
    requiredSkills: ['Node.js', 'TypeScript', 'REST APIs', 'SQL', 'Authentication', 'Database Design', 'Git'],
    preferredSkills: ['Python', 'Docker', 'Redis', 'Unit Testing', 'Cloud Security'],
    summary: 'Architects secure APIs, databases, and scalable server services.',
  },
  {
    role: 'Full-Stack Developer',
    requiredSkills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'REST APIs', 'SQL', 'Tailwind CSS', 'Git'],
    preferredSkills: ['Firebase', 'Docker', 'CI/CD', 'Authentication'],
    summary: 'Delivers end-to-end features across frontend UI, backend APIs, and databases.',
  },
  {
    role: 'Cloud & DevOps Engineer',
    requiredSkills: ['Linux', 'Docker', 'CI/CD', 'Git', 'Cloud Infrastructure', 'Networking'],
    preferredSkills: ['Kubernetes', 'Terraform', 'Monitoring', 'Python', 'Security Hardening'],
    summary: 'Automates builds, container orchestration, and reliable cloud deployments.',
  },
  {
    role: 'Cybersecurity Analyst / AppSec',
    requiredSkills: ['OWASP Top 10', 'Networking', 'Access Control', 'Cryptography Basics', 'Threat Modeling', 'Linux'],
    preferredSkills: ['Python', 'SIEM Logs', 'Cloud IAM', 'Penetration Testing'],
    summary: 'Secures applications, identities, and cloud infrastructure against threats.',
  },
];
