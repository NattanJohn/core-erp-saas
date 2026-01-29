import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { getGraphQLClient } from "@/lib/graphql-client";
import { useAuthStore } from "@/store/useAuthStore";

// 1. Definimos o contrato do que vem do Hasura
export interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  sku: string;
  category: {
    name: string;
  };
}

interface GetProductsResponse {
  products: Product[];
}

const GET_PRODUCTS = gql`
  query GetProducts($tenantId: uuid!) {
    products(where: { 
      _and: [
        { tenantId: { _eq: $tenantId } },
        { deletedAt: { _is_null: true } }
      ]
    }) {
      id
      name
      sku
      price
      stock_quantity
      category {
        name
      }
    }
  }
`;

export function useProducts() {
  const { user, token } = useAuthStore();
  const client = getGraphQLClient(token ?? undefined);
  const tenantId = user?.tenant?.id;

  return useQuery({
  queryKey: ["products", tenantId],
  queryFn: async () =>
    client.request<GetProductsResponse>(GET_PRODUCTS, {
      tenantId: tenantId,
    }),
  enabled: !!tenantId && !!token,
  retry: false,
  staleTime: 1000 * 60 * 5,
  refetchOnWindowFocus: false,
});
}