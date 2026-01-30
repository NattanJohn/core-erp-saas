import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Category {
  id: string;
  name: string;
}

export function useGetCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Category[]>("/categories");
      return { categories: data };
    },
    staleTime: 1000 * 60 * 10,
  });
}