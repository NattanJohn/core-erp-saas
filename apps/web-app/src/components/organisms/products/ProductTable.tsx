"use client";

import { useState, useMemo } from "react";
import { useGetProducts } from "@/hooks/products/get-products";
import { useGetCategories } from "@/hooks/categories/get-categories";

import { ProductModal } from "./ProductModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFilters } from "@/components/molecules/products/ProductFilters";
import { EmptyState, ProductTableSkeleton } from "./ProductTableStates";
import { DeleteProductAction } from "@/components/molecules/products/DeleteProductAction";

export function ProductTable() {
  // Chamadas corrigidas para os novos hooks
  const { data, isLoading, error } = useGetProducts();
  const { data: categoriesData } = useGetCategories();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const products = data?.products ?? [];
  const isFiltering = search.length > 0 || selectedCategory !== "all";
  const hasNoProductsAtAll = products.length === 0 && !isLoading;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        (product.sku?.toLowerCase().includes(searchTerm) ?? false);

      // Verificação segura da categoria vinda do join do NestJS
      const matchesCategory =
        selectedCategory === "all" || product.category?.id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  if (isLoading) return <ProductTableSkeleton />;
  
  if (error) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-lg">
        <p className="text-destructive font-medium">Erro ao carregar produtos.</p>
        <p className="text-sm text-zinc-500">Verifique a conexão com a API NestJS.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <ProductFilters
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categoriesData?.categories}
        />
        
        {/* Só mostra o botão do topo se a base não estiver totalmente vazia */}
        {!hasNoProductsAtAll && <ProductModal />}
      </div>

      <div className="rounded-md border bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        {filteredProducts.length > 0 ? (
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="w-24 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-zinc-500 font-mono text-xs italic">
                    {product.sku || "-"}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.stock_quantity <= 5 
                        ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    }`}>
                      {product.stock_quantity} un
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <ProductModal
                        product={{
                          ...product,
                          categoryId: product.category?.id || "",
                        }}
                      />
                      <DeleteProductAction
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState isFiltering={isFiltering} />
        )}
      </div>
    </div>
  );
}