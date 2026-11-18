export type AccountType = 'learner' | 'job_seeker' | 'recruiter';

export interface UserAccount {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  accountType: AccountType;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

export interface ProjectEntry {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ExperienceEntry {
  role: string;
  organization: string;
  duration: string;
  highlights: string[];
}

export interface CandidateProfile {
  uid: string;
  fullName: string;
  headline: string;
  location: string;
  targetRole: string;
  education: EducationEntry[];
  skills: string[];
  programmingLanguages: string[];
  frameworksTools: string[];
  projects: ProjectEntry[];
  internships: ExperienceEntry[];
  workExperience: ExperienceEntry[];
  certifications: string[];
  achievements: string[];
  shareWithRecruiters: boolean;
  resumeScore?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RecruiterProfile {
  uid: string;
  recruiterName: string;
  companyName: string;
  companyWebsite: string;
  industry: string;
  companySize: string;
  location: string;
  description: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ParsedResumeProfile {
  fullName: string;
  email: string;
  phone: string;
  education: EducationEntry[];
  degrees: string[];
  technicalSkills: string[];
  programmingLanguages: string[];
  frameworksAndTools: string[];
  projects: ProjectEntry[];
  internships: ExperienceEntry[];
  workExperience: ExperienceEntry[];
  certifications: string[];
  achievements: string[];
}

export interface ResumeScoreBreakdown {
  overall: number;
  technicalSkills: number;
  projects: number;
  education: number;
  practicalExperience: number;
  certifications: number;
  structureClarity: number;
  calculationExplanation: string;
}

export interface ResumeOverview {
  professionalSummary: string;
  technicalSkillSummary: string;
  educationSummary: string;
  projectSummary: string;
  experienceSummary: string;
}

export interface ResumeImprovements {
  missingSections: string[];
  suggestions: string[];
  strongerProjectDescriptions: string[];
  missingTechnicalKeywords: string[];
  actionableRecommendations: string[];
}

export interface ResumeDocument {
  id: string;
  uid: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  fileSize: number;
  extractedText: string;
  parsedProfile: ParsedResumeProfile;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ResumeAnalysis {
  id: string;
  uid: string;
  resumeId: string;
  fileName: string;
  overview: ResumeOverview;
  scoreBreakdown: ResumeScoreBreakdown;
  improvements: ResumeImprovements;
  createdAt?: unknown;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type QuestionKind = 'mcq' | 'true_false' | 'technical' | 'coding';

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  topic: string;
  difficulty: DifficultyLevel;
  prompt: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  id?: string;
  uid: string;
  skillId: string;
  skillTitle: string;
  quizId: string;
  difficulty: DifficultyLevel;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  strongTopics: string[];
  weakTopics: string[];
  recommendedTopics: string[];
  timeSpentSeconds: number;
  createdAt?: unknown;
}

export interface WeeklyGoalItem {
  id: string;
  weekLabel: string;
  title: string;
  completed: boolean;
}

export interface DailyActivityItem {
  id: string;
  date: string;
  activity: string;
  minutesSpent: number;
}

export interface RoadmapWeekItem {
  week: number;
  title: string;
  focusSkills: string[];
  tasks: string[];
  milestone: string;
  completed: boolean;
}

export interface LearningProgress {
  id?: string;
  uid: string;
  skillId: string;
  completedLessonIds: string[];
  weeklyGoals?: WeeklyGoalItem[];
  dailyActivities?: DailyActivityItem[];
  customRoadmap?: RoadmapWeekItem[];
  targetRole?: string;
  completionPercentage: number;
  badgeEarned: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MissingSkillPlan {
  skill: string;
  whyRequired: string;
  roadmapSteps: string[];
  recommendedCourses: string[];
  freeResources: { title: string; url: string }[];
  estimatedLearningTime: string;
  practiceExercises: string[];
  miniProjectSuggestion: string;
}

export interface SkillGapReport {
  id?: string;
  uid: string;
  targetRole: string;
  matchedSkills: string[];
  missingSkills: string[];
  uncertainSkills: string[];
  additionalSkills: string[];
  matchPercentage: number;
  missingSkillPlans: MissingSkillPlan[];
  createdAt?: unknown;
}

export interface JobListing {
  id: string;
  recruiterId: string;
  title: string;
  companyName: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'Onsite';
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  salaryRange?: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  description: string;
  applyUrl?: string;
  status: 'open' | 'closed';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UnifiedJobItem {
  jobKey: string;
  title: string;
  company: string;
  location: string;
  country?: string;
  workMode?: string;
  employmentType?: string;
  experienceLevel?: string;
  salary?: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  description: string;
  postedAt?: string;
  source: string;
  applyUrl: string;
  isInternalRecruiterJob?: boolean;
}

export interface JobMatchEvaluation {
  jobKey: string;
  requiredSkillMatch: number;
  preferredSkillMatch: number;
  educationRelevance: number;
  experienceRelevance: number;
  overallCompatibility: number;
  suitabilityTier: 'highly_suitable' | 'partially_suitable' | 'additional_skills_required';
  explanation: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface SavedJob {
  id?: string;
  uid: string;
  jobKey: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  source: string;
  applyUrl?: string;
  description?: string;
  matchScore?: number;
  createdAt?: unknown;
}

export interface JobApplication {
  id?: string;
  uid: string;
  jobKey: string;
  title: string;
  company: string;
  location?: string;
  source?: string;
  applyUrl?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RecruiterShortlist {
  id?: string;
  recruiterId: string;
  candidateUid: string;
  candidateName: string;
  targetRole?: string;
  jobId?: string;
  jobTitle?: string;
  matchPercentage?: number;
  status: 'shortlisted' | 'contacted' | 'interview' | 'archived';
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LessonUnit {
  id: string;
  title: string;
  durationMinutes: number;
  summary: string;
  steps: string[];
  practicalExample: string;
  codeExample?: {
    language: string;
    code: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  overview: string;
  lessons: LessonUnit[];
}

export interface MiniProject {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  deliverables: string[];
  skillsPracticed: string[];
}

export interface ExternalResource {
  title: string;
  provider: string;
  type: 'Documentation' | 'Video' | 'Free Resource' | 'Course';
  url: string;
}

export interface SkillDomain {
  id: string;
  slug: string;
  number: string;
  title: string;
  category: string;
  tagline: string;
  introduction: string;
  prerequisites: string[];
  roadmapPhases: { phase: string; title: string; milestones: string[] }[];
  modules: CourseModule[];
  miniProjects: MiniProject[];
  resources: ExternalResource[];
  practicePrompts: string[];
  quizQuestions: QuizQuestion[];
}
