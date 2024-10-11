import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Link, Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useRestaurant } from "../../lib/data";
import { Ionicons } from "@expo/vector-icons";

interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface Restaurant {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  image_url: string;
  price_level: number;
  price_range: string;
  opening_time: string;
  closing_time: string;
  cuisine_types: string[];
  features: string[];
  reviews: Review[];
}

const RestaurantPage = () => {
  const { id } = useLocalSearchParams();
  const { data: restaurant, isLoading, error } = useRestaurant(id as string);
  const router = useRouter();

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  const renderRestaurantDetails = (item: Restaurant) => (
    <View className="bg-white rounded-lg shadow-md overflow-hidden">
      <Image
        source={item.image_url}
        style={{ width: "100%", height: 220 }}
        contentFit="cover"
        transition={1000}
        placeholder={blurhash}
      />
      <View className="p-4">
        <Text className="text-xl font-bold mb-2">{item.name}</Text>
        <View className="flex-row flex-wrap mb-2">
          {item.cuisine_types.map((cuisine, index) => (
            <View
              key={index}
              className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2"
            >
              <Text className="text-sm text-gray-700">{cuisine}</Text>
            </View>
          ))}
        </View>
        <Text className="text-gray-700 mb-2">{item.address}</Text>
        <Text className="text-gray-700 mb-2">
          Open: {item.opening_time} - {item.closing_time}
        </Text>
        {/* <Text className="text-gray-700 mb-2">
          Features: {item.features.join(", ")}
        </Text> */}
        <Text className="text-xl font-bold mt-6 mb-4">Reviews</Text>
        {item.reviews.map((review) => (
          <View key={review.id} className="mb-4 bg-gray-100 p-4 rounded-lg">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-bold text-lg">{review.author}</Text>
              <View className="flex-row items-center px-2 py-1 rounded-full">
                <Text className="font-bold mr-1">{review.rating}</Text>
                <Ionicons name="star" size={16} color="#FFD700" />
              </View>
            </View>
            <Text className="text-gray-700 mb-2">{review.text}</Text>
            <Text className="text-gray-500 text-sm">
              {new Date(review.date).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className="ml-4 rounded-full bg-white/50 p-2"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
          ),
          headerTitle: "",
        }}
      />
      {isLoading ? (
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="gray" />
          <Text className="mt-4 text-gray-600">
            Loading restaurant details...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center bg-white">
          <Text className="text-center text-lg text-red-500 p-4">
            Error: {error.message}
          </Text>
        </View>
      ) : restaurant ? (
        <ScrollView className="flex-1 bg-white">
          {renderRestaurantDetails(restaurant)}
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center bg-white">
          <Text className="text-center text-lg p-4">
            No restaurant data found
          </Text>
        </View>
      )}
    </>
  );
};

export default RestaurantPage;
