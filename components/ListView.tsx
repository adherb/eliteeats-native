import { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCustomColors } from "../lib/useCustomColours";
import { SafeAreaView } from "react-native-safe-area-context";
import { RestaurantList } from "../features/home/components/RestaurantList";
import { useRestaurantsQuery } from "../lib/api";
import { useSession } from "../AuthContext";

export function ListView({ setToggleView }) {
  const router = useRouter();
  const { iconColour } = useCustomColors();
  const { session } = useSession();
  const userId = session?.user?.id;
  // const { data, error, isLoading } = useRestaurantsQuery(userId);

  return (
    <>
      <View className="bg-white dark:bg-neutral-900 flex flex-1 pt-28">
        {/* <SafeAreaView
          style={{ position: "relative", top: 0, left: 0, right: 0 }}
        > */}
        <View className="mx-4 pt-4">
          {/* <LocationList setToggleView={setToggleView} /> */}
          <RestaurantList
            setToggleView={setToggleView}
            // restaurants={data.restaurants}
            // error={error}
            // isLoading={isLoading}
          />
        </View>
        {/* </SafeAreaView> */}
      </View>
    </>
  );
}
