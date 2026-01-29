import { AuthLayout } from "@/components/templates/auth-layout";
import { RegisterForm } from "@/components/organisms/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Crie sua conta" 
      description="Preencha os dados abaixo para começar sua jornada multi-tenant"
    >
      <RegisterForm />
    </AuthLayout>
  );
}