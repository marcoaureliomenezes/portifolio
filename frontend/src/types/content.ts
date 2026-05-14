/**
 * Content type definitions for the portfolio i18n system.
 *
 * SupportedLanguages uses short locale codes ("pt" | "en" | "de").
 * Content is loaded from src/data/content/{pt,en,de}.json — T-CONTENT-01.
 */

export type SupportedLanguages = "pt" | "en" | "de";

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
  header: HeaderInfo;
  resume: Resume;
  skills: SkillCategory[];
  experiences: Experience[];
  education: Education;
  certifications: Certification[];
}
