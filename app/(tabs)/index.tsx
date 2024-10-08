import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Animated,
  LayoutAnimation,
  ScrollView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Map } from "@/components/Map";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as DropdownMenu from "zeego/dropdown-menu";
import Slider from "@react-native-community/slider"; // You may need to install this package

const Badge = ({ label, isSelected, onPress }) => (
  <Pressable
    onPress={onPress}
    className={`px-4 py-2 mr-3 my-1 rounded-full ${
      isSelected ? "bg-red-500" : "bg-gray-200"
    }`}
  >
    <Text className={`text-sm ${isSelected ? "text-white" : "text-gray-700"}`}>
      {label}
    </Text>
  </Pressable>
);

export default function SearchScreen() {
  const router = useRouter();
  const [toggleView, setToggleView] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [distance, setDistance] = useState(5);
  const [radius, setRadius] = useState(5000); // radius in meters
  const [openDropdown, setOpenDropdown] = useState(null);
  const cuisines = ["Cafes", "Japanese", "Italian", "Fast Food", "Chinese"];
  const tags = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Halal",
    "Kosher",
    "Fine Dining",
  ];
  const distances = [1, 5, 10, 20, 50];

  const headerTitleColour = "black";
  const backgroundColour = "white";
  const backButtonColour = "black";

  const latitude = 43.0389025;
  const longitude = -87.9064736;

  const [lat, setLat] = useState(latitude);
  const [lng, setLng] = useState(longitude);
  const [locations, setLocations] = useState([]);

  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);

  const zoomToUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    mapRef.current?.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000
    );
  };

  const [showDistanceSlider, setShowDistanceSlider] = useState(false);

  const toggleDropdown = (dropdownName) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const toggleDistanceSlider = useCallback(() => {
    setShowDistanceSlider((prev) => !prev);
  }, []);

  const updateMapRadius = useCallback((distanceKm) => {
    setDistance(distanceKm);
    setRadius(distanceKm * 1000); // Convert km to meters
  }, []);

  useEffect(() => {
    // Initial map setup
    if (mapRef.current) {
      mapRef.current.fitToRadius(radius);
    }
  }, []);

  const toggleCuisine = (cuisine) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerTransparent: toggleView === true ? false : true,
          headerStyle: {
            backgroundColor: backgroundColour,
          },
          headerTintColor: backButtonColour,
          headerTitleStyle: {
            fontWeight: "bold",
            color: headerTitleColour,
          },
        }}
      />
      <StatusBar style="light" />
      <Map ref={mapRef} radius={radius} latitude={lat} longitude={lng} />

      <View className="absolute top-0 left-0 right-0 bg-white pt-20 pb-4 px-4 z-10">
        <View className="flex-row justify-between gap-2 mb-3">
          <Pressable
            className="bg-gray-100 rounded-lg px-0 py-2 flex-1"
            onPress={() => toggleDropdown("cuisine")}
          >
            <Text className="text-gray-800 text-center">
              {selectedCuisines.length > 0
                ? `${selectedCuisines.length} selected`
                : "Cuisine"}
            </Text>
          </Pressable>
          <Pressable
            className="bg-gray-100 rounded-lg px-0 py-2 flex-1"
            onPress={() => toggleDropdown("tags")}
          >
            <Text className="text-gray-800 text-center">
              {selectedTags.length > 0
                ? `${selectedTags.length} selected`
                : "Tags"}
            </Text>
          </Pressable>
          <Pressable
            className="bg-gray-100 rounded-lg px-0 py-2 flex-1"
            onPress={() => toggleDropdown("distance")}
          >
            <Text className="text-gray-800 text-center">{distance}km</Text>
          </Pressable>
        </View>

        {openDropdown === "cuisine" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="py-2"
            contentContainerStyle={{ paddingHorizontal: 4 }}
          >
            {cuisines.map((cuisine) => (
              <Badge
                key={cuisine}
                label={cuisine}
                isSelected={selectedCuisines.includes(cuisine)}
                onPress={() => toggleCuisine(cuisine)}
              />
            ))}
          </ScrollView>
        )}

        {openDropdown === "tags" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="py-2"
            contentContainerStyle={{ paddingHorizontal: 4 }}
          >
            {tags.map((tag) => (
              <Badge
                key={tag}
                label={tag}
                isSelected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </ScrollView>
        )}

        {openDropdown === "distance" && (
          <View className="flex-row items-center mt-4 px-2">
            <Text className="mr-4">Distance: {distance}km</Text>
            <Slider
              style={{ flex: 1 }}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={distance}
              onValueChange={updateMapRadius}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#007AFF"
            />
          </View>
        )}
      </View>

      <Pressable
        onPress={zoomToUserLocation}
        className="absolute bottom-6 right-6 bg-white rounded-full p-3 shadow-md"
      >
        <Ionicons name="locate" size={24} color="black" />
      </Pressable>
      <StatusBar style="dark" />
    </>
  );
}
