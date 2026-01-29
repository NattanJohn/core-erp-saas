import { AuthLayout } from "@/components/templates/auth-layout";
import { LoginForm } from "@/components/organisms/auth/login-form";

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Acesse sua conta" 
      description="Digite suas credenciais para entrar no sistema"
    >
      <LoginForm />
    </AuthLayout>
  );
}