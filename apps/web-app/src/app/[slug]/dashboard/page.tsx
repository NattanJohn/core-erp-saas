import { AppLayout } from "@/components/templates/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// No Next.js 15, params é uma Promise
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <AppLayout>
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Dashboard: <span className="text-zinc-500 font-normal">{slug}</span>
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45.231,89</div>
              <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 h-100 rounded-xl bg-muted/50 p-4 border-2 border-dashed flex items-center justify-center">
          <p className="text-muted-foreground">
            Gráficos para o tenant <strong>{slug}</strong> virão aqui.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}