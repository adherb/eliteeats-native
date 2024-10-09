import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Restaurant } from "./types";

interface UseRestaurantsOptions {
  cuisine?: string;
  tag?: string;
  sortBy?: "distance" | "rating";
  limit?: number;
}

const useRestaurants = (
  options: UseRestaurantsOptions = {}
): UseQueryResult<Restaurant[], Error> => {
  const { cuisine, tag, sortBy, limit } = options;

  return useQuery<Restaurant[], Error>({
    queryKey: ["restaurants", cuisine, tag, sortBy, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cuisine) params.append("cuisine", cuisine);
      if (tag) params.append("tag", tag);
      if (sortBy) params.append("sortBy", sortBy);
      if (limit) params.append("limit", limit.toString());

      const response = await fetch(
        `https://staging.eliteeats.io/api/restaurants?${params}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });
};

export { useRestaurants };
