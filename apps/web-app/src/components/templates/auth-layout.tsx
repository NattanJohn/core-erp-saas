import { LockKeyhole } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-screen flex flex-col lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-zinc-950 p-12 flex-col justify-between text-white">
        <div className="flex items-center text-xl font-bold tracking-tight">
          <LockKeyhole className="mr-3 h-6 w-6" /> CoreERP
        </div>
        
        <div>
          <blockquote className="space-y-2">
            <p className="text-2xl font-light italic text-zinc-300">
              &ldquo;Gestão multi-tenant simplificada.&rdquo;
            </p>
            <footer className="text-sm font-medium text-zinc-500 underline decoration-zinc-700 underline-offset-4">
              Nattan Jhon
            </footer>
          </blockquote>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-87.5 space-y-8">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              {title}
            </h1>
            <p className="text-base text-zinc-500">
              {description}
            </p>
          </div>
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}