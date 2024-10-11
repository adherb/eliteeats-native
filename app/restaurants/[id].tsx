import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { Image } from "expo-image";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
  description: string;
}

const RestaurantPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    // Mock data - replace this with actual data fetching logic
    const fetchedRestaurant: Restaurant = {
      id: "1",
      name: "Sample Restaurant",
      cuisine: "Italian",
      rating: 4.5,
      image: "https://example.com/sample-restaurant.jpg",
      description: "A cozy Italian restaurant with authentic cuisine.",
    };
    setRestaurant(fetchedRestaurant);
  }, [id]);

  const renderRestaurantCard = (item: Restaurant) => (
    <View className="bg-white rounded-lg shadow-md overflow-hidden">
      <Image
        source={item.image}
        className="w-full h-48 object-cover"
        contentFit="cover"
        transition={1000}
      />
      <View className="p-4">
        <Text className="text-xl font-bold mb-2">{item.name}</Text>
        <Text className="text-gray-600 mb-2">{item.cuisine}</Text>
        <Text className="text-yellow-500 mb-2">{item.rating} ⭐</Text>
        <Text className="text-gray-700">{item.description}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Link href="/restaurants" className="mb-4">
        <Text className="text-blue-500 text-lg">← Back to all restaurants</Text>
      </Link>
      {restaurant ? (
        renderRestaurantCard(restaurant)
      ) : (
        <Text className="text-center text-lg">
          Loading restaurant details...
        </Text>
      )}
    </ScrollView>
  );
};

export default RestaurantPage;
