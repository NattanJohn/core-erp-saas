// ProductTableStates.tsx
import { PackageOpen, FilterX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductModal } from "./ProductModal";

interface EmptyStateProps {
  isFiltering: boolean;
}

export function EmptyState({ isFiltering }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {isFiltering ? (
        <>
          <FilterX className="h-12 w-12 text-zinc-300 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Nenhum resultado</h3>
          <p className="text-sm text-zinc-500">Tente mudar os filtros ou limpar a busca.</p>
        </>
      ) : (
        <>
          <PackageOpen className="h-12 w-12 text-zinc-300 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Sua vitrine está vazia</h3>
          <p className="text-sm text-zinc-500 max-w-xs mb-6">
            Você ainda não possui produtos cadastrados. Comece adicionando seu primeiro item.
          </p>
          <ProductModal />
        </>
      )}
    </div>
  );
}

export function ProductTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex gap-2 flex-1 max-w-2xl">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-50" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded-md">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b last:border-0">
            <Skeleton className="h-4 w-62.5" />
            <Skeleton className="h-4 w-25" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}