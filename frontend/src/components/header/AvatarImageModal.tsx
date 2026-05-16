import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useContent } from "@/hooks/useContent";

interface AvatarImageModalProps {
  avatarUrl: string;
  name: string;
  trigger: React.ReactNode;
}

export function AvatarImageModal({ avatarUrl, name, trigger }: AvatarImageModalProps) {
  const { content } = useContent();
  const photoAltText = (content.photoAlt ?? "Foto de {name}").replace("{name}", name);
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-lg bg-transparent border-none shadow-none p-0"
        aria-modal="true"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{photoAltText}</DialogTitle>
        </DialogHeader>
        <img
          src={avatarUrl}
          alt={photoAltText}
          loading="lazy"
          decoding="async"
          className="w-full h-auto rounded-lg object-cover object-top shadow-2xl"
        />
      </DialogContent>
    </Dialog>
  );
}
