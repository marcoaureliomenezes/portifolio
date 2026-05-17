import { MapPin, Mail } from "lucide-react";
import type { SupportedLanguages, HeaderInfo } from "@/types/content";
import { LanguageSelector } from "./LanguageSelector";
import { ContactStrip } from "./ContactStrip";
import { AvatarImageModal } from "./AvatarImageModal";
import { EmailModal } from "./EmailModal";
import { ThemeToggle } from "./ThemeToggle";

type ScrollState = "full" | "intermediate" | "compact";

interface HeaderMobileLayoutProps {
  name: string;
  email: string;
  avatarUrl: string;
  language: SupportedLanguages;
  onLanguageChange: (language: SupportedLanguages) => void;
  headerInfo: HeaderInfo;
  scrollState: ScrollState;
  viewLarger: string;
}

function EmailTriggerMobile({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1 text-header-link hover:text-header-text transition-colors">
      <Mail className="w-3 h-3" />
      <span>{label}</span>
    </button>
  );
}

export function HeaderMobileLayout({
  name,
  email,
  avatarUrl,
  language,
  onLanguageChange,
  headerInfo,
  scrollState,
  viewLarger,
}: HeaderMobileLayoutProps) {
  if (scrollState === "full") {
    const avatarTrigger = (
      <button className="group relative">
        <img
          src={avatarUrl}
          alt={`Foto de ${name}`}
          className="w-20 h-20 rounded-full object-cover object-top border-2 border-header-text/20 transition-all duration-300 group-hover:border-header-text/40 cursor-pointer"
        />
        <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white text-xs">{viewLarger}</span>
        </div>
      </button>
    );

    return (
      <div className="block md:hidden relative">
        <div className="absolute top-2 right-0 z-10 flex items-center gap-1">
          <ThemeToggle />
          <LanguageSelector
            language={language}
            onLanguageChange={onLanguageChange}
            compact
          />
        </div>
        <div className="flex flex-col items-center text-center space-y-3 py-4 min-h-[240px] transition-all duration-300">
          <AvatarImageModal avatarUrl={avatarUrl} name={name} trigger={avatarTrigger} />
          <div className="space-y-1 w-full px-2">
            <h1 className="text-lg font-bold text-header-text break-words">{name}</h1>
            <p className="text-sm text-header-text-muted break-words leading-snug">{headerInfo.title}</p>
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-header-text-muted">
            <MapPin className="w-4 h-4" />
            <span>{headerInfo.location}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs flex-shrink-0 whitespace-nowrap">
            <EmailModal
              email={email}
              trigger={<EmailTriggerMobile label={headerInfo.viewEmail} />}
            />
            <span className="text-header-text-muted">|</span>
            <ContactStrip language={language} />
          </div>
        </div>
      </div>
    );
  }

  if (scrollState === "intermediate") {
    return (
      <div className="block md:hidden relative">
        <div className="absolute top-2 right-0 z-10 flex items-center gap-1">
          <ThemeToggle />
          <LanguageSelector
            language={language}
            onLanguageChange={onLanguageChange}
            compact
          />
        </div>
        <div className="flex flex-col items-center text-center space-y-3 py-3 transition-all duration-300">
          <div className="space-y-1 w-full px-2">
            <h1 className="text-base font-bold text-header-text break-words">{name}</h1>
            <p className="text-xs text-header-text-muted break-words leading-snug">{headerInfo.title}</p>
          </div>
          <div className="flex items-center justify-center gap-1 text-xs flex-shrink-0 whitespace-nowrap">
            <EmailModal
              email={email}
              trigger={<EmailTriggerMobile label={headerInfo.viewEmail} />}
            />
            <span className="text-header-text-muted">|</span>
            <ContactStrip language={language} />
          </div>
        </div>
      </div>
    );
  }

  // compact
  return (
    <div className="block md:hidden relative pt-9">
      <div className="flex flex-col space-y-2 pb-3 transition-all duration-300">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-sm font-bold text-header-text truncate min-w-0">{name}</h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSelector
              language={language}
              onLanguageChange={onLanguageChange}
              compact
            />
          </div>
        </div>
        <div className="flex">
          <p className="text-xs text-header-text-muted break-words">{headerInfo.title}</p>
        </div>
        <div className="flex items-center gap-1 text-xs flex-shrink-0 whitespace-nowrap">
          <EmailModal
            email={email}
            trigger={<EmailTriggerMobile label={headerInfo.viewEmail} />}
          />
          <span className="text-header-text-muted">|</span>
          <ContactStrip language={language} />
        </div>
      </div>
    </div>
  );
}
