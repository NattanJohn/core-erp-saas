import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_HASURA_URL!;

export const getGraphQLClient = (token?: string) => {
  return new GraphQLClient(endpoint, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Para desenvolvimento, você pode usar a admin-secret se quiser pular o JWT por enquanto
      // 'x-hasura-admin-secret': 'sua-secret-aqui',
    },
  });
};