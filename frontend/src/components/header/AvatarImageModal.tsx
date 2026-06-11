import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AvatarImageModalProps {
  avatarUrl: string;
  name: string;
  trigger: React.ReactNode;
}

export function AvatarImageModal({ avatarUrl, name, trigger }: AvatarImageModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-lg bg-transparent border-none shadow-none p-0"
        aria-modal="true"
        aria-describedby={undefined}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{`Foto de ${name}`}</DialogTitle>
        </DialogHeader>
        <img
          src={avatarUrl}
          alt={`Foto de ${name}`}
          loading="lazy"
          decoding="async"
          className="w-full h-auto rounded-lg object-cover object-top shadow-2xl"
        />
      </DialogContent>
    </Dialog>
  );
}
