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
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center">Contato por Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-mono">{email}</span>
              <button
                onClick={handleCopy}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
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

          <Button
            onClick={handleSend}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enviar Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
