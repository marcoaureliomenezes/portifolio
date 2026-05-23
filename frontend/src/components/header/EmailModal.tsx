import { useState } from "react";
import { Mail, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EmailModalProps {
  email: string;
  trigger: React.ReactNode;
}

export function EmailModal({ email, trigger }: EmailModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available — silent fail
    }
  };

  const handleSend = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md" aria-modal="true">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-full mx-auto mb-2">
            <Mail className="w-6 h-6 text-accent-foreground" />
          </div>
          <DialogTitle className="text-center text-foreground">
            Contato por Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground font-mono">{email}</span>
              <button
                onClick={handleCopy}
                className="ml-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Copiar email"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button onClick={handleSend} className="w-full">
            Enviar Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
