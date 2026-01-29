"use client";

import { AppLayout } from "@/components/templates/app-layout";
import { ProductTable } from "@/components/organisms/products/ProductTable";
import { ProductModal } from "@/components/organisms/products/ProductModal";


export default function ProductsPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o estoque e preços.</p>
        </div>
        <ProductModal />
      </div>

      <ProductTable />
    </AppLayout>
  );
}