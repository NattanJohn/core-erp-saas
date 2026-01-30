import { TableCell, TableRow } from "@/components/ui/table";

interface ProductRowProps {
  name: string;
  stock: number;
  price: number;
}

export function ProductRow({ name, stock, price }: ProductRowProps) {
  return (
    <TableRow className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
      <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
        {name}
      </TableCell>
      <TableCell className="text-zinc-500">
        {stock} un
      </TableCell>
      <TableCell className="text-right font-semibold">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
      </TableCell>
    </TableRow>
  );
}