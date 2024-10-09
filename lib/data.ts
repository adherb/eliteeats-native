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

  return useQuery({
    queryKey: ["restaurants", cuisine, tag, sortBy, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cuisine) params.append("cuisine", cuisine);
      if (tag) params.append("tag", tag);
      if (sortBy) params.append("sortBy", sortBy);
      if (limit) params.append("limit", limit.toString());

      const url = `https://eliteeats.io/api/restaurants?${params.toString()}`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            `API error: ${response.status} ${response.statusText}${
              errorData ? ` - ${JSON.stringify(errorData)}` : ""
            }`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            `Invalid data format: expected an array, got ${typeof data}`
          );
        }

        return data as Restaurant[];
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        throw error;
      }
    },
  });
};

export { useRestaurants };
