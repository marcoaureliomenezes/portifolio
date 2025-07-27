import { useState, useEffect } from "react";
import { Mail, MapPin, Github, Linkedin, X, Copy, Check, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getContent, SupportedLanguages } from "@/data/content";
import profileAvatar from "@/assets/profile.png";

interface HeaderProps {
  name?: string;
  email?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  avatarUrl?: string;
  language?: string;
  onLanguageChange?: (language: string) => void;
}

export const Header = ({
  name = "Marco Aurelio Menezes",
  email = "marcoaureliorelislima@gmail.com",
  linkedinUrl = "https://linkedin.com",
  githubUrl = "https://github.com",
  avatarUrl = profileAvatar,
  language = "Português",
  onLanguageChange,
}: HeaderProps) => {
  const [scrollState, setScrollState] = useState<'full' | 'intermediate' | 'compact'>('full');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Busca o conteúdo baseado no idioma selecionado
  const currentContent = getContent(language as SupportedLanguages);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      
      // Estados progressivos baseados no scroll - mobile nunca fica completamente colapsado
      if (scrollTop === 0) {
        setScrollState('full');
      } else if (scrollTop < 100) {
        setScrollState('intermediate');
      } else {
        setScrollState('compact');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEmailCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar email:', err);
    }
  };

  const handleSendEmail = () => {
    window.location.href = `mailto:${email}`;
  };

  const handleDownloadResume = () => {
    const resumeUrl = language === "Português" ? "/curriculo-marco-aurelio.pdf" : 
                      language === "English" ? "/resume-marco-aurelio.pdf" : 
                      "/lebenslauf-marco-aurelio.pdf";
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = language === "Português" ? "Curriculo-Marco-Aurelio-Menezes.pdf" : 
                    language === "English" ? "Resume-Marco-Aurelio-Menezes.pdf" : 
                    "Lebenslauf-Marco-Aurelio-Menezes.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-b from-slate-900 to-slate-800 text-header-text w-full z-30 transition-all duration-300 shadow-lg border-b border-slate-700/30">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 transition-all duration-300">
        
        {/* Layout Mobile */}
        <div className="block md:hidden">
          {scrollState === 'full' ? (
            /* Layout Mobile Completo */
            <div className="relative">
              {/* Seletor de idioma no canto superior direito mobile */}
              <div className="absolute top-2 right-0 z-10">
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger className="w-16 h-6 bg-transparent border-header-text/30 text-header-text hover:bg-header-text/10 text-xs px-1">
                    <SelectValue>
                      {language === "Português" ? "PT" : language === "English" ? "EN" : "DE"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-header-bg border-header-text/30 z-50">
                    <SelectItem value="Português" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10 text-xs">
                      Português
                    </SelectItem>
                    <SelectItem value="English" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10 text-xs">
                      English
                    </SelectItem>
                    <SelectItem value="Deutsch" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10 text-xs">
                      Deutsch
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 py-4 min-h-[240px] transition-all duration-300">
                {/* Avatar */}
                <button
                  onClick={() => setIsImageModalOpen(true)}
                  className="group relative"
                >
                  <img
                    src={avatarUrl}
                    alt={`Foto de ${name}`}
                    className="w-20 h-20 rounded-full object-cover object-top border-2 border-header-text/20 transition-all duration-300 group-hover:border-header-text/40 cursor-pointer"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xs">Ver maior</span>
                  </div>
                </button>
                
                {/* Nome e título */}
                <div className="space-y-1">
                  <h1 className="text-lg font-bold text-header-text whitespace-nowrap">
                    {name}
                  </h1>
                  <p className="text-sm text-header-text-muted whitespace-nowrap">
                    {currentContent.header.title}
                  </p>
                </div>
                
                {/* Localização centralizada */}
                <div className="flex items-center justify-center gap-1 text-sm text-header-text-muted">
                  <MapPin className="w-4 h-4" />
                  <span>{currentContent.header.location}</span>
                </div>
                
                {/* Linha de contatos */}
                <div className="flex items-center justify-center gap-2 text-xs flex-shrink-0 whitespace-nowrap">
                  <button 
                    onClick={() => setIsEmailModalOpen(true)}
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{currentContent.header.viewEmail}</span>
                  </button>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <a 
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>LinkedIn</span>
                  </a>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <a 
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    <span>GitHub</span>
                  </a>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <button 
                    onClick={handleDownloadResume}
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>{language === "Português" ? "Currículo" : language === "English" ? "Resume" : "Lebenslauf"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : scrollState === 'intermediate' ? (
            /* Layout Mobile Intermediário */
            <div className="relative">
              {/* Seletor de idioma no canto superior direito mobile */}
              <div className="absolute top-2 right-0 z-10">
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger className="w-16 h-6 bg-transparent border-header-text/30 text-header-text hover:bg-header-text/10 text-xs px-1">
                    <SelectValue>
                      {language === "Português" ? "PT" : language === "English" ? "EN" : "DE"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-header-bg border-header-text/30 z-50">
                    <SelectItem value="Português" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10 text-xs">
                      Português
                    </SelectItem>
                    <SelectItem value="English" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10 text-xs">
                      English
                    </SelectItem>
                    <SelectItem value="Deutsch" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10 text-xs">
                      Deutsch
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 py-3 transition-all duration-300">
                {/* Nome e título */}
                <div className="space-y-1">
                  <h1 className="text-base font-bold text-header-text whitespace-nowrap">
                    {name}
                  </h1>
                  <p className="text-xs text-header-text-muted whitespace-nowrap">
                    {currentContent.header.title}
                  </p>
                </div>
                
                {/* Linha de contatos */}
                <div className="flex items-center justify-center gap-1 text-xs flex-shrink-0 whitespace-nowrap">
                  <button 
                    onClick={() => setIsEmailModalOpen(true)}
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{currentContent.header.viewEmail}</span>
                  </button>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <a 
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>LinkedIn</span>
                  </a>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <a 
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    <span>GitHub</span>
                  </a>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <button 
                    onClick={handleDownloadResume}
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>{language === "Português" ? "Currículo" : language === "English" ? "Resume" : "Lebenslauf"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Layout Mobile Compacto (com scroll) */
            <div className="relative pt-9">
              <div className="flex flex-col space-y-2 pb-3 transition-all duration-300">
                {/* Linha 1: Nome com seletor de idioma */}
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-bold text-header-text whitespace-nowrap">
                    {name}
                  </h1>
                  <Select value={language} onValueChange={onLanguageChange}>
                    <SelectTrigger className="w-12 h-6 bg-transparent border-header-text/30 text-header-text hover:bg-header-text/10 text-xs px-1">
                      <SelectValue>
                        {language === "Português" ? "PT" : language === "English" ? "EN" : "DE"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-header-bg border-header-text/30 z-50">
                      <SelectItem value="Português" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10 text-xs">
                        Português
                      </SelectItem>
                      <SelectItem value="English" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10 text-xs">
                        English
                      </SelectItem>
                      <SelectItem value="Deutsch" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10 text-xs">
                        Deutsch
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Linha 2: Título */}
                <div className="flex">
                  <p className="text-xs text-header-text-muted whitespace-nowrap">
                    {currentContent.header.title}
                  </p>
                </div>
                
                {/* Linha 3: Contatos */}
                <div className="flex items-center gap-1 text-xs flex-shrink-0 whitespace-nowrap">
                  <button 
                    onClick={() => setIsEmailModalOpen(true)}
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{currentContent.header.viewEmail}</span>
                  </button>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <a 
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>LinkedIn</span>
                  </a>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <a 
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    <span>GitHub</span>
                  </a>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <button 
                    onClick={handleDownloadResume}
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>{language === "Português" ? "Currículo" : language === "English" ? "Resume" : "Lebenslauf"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layout Desktop */}
        <div className="hidden md:block relative">
          {/* Seletor de idioma no canto superior direito desktop */}
          <div className="absolute top-2 right-0 z-10">
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-28 h-8 bg-transparent border-header-text/30 text-header-text hover:bg-header-text/10 text-sm">
                <SelectValue placeholder="Idioma" />
              </SelectTrigger>
              <SelectContent className="bg-header-bg border-header-text/30 z-50">
                <SelectItem value="Português" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10">
                  Português
                </SelectItem>
                <SelectItem value="English" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10">
                  English
                </SelectItem>
                <SelectItem value="Deutsch" className="text-header-text hover:bg-header-text/10 focus:bg-header-text/10">
                  Deutsch
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Container para o conteúdo principal */}
          <div className="max-w-4xl mx-auto px-6 md:px-8 lg:px-12">
            <div className="flex items-center gap-8 py-2">
              {/* Avatar menor */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => setIsImageModalOpen(true)}
                  className="group relative"
                >
                  <img
                    src={avatarUrl}
                    alt={`Foto de ${name}`}
                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover object-top border-2 border-header-text/20 transition-all duration-300 group-hover:border-header-text/40 cursor-pointer"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-header-text text-xs">Ver maior</span>
                  </div>
                </button>
              </div>

              {/* Informações principais */}
              <div className="text-left space-y-1">
                <h1 className="text-xl lg:text-2xl font-bold text-header-text">
                  {name}
                </h1>
                
                <p className="text-sm lg:text-base text-header-text-muted">
                  {currentContent.header.title}
                </p>
                
                {/* Linha única com localização e contatos */}
                <div className="flex items-center gap-3 text-xs lg:text-sm flex-wrap">
                  <div className="flex items-center gap-1 text-header-text-muted whitespace-nowrap">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span>{currentContent.header.location}</span>
                  </div>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <button 
                    onClick={() => setIsEmailModalOpen(true)}
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors whitespace-nowrap"
                  >
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span>{currentContent.header.viewEmail}</span>
                  </button>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <a 
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors whitespace-nowrap"
                  >
                    <Linkedin className="w-3 h-3 flex-shrink-0" />
                    <span>LinkedIn</span>
                  </a>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <a 
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors whitespace-nowrap"
                  >
                    <Github className="w-3 h-3 flex-shrink-0" />
                    <span>GitHub</span>
                  </a>
                  
                  <span className="text-header-text-muted">|</span>
                  
                  <button 
                    onClick={handleDownloadResume}
                    className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors whitespace-nowrap"
                  >
                    <Download className="w-3 h-3 flex-shrink-0" />
                    <span>{language === "Português" ? "Currículo" : language === "English" ? "Resume" : "Lebenslauf"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para visualização da imagem */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={avatarUrl}
              alt={`Foto de ${name}`}
              className="w-full h-auto rounded-lg object-cover object-top shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Modal para contato por email */}
      {isEmailModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsEmailModalOpen(false)}
        >
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900">
                Contato por Email
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-mono">{email}</span>
                  <button
                    onClick={handleEmailCopy}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copiar email"
                  >
                    {emailCopied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <Button 
                onClick={handleSendEmail}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Enviar Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};