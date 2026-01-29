import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { getGraphQLClient } from "@/lib/graphql-client";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

interface UpdateProductInput {
  id: string;
  name?: string;
  sku?: string | null;
  description?: string;
  price?: number;
  stock_quantity?: number;
  categoryId?: string;
}

interface GraphQLErrorResponse {
  response?: {
    errors?: Array<{
      message: string;
    }>;
  };
}

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: uuid!, $object: products_set_input!) {
    update_products_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
  }
`;

export function useUpdateProduct() {
  const { token, user } = useAuthStore();
  const client = getGraphQLClient(token ?? undefined);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateProductInput) => 
      client.request(UPDATE_PRODUCT, { id, object: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", user?.tenant?.id] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error: GraphQLErrorResponse) => {
      const msg = error.response?.errors?.[0]?.message || "";
      if (msg.includes("unique constraint") || msg.includes("Uniqueness violation")) {
        toast.error("Erro: Este SKU já está em uso.");
      } else {
        toast.error("Erro ao atualizar produto.");
      }
    }
  });
}