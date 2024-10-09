import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Restaurant } from "./types";

interface UseRestaurantsOptions {
  lat?: number;
  lon?: number;
  radius?: number;
  cuisines?: string;
  tags?: string;
  sortBy?: "distance" | "rating";
  limit?: number;
}

const useRestaurants = (
  options: UseRestaurantsOptions = {}
): UseQueryResult<Restaurant[], Error> => {
  const { lat, lon, radius, cuisines, tags, sortBy, limit } = options;

  return useQuery({
    queryKey: ["restaurants", lat, lon, radius, cuisines, tags, sortBy, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (lat) params.append("lat", lat.toString());
      if (lon) params.append("lon", lon.toString());
      if (radius) params.append("radius", radius.toString());
      if (cuisines) params.append("cuisines", cuisines);
      if (tags) params.append("tags", tags);
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
    enabled: !!lat && !!lon && !!radius, // Only run the query when we have lat, lon, and radius
  });
};

export { useRestaurants };
