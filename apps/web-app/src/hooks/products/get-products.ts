import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
  stock_quantity: number;
  sku: string;
  category: {
    name: string;
    id: string;
  };
}

export function useGetProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get<Product[]>("/products");
      return { products: data }; 
    },
    staleTime: 1000 * 60 * 5,
  });
}