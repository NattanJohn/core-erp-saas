"use client";

import { useProducts } from "@/hooks/products/use-products";
import { ProductModal } from "./ProductModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteProductAction } from "@/components/molecules/products/DeleteProductAction";

export function ProductTable() {
  const { data, isLoading, error } = useProducts();

  if (isLoading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-destructive">Erro ao carregar produtos.</div>
    );

  return (
    <div className="rounded-md border bg-white dark:bg-zinc-950 shadow-sm">
      <Table>
        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="w-25 text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-zinc-500">
                {product.sku || "-"}
              </TableCell>
              <TableCell>{product.stock_quantity} un</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(product.price)}
              </TableCell>
              <TableCell className="flex items-center justify-center gap-2">
                <ProductModal product={product} />
                <DeleteProductAction
                  productId={product.id}
                  productName={product.name}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
