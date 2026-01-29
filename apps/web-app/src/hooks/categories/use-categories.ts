import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { getGraphQLClient } from "@/lib/graphql-client";
import { useAuthStore } from "@/store/useAuthStore";

const GET_CATEGORIES = gql`
  query GetCategories($tenantId: uuid!) {
    categories(where: { tenantId: { _eq: $tenantId } }) {
      id
      name
    }
  }
`;

export function useCategories() {
  const { user, token } = useAuthStore();
  const client = getGraphQLClient(token ?? undefined);
  const tenantId = user?.tenant?.id;

  const query = useQuery({
    queryKey: ["categories", tenantId],
    queryFn: async () => 
      client.request<{ categories: { id: string; name: string }[] }>(GET_CATEGORIES, { tenantId }),
    enabled: !!tenantId && !!token,
  });

  // ADICIONE ISSO AQUI:
  console.log("Categorias do Hasura:", query.data?.categories);

  return query;
}