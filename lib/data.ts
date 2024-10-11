import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Restaurant } from "./types";

const API_BASE_URL = "https://eliteeats.io/api";

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
  console.log("useRestaurants called with:", {
    lat,
    lon,
    radius,
    cuisines,
    tags,
  });

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

      const url = `${API_BASE_URL}/restaurants?${params.toString()}`;

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

const useCuisines = (): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: ["cuisines"],
    queryFn: async () => {
      const url = `${API_BASE_URL}/cuisines`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error(
            `Invalid data format: expected an array, got ${typeof data}`
          );
        }
        return data as string[];
      } catch (error) {
        console.error("Error fetching cuisines:", error);
        throw error;
      }
    },
  });
};

const useTags = (): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const url = `${API_BASE_URL}/tags`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error(
            `Invalid data format: expected an array, got ${typeof data}`
          );
        }
        return data as string[];
      } catch (error) {
        console.error("Error fetching tags:", error);
        throw error;
      }
    },
  });
};

const useRestaurant = (id: string): UseQueryResult<Restaurant, Error> => {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const url = `${API_BASE_URL}/restaurants/${id}`;

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

        if (typeof data !== "object" || data === null) {
          throw new Error(
            `Invalid data format: expected an object, got ${typeof data}`
          );
        }

        return data as Restaurant;
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        throw error;
      }
    },
    enabled: !!id, // Only run the query when we have an id
  });
};

export { useRestaurants, useCuisines, useTags, useRestaurant };
