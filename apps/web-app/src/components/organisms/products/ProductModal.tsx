"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { useGetCategories } from "@/hooks/categories/get-categories";
import { useCreateProduct } from "@/hooks/products/create-product";
import { useUpdateProduct } from "@/hooks/products/update-product";
import { Textarea } from "@/components/ui/textarea";

// 1. Tipagem para o formulário
interface ProductFormValues {
  name: string;
  sku: string | null;
  description: string;
  price: number;
  stock_quantity: number;
  categoryId: string;
}

// 2. Tipagem para o produto que vem da listagem (prop)
interface Product {
  id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  price: number;
  stock_quantity: number;
  categoryId: string;
}

interface ProductModalProps {
  product?: Product;
}

export function ProductModal({ product }: ProductModalProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!product;

  const { data: categoriesData } = useGetCategories();
  const { mutate: create, isPending: creating } = useCreateProduct();
  const { mutate: update, isPending: updating } = useUpdateProduct();
  const { register, handleSubmit, reset, setValue } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      categoryId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit && product) {
        reset({
          name: product.name,
          sku: product.sku || "",
          description: product.description || "",
          price: product.price,
          stock_quantity: product.stock_quantity,
          categoryId: product.categoryId,
        });
      } else {
        reset({ name: "", sku: "", description: "", price: 0, stock_quantity: 0, categoryId: "" });
      }
    }
  }, [open, isEdit, product, reset]);

  // Tipando o onSubmit
  const onSubmit = (data: ProductFormValues) => {
    const payload = { 
      ...data, 
      sku: data.sku?.trim() === "" ? null : data.sku 
    };

    if (isEdit && product) {
      update(
        { id: product.id, ...payload }, 
        { onSuccess: () => setOpen(false) }
      );
    } else {
      create(payload, {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Editar Produto: ${product?.name}` : "Cadastrar Novo Produto"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Produto</Label>
              <Input {...register("name", { required: "Nome é obrigatório" })} />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input {...register("sku")} placeholder="Opcional" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea {...register("description")} placeholder="Detalhes do produto..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Preço (R$)</Label>
              <Input 
                type="number" 
                step="0.01" 
                {...register("price", { valueAsNumber: true, min: 0 })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Estoque</Label>
              <Input 
                type="number" 
                {...register("stock_quantity", { valueAsNumber: true, min: 0 })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              {/* Note que no Select do Shadcn o value deve ser controlado para resetar/editar corretamente */}
              <Select 
                onValueChange={(v) => setValue("categoryId", v)}
                defaultValue={product?.categoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData?.categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={creating || updating}>
            {creating || updating ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              isEdit ? "Salvar Alterações" : "Criar Produto"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}