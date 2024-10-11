import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { Image } from "expo-image";
import { useRestaurant } from "../../lib/data";

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
  const { data: restaurant, isLoading, error } = useRestaurant(id as string);

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
      {isLoading ? (
        <Text className="text-center text-lg">
          Loading restaurant details...
        </Text>
      ) : error ? (
        <Text className="text-center text-lg text-red-500">
          Error: {error.message}
        </Text>
      ) : restaurant ? (
        renderRestaurantCard(restaurant)
      ) : (
        <Text className="text-center text-lg">No restaurant data found</Text>
      )}
    </ScrollView>
  );
};

export default RestaurantPage;
