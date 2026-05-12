import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Award, Calendar, Clock, Trophy, Code2, Globe, Cloud, Database, Settings, MapPin, Medal, GraduationCap, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getContent, SupportedLanguages } from "@/data/content";

interface PortfolioProps {
  language?: string;
}

export const Portfolio = ({ language = "Português" }: PortfolioProps) => {
  const [isResumeExpanded, setIsResumeExpanded] = useState(false);
  const [openExperiences, setOpenExperiences] = useState<{ [key: number]: { [key: number]: boolean } }>({});
  
  // Estados para accordions mobile
  const [mobileSections, setMobileSections] = useState({
    experience: true,
    education: true,
    certifications: true,
    skills: true
  });

  // Busca o conteúdo baseado no idioma selecionado
  const currentContent = getContent(language as SupportedLanguages);

  // Agrupa certificações por categoria
  const certificationsByCategory = currentContent.certifications.reduce((acc, cert) => {
    if (!acc[cert.category]) {
      acc[cert.category] = [];
    }
    acc[cert.category].push(cert);
    return acc;
  }, {} as Record<string, typeof currentContent.certifications>);

  // Estado inicial dos grupos de certificação (todos expandidos)
  const [expandedCertGroups, setExpandedCertGroups] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    Object.keys(certificationsByCategory).forEach(category => {
      initialState[category] = true;
    });
    return initialState;
  });

  // Estado inicial dos cards de certificação (todos expandidos)
  const [expandedCertCards, setExpandedCertCards] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    currentContent.certifications.forEach(cert => {
      initialState[cert.name] = true;
    });
    return initialState;
  });

  // Estado para expansão do texto de descrição das certificações
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const toggleExperience = (expIndex: number, posIndex: number) => {
    setOpenExperiences(prev => ({
      ...prev,
      [expIndex]: {
        ...prev[expIndex],
        [posIndex]: !prev[expIndex]?.[posIndex]
      }
    }));
  };

  const toggleCertGroup = (category: string) => {
    setExpandedCertGroups(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleCertCard = (certName: string) => {
    setExpandedCertCards(prev => ({
      ...prev,
      [certName]: !prev[certName]
    }));
  };

  const toggleDescription = (certName: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [certName]: !prev[certName]
    }));
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getProviderIcon = (category: string) => {
    switch (category) {
      case 'AWS':
        return 'images/aws_icon.png';
      case 'Azure':
        return 'images/azure_icon.png';
      case 'Databricks':
        return 'images/databricks_icon.png';
      default:
        return null;
    }
  };

  const toggleMobileSection = (section: keyof typeof mobileSections) => {
    setMobileSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  // Função para mapear ícones das categorias de habilidades
  const getSkillIcon = (title: string) => {
    if (title.toLowerCase().includes('idioma') || title.toLowerCase().includes('language')) {
      return Globe;
    }
    if (title.toLowerCase().includes('program') || title.toLowerCase().includes('linguagem')) {
      return Code2;
    }
    if (title.toLowerCase().includes('cloud')) {
      return Cloud;
    }
    if (title.toLowerCase().includes('dados') || title.toLowerCase().includes('data')) {
      return Database;
    }
    if (title.toLowerCase().includes('devops')) {
      return Settings;
    }
    return Code2; // fallback
  };

  // Função para mapear cores dos ícones das habilidades
  const getSkillIconColor = (title: string) => {
    if (title.toLowerCase().includes('idioma') || title.toLowerCase().includes('language')) {
      return 'text-purple-600';
    }
    if (title.toLowerCase().includes('program') || title.toLowerCase().includes('linguagem')) {
      return 'text-blue-600';
    }
    if (title.toLowerCase().includes('cloud')) {
      return 'text-sky-600';
    }
    if (title.toLowerCase().includes('dados') || title.toLowerCase().includes('data')) {
      return 'text-orange-600';
    }
    if (title.toLowerCase().includes('devops')) {
      return 'text-green-600';
    }
    return 'text-blue-600'; // fallback
  };

  return (
    <div className="container mx-auto px-4 pt-64 md:pt-32 pb-12 space-y-12 max-w-4xl md:ml-0">
      {/* Hero Section - Resumo */}
      <Card className="w-full shadow-glow border-0 bg-gradient-to-br from-card to-accent/30 hover:shadow-large transition-all duration-300">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg md:text-2xl font-bold text-primary">
            {currentContent.resumeTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-muted-foreground leading-relaxed mb-6 text-sm md:text-sm ${!isResumeExpanded ? 'line-clamp-4' : ''}`}>
            {isResumeExpanded ? currentContent.resume.full : currentContent.resume.short}
          </p>
          <Button
            variant="link"
            onClick={() => setIsResumeExpanded(!isResumeExpanded)}
            className="p-0 h-auto text-primary hover:text-primary-foreground font-semibold transition-colors duration-200"
          >
            {isResumeExpanded ? currentContent.seeLess : currentContent.seeMore}
          </Button>
        </CardContent>
      </Card>

      {/* Professional Experience Section */}
      <section id="experiencia">
        {/* Desktop - sempre visível */}
        <Card className="hidden md:block w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-3">
              <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              {currentContent.experienceTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {currentContent.experiences.map((experience, expIndex) => (
              <div key={expIndex} className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                
                {experience.roles.length === 1 ? (
                  /* Experiência com 1 cargo - card único */
                  <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-4 border border-border/50 relative">
                    <h3 className="text-base md:text-xl font-bold text-foreground mb-2">
                      {experience.fullName}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-primary text-sm md:text-lg">
                        {experience.roles[0].title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <p className="text-primary font-semibold text-xs md:text-sm">
                          {experience.roles[0].period}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-muted-foreground mb-4">
                      <MapPin className="w-3 h-3 text-red-600" />
                      <span>{experience.location}</span>
                    </div>
                    
                    {experience.roles[0].responsibilities && (
                      <div className="space-y-3 pt-2">
                        <h5 className="font-semibold text-foreground text-sm flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          {currentContent.responsibilities}
                        </h5>
                        <ul className="space-y-2 pl-2">
                          {experience.roles[0].responsibilities.map((responsibility, respIndex) => (
                            <li key={respIndex} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <p className="text-foreground text-sm leading-relaxed">
                                {responsibility}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {experience.roles[0].technologies && (
                      <div className="pt-4 border-t border-border/30">
                        <h5 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                          {currentContent.technologies}
                        </h5>
                        <div className="bg-gradient-to-r from-accent/20 to-secondary/20 rounded-lg p-4 border border-primary/20">
                          <p className="text-foreground font-medium text-sm leading-relaxed">
                            {experience.roles[0].technologies}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Experiência com múltiplos cargos */
                  <div className="pl-8 space-y-6 relative">
                    {/* Linha pontilhada conectando empresa aos cargos */}
                    <div className="absolute left-4 top-24 bottom-4 w-0.5 border-l-2 border-dotted border-primary/40"></div>
                    {/* Cabeçalho da empresa */}
                    <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-4 border border-border/50 relative">
                      <h3 className="text-base md:text-xl font-bold text-foreground mb-2">
                        {experience.fullName}
                      </h3>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="text-sm text-muted-foreground font-medium">
                          {currentContent.ui.careerProgression} ({experience.roles.length} {experience.roles.length === 1 ? currentContent.ui.position : currentContent.ui.positions}):
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3 text-red-600" />
                          <span>{experience.location}</span>
                        </div>
                      </div>
                    </div>

                    {experience.roles.map((role, posIndex) => (
                      <Collapsible
                        key={posIndex}
                        open={openExperiences[expIndex]?.[posIndex] || false}
                        onOpenChange={() => toggleExperience(expIndex, posIndex)}
                      >
                        <div className="bg-gradient-to-br from-card to-accent/5 rounded-xl border border-border/30 overflow-hidden hover:border-primary/30 transition-all duration-200 shadow-soft hover:shadow-medium ml-6 relative">
                          <div className="absolute -left-6 top-1/2 w-6 h-0.5 border-t-2 border-dotted border-primary/40"></div>
                          <div className="absolute -left-7 top-1/2 w-2 h-2 bg-primary rounded-full transform -translate-y-1/2"></div>
                          <CollapsibleTrigger className="w-full p-6 text-left hover:bg-accent/5 transition-colors duration-200">
                            <div className="flex items-center justify-between w-full">
                              <h4 className="font-bold text-foreground text-sm md:text-lg">
                                {role.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-green-600" />
                                  <p className="text-primary font-semibold text-xs md:text-sm">
                                    {role.period}
                                  </p>
                                </div>
                                <div className="flex items-center text-primary">
                                  {openExperiences[expIndex]?.[posIndex] ? (
                                    <ChevronUp className="h-5 w-5" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="px-6 pb-6 space-y-4">
                            {role.responsibilities && (
                              <div className="space-y-3 pt-2">
                                <h5 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                  <Award className="h-4 w-4 text-yellow-600" />
                                  {currentContent.responsibilities}
                                </h5>
                                <ul className="space-y-2 pl-2">
                                  {role.responsibilities.map((responsibility, respIndex) => (
                                    <li key={respIndex} className="flex items-start space-x-3">
                                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                      <p className="text-foreground text-sm leading-relaxed">
                                        {responsibility}
                                      </p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {role.technologies && (
                              <div className="pt-4 border-t border-border/30">
                                <h5 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                                  <ExternalLink className="h-4 w-4 text-blue-600" />
                                  {currentContent.technologies}
                                </h5>
                                <div className="bg-gradient-to-r from-accent/20 to-secondary/20 rounded-lg p-4 border border-primary/20">
                                  <p className="text-foreground font-medium text-sm leading-relaxed">
                                    {role.technologies}
                                  </p>
                                </div>
                              </div>
                            )}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mobile - accordion */}
        <Collapsible
          className="md:hidden"
          open={mobileSections.experience}
          onOpenChange={() => toggleMobileSection('experience')}
        >
          <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-4">
                 <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                    {currentContent.experienceTitle}
                  </div>
                  {mobileSections.experience ? (
                    <ChevronUp className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-8">
                {currentContent.experiences.map((experience, expIndex) => (
                  <div key={expIndex} className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                    
                    {experience.roles.length === 1 ? (
                      /* Experiência com 1 cargo - card único Mobile */
                      <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-4 border border-border/50 relative">
                        <h3 className="text-xs md:text-xl font-bold text-foreground mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                          {experience.fullName}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-primary text-sm">
                            {experience.roles[0].title}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-green-600" />
                            <p className="text-primary font-semibold text-xs">
                              {experience.roles[0].period}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-muted-foreground text-xs mb-4">
                          <MapPin className="w-3 h-3 flex-shrink-0 text-red-600" />
                          <span className="truncate">{experience.location}</span>
                        </div>
                        
                        {experience.roles[0].responsibilities && (
                          <div className="space-y-3 pt-2">
                            <h5 className="font-semibold text-foreground text-sm flex items-center gap-2">
                              <Award className="h-4 w-4 text-yellow-600" />
                              {currentContent.responsibilities}
                            </h5>
                            <ul className="space-y-2 pl-2">
                              {experience.roles[0].responsibilities.map((responsibility, respIndex) => (
                                <li key={respIndex} className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                  <p className="text-foreground text-sm leading-relaxed">
                                    {responsibility}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {experience.roles[0].technologies && (
                          <div className="pt-4 border-t border-border/30">
                            <h5 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                              <ExternalLink className="h-4 w-4 text-blue-600" />
                              {currentContent.technologies}
                            </h5>
                            <div className="bg-gradient-to-r from-accent/20 to-secondary/20 rounded-lg p-4 border border-primary/20">
                              <p className="text-foreground font-medium text-sm leading-relaxed">
                                {experience.roles[0].technologies}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Experiência com múltiplos cargos Mobile */
                      <div className="pl-8 space-y-6 relative">
                        {/* Linha pontilhada conectando empresa aos cargos */}
                        <div className="absolute left-4 top-20 bottom-4 w-0.5 border-l-2 border-dotted border-primary/40"></div>
                        {/* Cabeçalho da empresa */}
                        <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-4 border border-border/50 relative">
                          <h3 className="text-xs md:text-xl font-bold text-foreground mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                            {experience.fullName}
                          </h3>
                          <div className="flex items-center gap-3 text-sm mb-3">
                            <p className="text-primary font-semibold text-xs whitespace-nowrap overflow-hidden text-ellipsis flex-shrink-0">{experience.totalPeriod}</p>
                            <span className="text-muted-foreground flex-shrink-0">|</span>
                            <div className="flex items-center gap-1 text-muted-foreground text-xs whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                              <MapPin className="w-3 h-3 flex-shrink-0 text-red-600" />
                              <span className="truncate">{experience.location}</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground font-medium">
                            {currentContent.ui.careerProgression} ({experience.roles.length} {experience.roles.length === 1 ? currentContent.ui.position : currentContent.ui.positions}):
                          </div>
                        </div>

                        {experience.roles.map((role, posIndex) => (
                          <Collapsible
                            key={posIndex}
                            open={openExperiences[expIndex]?.[posIndex] || false}
                            onOpenChange={() => toggleExperience(expIndex, posIndex)}
                          >
                            <div className="bg-gradient-to-br from-card to-accent/5 rounded-xl border border-border/30 overflow-hidden hover:border-primary/30 transition-all duration-200 shadow-soft hover:shadow-medium ml-6 relative">
                              <div className="absolute -left-6 top-1/2 w-6 h-0.5 border-t-2 border-dotted border-primary/40"></div>
                              <div className="absolute -left-7 top-1/2 w-2 h-2 bg-primary rounded-full transform -translate-y-1/2"></div>
                              <CollapsibleTrigger className="w-full p-6 text-left hover:bg-accent/5 transition-colors duration-200">
                                <div className="flex justify-between items-center">
                                  <div className="space-y-1">
                                    <h4 className="font-bold text-foreground text-sm md:text-lg">
                                      {role.title}
                                    </h4>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-green-600" />
                                      <p className="text-primary font-semibold text-xs">
                                        {role.period}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center text-primary">
                                    {openExperiences[expIndex]?.[posIndex] ? (
                                      <ChevronUp className="h-5 w-5" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5" />
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent className="px-6 pb-6 space-y-4">
                                {role.responsibilities && (
                                  <div className="space-y-3 pt-2">
                                    <h5 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                      <Award className="h-4 w-4 text-yellow-600" />
                                      {currentContent.responsibilities}
                                    </h5>
                                    <ul className="space-y-2 pl-2">
                                      {role.responsibilities.map((responsibility, respIndex) => (
                                        <li key={respIndex} className="flex items-start space-x-3">
                                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                          <p className="text-foreground text-sm leading-relaxed">
                                            {responsibility}
                                          </p>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {role.technologies && (
                                  <div className="pt-4 border-t border-border/30">
                                    <h5 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                                      <ExternalLink className="h-4 w-4 text-blue-600" />
                                      {currentContent.technologies}
                                    </h5>
                                    <div className="bg-gradient-to-r from-accent/20 to-secondary/20 rounded-lg p-4 border border-primary/20">
                                      <p className="text-foreground font-medium text-sm leading-relaxed">
                                        {role.technologies}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </section>

      {/* Education Section */}
      <section id="educacao">
        {/* Desktop - sempre visível */}
        <Card className="hidden md:block w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              {currentContent.educationTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              <div className="pl-8">
                <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-6 border border-border/50">
                  <h3 className="text-base md:text-xl font-bold text-foreground mb-2">
                    {currentContent.education.degree}
                  </h3>
                  <p className="text-primary font-semibold mb-2">{currentContent.education.institution}</p>
                  <p className="text-muted-foreground text-sm mb-4">{currentContent.education.period}</p>
                  <div className="space-y-2">
                    <p className="text-foreground text-sm">
                      {currentContent.education.coursework}
                    </p>
                    <p className="text-foreground text-sm">
                      {currentContent.education.thesis}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile - accordion */}
        <Collapsible
          className="md:hidden"
          open={mobileSections.education}
          onOpenChange={() => toggleMobileSection('education')}
        >
          <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                    {currentContent.educationTitle}
                  </div>
                  {mobileSections.education ? (
                    <ChevronUp className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                  <div className="pl-8">
                    <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-6 border border-border/50">
                      <h3 className="text-sm md:text-xl font-bold text-foreground mb-2">
                        {currentContent.education.degree}
                      </h3>
                      <p className="text-primary font-semibold mb-2 text-xs">{currentContent.education.institution}</p>
                      <p className="text-muted-foreground text-xs mb-4">{currentContent.education.period}</p>
                      <div className="space-y-2">
                        <p className="text-foreground text-xs">
                          {currentContent.education.coursework}
                        </p>
                        <p className="text-foreground text-xs">
                          {currentContent.education.thesis}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </section>

      {/* Certifications Section - continuaria com o resto do código... */}
      <section id="certificacoes">
        {/* Desktop */}
        <Card className="hidden md:block w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-3">
              <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-600 flex-shrink-0" />
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              {currentContent.certificationsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {Object.entries(certificationsByCategory).map(([category, certs]) => (
              <div key={category} className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                <div className="pl-8">
                  <Collapsible
                    open={expandedCertGroups[category]}
                    onOpenChange={() => toggleCertGroup(category)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {getProviderIcon(category) ? (
                            <img 
                              src={getProviderIcon(category)} 
                              alt={category} 
                              className="h-8 md:h-10 object-contain"
                            />
                          ) : (
                            <>
                              <Trophy className="w-6 h-6 text-yellow-600" />
                              <h3 className="text-base md:text-xl font-bold text-foreground">
                                {category}
                              </h3>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-primary">
                          <span className="text-sm text-muted-foreground">
                            {certs.length} certificado{certs.length !== 1 ? 's' : ''}
                          </span>
                          {expandedCertGroups[category] ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-4 space-y-4">
                      {certs.map((cert) => (
                        <Collapsible
                          key={cert.name}
                          open={expandedCertCards[cert.name]}
                          onOpenChange={() => toggleCertCard(cert.name)}
                        >
                          <div className="bg-gradient-to-br from-card to-accent/5 rounded-xl border border-border/30 overflow-hidden hover:border-primary/30 transition-all duration-200 shadow-soft hover:shadow-medium ml-6">
                            <CollapsibleTrigger className="w-full p-6 text-left hover:bg-accent/5 transition-colors duration-200">
                               <div className="flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                   {cert.icon ? (
                                     <img 
                                       src={cert.icon} 
                                       alt={`${cert.name} badge`} 
                                       className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 object-contain"
                                     />
                                   ) : (
                                     <Medal className="w-12 h-12 md:w-16 md:h-16 text-primary flex-shrink-0" />
                                   )}
                                   <div className="space-y-2">
                                     <h4 className="font-bold text-foreground text-sm md:text-base line-clamp-1">
                                       {cert.name}
                                     </h4>
                                     <div className="flex items-center gap-2">
                                       <Badge variant="secondary" className="text-xs">
                                         {cert.level}
                                       </Badge>
                                       <span className="text-muted-foreground text-xs">•</span>
                                       <span className="text-muted-foreground text-xs">{cert.date}</span>
                                     </div>
                                   </div>
                                 </div>
                                <div className="flex items-center text-primary">
                                  {expandedCertCards[cert.name] ? (
                                    <ChevronUp className="h-5 w-5" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="px-6 pb-6 space-y-4">
                              <div className="space-y-2">
                                <p className="text-foreground text-sm leading-relaxed">
                                  {expandedDescriptions[cert.name] 
                                    ? cert.description 
                                    : truncateText(cert.description)
                                  }
                                </p>
                                {cert.description.length > 100 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleDescription(cert.name)}
                                    className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                                  >
                                    {expandedDescriptions[cert.name] ? 'Ver menos' : 'Ver mais'}
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                                <div className="text-xs text-muted-foreground">
                                  <p><span className="font-semibold">{currentContent.validUntil}:</span> {cert.validity}</p>
                                  <p><span className="font-semibold">{currentContent.ui.issuerLabel}</span> {cert.issuer}</p>
                                </div>
                                {cert.link && cert.link !== '#' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(cert.link, '_blank');
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {currentContent.viewCredential}
                                  </Button>
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mobile - accordion */}
        <Collapsible
          className="md:hidden"
          open={mobileSections.certifications}
          onOpenChange={() => toggleMobileSection('certifications')}
        >
          <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                    {currentContent.certificationsTitle}
                  </div>
                  {mobileSections.certifications ? (
                    <ChevronUp className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {Object.entries(certificationsByCategory).map(([category, certs]) => (
                  <div key={category} className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                    <div className="pl-8">
                      <Collapsible
                        open={expandedCertGroups[category]}
                        onOpenChange={() => toggleCertGroup(category)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl border border-border/50">
                            <div className="flex items-center gap-2">
                              {getProviderIcon(category) ? (
                                <img 
                                  src={getProviderIcon(category)} 
                                  alt={category} 
                                  className="h-10 object-contain"
                                />
                              ) : (
                                <>
                                  <Trophy className="w-4 h-4 text-yellow-600" />
                                  <h3 className="text-sm font-bold text-foreground">
                                    {category}
                                  </h3>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-primary">
                              <span className="text-xs text-muted-foreground">
                                {certs.length} certificado{certs.length !== 1 ? 's' : ''}
                              </span>
                              {expandedCertGroups[category] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-3 space-y-3">
                          {certs.map((cert) => (
                             <div key={cert.name} className="bg-gradient-to-br from-card to-accent/5 rounded-xl border border-border/30 p-4 ml-4">
                               <div className="space-y-2">
                                 <div className="flex items-center gap-2">
                                   {cert.icon ? (
                                     <img 
                                       src={cert.icon} 
                                       alt={`${cert.name} badge`} 
                                       className="w-10 h-10 flex-shrink-0 object-contain"
                                     />
                                   ) : (
                                     <Medal className="w-10 h-10 text-primary flex-shrink-0" />
                                   )}
                                   <h4 className="font-bold text-foreground text-xs">
                                     {cert.name}
                                   </h4>
                                 </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {cert.level}
                                  </Badge>
                                  <span className="text-muted-foreground text-xs">•</span>
                                  <span className="text-muted-foreground text-xs">{cert.date}</span>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-foreground text-xs leading-relaxed">
                                    {expandedDescriptions[cert.name] 
                                      ? cert.description 
                                      : truncateText(cert.description, 80)
                                    }
                                  </p>
                                  {cert.description.length > 80 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleDescription(cert.name)}
                                      className="text-primary hover:text-primary/80 p-0 h-auto font-medium text-xs"
                                    >
                                      {expandedDescriptions[cert.name] ? 'Ver menos' : 'Ver mais'}
                                    </Button>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-muted-foreground">
                                    <p><span className="font-semibold">{currentContent.validUntil}:</span> {cert.validity}</p>
                                  </div>
                                  {cert.link && cert.link !== '#' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(cert.link, '_blank');
                                      }}
                                      className="flex items-center gap-1 text-xs px-2 py-1 h-auto"
                                    >
                                      <ExternalLink className="h-2 w-2" />
                                      {currentContent.viewCredential}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </section>

      {/* Skills Section */}
      <section id="habilidades">
        {/* Desktop */}
        <Card className="hidden md:block w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              {currentContent.skillsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentContent.skills.map((skillCategory, index) => {
              const IconComponent = getSkillIcon(skillCategory.title);
              const iconColor = getSkillIconColor(skillCategory.title);
              return (
                <div key={index} className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                  <div className="pl-8">
                    <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-6 border border-border/50">
                      <div className="flex items-center gap-3 mb-4">
                        <IconComponent className={`w-6 h-6 ${iconColor}`} />
                        <h3 className="text-base md:text-xl font-bold text-foreground">
                          {skillCategory.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skillCategory.skills.map((skill, skillIndex) => (
                          <Badge 
                            key={skillIndex} 
                            variant="secondary" 
                            className="text-foreground bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Mobile - accordion */}
        <Collapsible
          className="md:hidden"
          open={mobileSections.skills}
          onOpenChange={() => toggleMobileSection('skills')}
        >
          <Card className="w-full shadow-medium border-0 bg-card hover:shadow-large transition-all duration-300">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg md:text-2xl font-bold text-foreground flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                    {currentContent.skillsTitle}
                  </div>
                  {mobileSections.skills ? (
                    <ChevronUp className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {currentContent.skills.map((skillCategory, index) => {
                  const IconComponent = getSkillIcon(skillCategory.title);
                  const iconColor = getSkillIconColor(skillCategory.title);
                  return (
                    <div key={index} className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                      <div className="pl-8">
                        <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-4 border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <IconComponent className={`w-4 h-4 ${iconColor}`} />
                            <h3 className="text-sm font-bold text-foreground">
                              {skillCategory.title}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {skillCategory.skills.map((skill, skillIndex) => (
                              <Badge 
                                key={skillIndex} 
                                variant="secondary" 
                                className="text-xs text-foreground bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </section>
    </div>
  );
};