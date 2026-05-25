import { createContext, useContext, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface ShopInfo {
  id: string;
  name: string;
  slug: string;
  phone: string;
  description: string | null;
}

interface ShopContextValue {
  shop: ShopInfo | null;
  isLoading: boolean;
  refetch: () => void;
}

const ShopContext = createContext<ShopContextValue>({
  shop: null,
  isLoading: false,
  refetch: () => {},
});

export function ShopProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, refetch } = trpc.shop.current.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <ShopContext.Provider value={{ shop: data ?? null, isLoading, refetch }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
