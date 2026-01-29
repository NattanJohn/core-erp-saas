"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/auth/login", { email, password });
      return data;
    },
    onSuccess: (data) => {
      // 1. Salva o token nos cookies para o Middleware
      Cookies.set("auth-token", data.access_token, { expires: 7 });
      
      // 2. Salva o usuário completo (com tenant) no Zustand
      setAuth(data.user, data.access_token);
      
      toast.success("Bem-vindo de volta!");

      // 3. Redirecionamento Dinâmico (Note as crases ` `)
      const userSlug = data.user.tenant?.slug;
      
      if (userSlug) {
        router.push(`/${userSlug}/dashboard`);
      } else {
        // Fallback caso o slug não venha por algum motivo
        router.push("/dashboard"); 
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro no login");
    },
  });

  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); mutate(); }} 
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="nome@empresa.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={isPending} 
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
        </div>
        <Input 
          id="password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          disabled={isPending} 
          required
        />
      </div>
      <Button 
        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white" 
        type="submit" 
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Autenticando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}