"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    slug: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // Aqui batemos na rota de registro do seu NestJS
      const { data } = await api.post("/auth/register", formData);
      return data;
    },
    onSuccess: () => {
      toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar conta");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [id]: value };
      // Auto-gerar slug a partir do companyName
      if (id === "companyName") {
        newData.slug = value
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, "");
      }
      return newData;
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutate(); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Seu Nome</Label>
          <Input id="name" placeholder="John Doe" onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="john@example.com" onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">Nome da Empresa</Label>
        <Input id="companyName" placeholder="Minha Empresa LTDA" onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL da Empresa (slug)</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">app.core/</span>
          <Input id="slug" className="pl-20" value={formData.slug} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" placeholder="••••••••" onChange={handleChange} required />
      </div>

      <Button className="w-full bg-zinc-900" type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Empresa"}
      </Button>
    </form>
  );
}