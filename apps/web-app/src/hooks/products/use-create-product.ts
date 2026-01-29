// hooks/use-create-product.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { getGraphQLClient } from "@/lib/graphql-client";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

interface CreateProductInput {
  name: string;
  sku: string | null;
  description: string;
  price: number;
  stock_quantity: number;
  categoryId: string;
}

interface GraphQLErrorResponse {
  response?: {
    errors?: Array<{
      message: string;
      extensions?: {
        code: string;
      };
    }>;
  };
}

const CREATE_PRODUCT = gql`
  mutation CreateProduct($object: products_insert_input!) {
    insert_products_one(object: $object) {
      id
      name
    }
  }
`;

export function useCreateProduct() {
  const { user, token } = useAuthStore();
  const client = getGraphQLClient(token ?? undefined);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProduct: CreateProductInput) => {
      return client.request(CREATE_PRODUCT, {
        object: {
          ...newProduct,
          tenantId: user?.tenant?.id,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", user?.tenant?.id],
      });
      toast.success("Produto criado com sucesso!");
    },
    onError: (error: GraphQLErrorResponse) => { // <--- Tipado aqui!
      const serverMessage = error.response?.errors?.[0]?.message || "";

      if (
        serverMessage.includes("unique constraint") ||
        serverMessage.includes("Uniqueness violation")
      ) {
        toast.error("O SKU informado já está em uso. Escolha um código único.");
      } else {
        toast.error("Erro ao salvar o produto. Tente novamente.");
      }
    },
  });
}