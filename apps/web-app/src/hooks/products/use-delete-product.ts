import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { getGraphQLClient } from "@/lib/graphql-client";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const SOFT_DELETE_PRODUCT = gql`
  mutation SoftDeleteProduct($id: uuid!, $deletedAt: timestamp!) { # Remova o 'tz' do final
    update_products_by_pk(
      pk_columns: { id: $id }, 
      _set: { deletedAt: $deletedAt }
    ) {
      id
    }
  }
`;

export function useDeleteProduct() {
  const { token, user } = useAuthStore();
  const client = getGraphQLClient(token ?? undefined);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => 
      client.request(SOFT_DELETE_PRODUCT, { 
        id, 
        deletedAt: new Date().toISOString() 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", user?.tenant?.id] });
      toast.success("Produto removido com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover produto.");
    }
  });
}