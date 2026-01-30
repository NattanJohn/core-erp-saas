import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & any) => {
      const response = await api.patch(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto e estoque atualizados!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao atualizar produto.";
      toast.error(message);
    },
  });
}