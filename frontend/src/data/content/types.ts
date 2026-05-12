
export interface Position {
  title: string;
  period: string;
  responsibilities?: string[];
  technologies?: string;
}

export interface Experience {
  company: string;
  fullName: string;
  location: string;
  totalPeriod: string;
  type: "main" | "minor";
  roles: Position[];
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  coursework: string;
  thesis: string;
}

export interface Resume {
  short: string;
  full: string;
}

export interface Certification {
  name: string;
  issuer: string;
  category: string;
  date: string;
  validity: string;
  level: string;
  icon: string;
  link: string;
  description: string;
  priority: number;
}

export interface SkillCategory {
  title: string;
  icon: string;
  skills: string[];
}

export interface HeaderInfo {
  title: string;
  location: string;
  viewEmail: string;
}

export interface ContactInfo {
  email: string;
  linkedinUrl: string;
  githubUrl: string;
}

export interface NavLabels {
  experience: string;
  education: string;
  certifications: string;
  skills: string;
}

export interface UiLabels {
  careerProgression: string;
  position: string;
  positions: string;
  issuerLabel: string;
  viewLarger: string;
  resumeFileLabel: string;
  emailModalTitle: string;
  emailSendButton: string;
}

export interface ContentData {
  resumeTitle: string;
  skillsTitle: string;
  experienceTitle: string;
  educationTitle: string;
  certificationsTitle: string;
  seeMore: string;
  seeLess: string;
  responsibilities: string;
  technologies: string;
  validUntil: string;
  viewCredential: string;
  contact: ContactInfo;
  nav: NavLabels;
  ui: UiLabels;
  header: HeaderInfo;
  resume: Resume;
  skills: SkillCategory[];
  experiences: Experience[];
  education: Education;
  certifications: Certification[];
}

export type SupportedLanguages = "Português" | "English" | "Deutsch";

export type ContentMap = Record<SupportedLanguages, ContentData>;
