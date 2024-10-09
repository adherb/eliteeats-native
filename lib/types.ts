export interface Restaurant {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  image: string;
  distance: number;
  price_rating: string;
  opens_at: string;
  closes_at: string;
  cuisine: string[];
  tags: string[];
  reviews: Array<{
    id: number;
    author: string;
    rating: number;
    text: string;
  }>;
}
