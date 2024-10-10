import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Animated,
  LayoutAnimation,
  ScrollView,
  TextInput,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Map } from "@/components/Map";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as DropdownMenu from "zeego/dropdown-menu";
import Slider from "@react-native-community/slider"; // You may need to install this package

const API_KEY = "AIzaSyCsMzFJLCN29so4FXcCtbbcoiHjRw9cggU";

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
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [distance, setDistance] = useState(5);
  const [radius, setRadius] = useState(5000); // radius in meters
  const [openCuisine, setOpenCuisine] = useState(false);
  const [openTags, setOpenTags] = useState(false);
  const [openDistance, setOpenDistance] = useState(false);
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

  const toggleCuisineDropdown = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenCuisine((prev) => !prev);
  }, []);

  const toggleTagsDropdown = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenTags((prev) => !prev);
  }, []);

  const toggleDistanceDropdown = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenDistance((prev) => !prev);
  }, []);

  const toggleDropdown = useCallback((dropdownName) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
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
    setSelectedCuisine((prevCuisine) =>
      prevCuisine === cuisine ? "" : cuisine
    );
  };

  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);

  const handleSearch = async (text) => {
    console.log("Search query:", text);
    setSearchQuery(text);
    if (text.length > 1) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${API_KEY}`;
        console.log("Fetching predictions from:", url);
        const response = await fetch(url);
        const data = await response.json();
        console.log("Predictions response:", data);
        setPredictions(data.predictions);
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
    } else {
      setPredictions([]);
    }
  };

  const handleSelectPlace = async (placeId) => {
    console.log("Selected place ID:", placeId);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${API_KEY}`;
      console.log("Fetching place details from:", url);
      const response = await fetch(url);
      const data = await response.json();
      console.log("Place details response:", data);
      if (
        data.result &&
        data.result.geometry &&
        data.result.geometry.location
      ) {
        const { lat, lng } = data.result.geometry.location;
        console.log("New location:", { lat, lng });
        setLat(lat);
        setLng(lng);
        setSearchCenter({ lat, lng });

        // Update the map region to show a larger area
        mapRef.current?.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.1, // Increase this value to zoom out more
            longitudeDelta: 0.1, // Increase this value to zoom out more
          },
          1000
        );

        // Clear the search query and predictions to close the flyout
        setSearchQuery("");
        setPredictions([]);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const [searchCenter, setSearchCenter] = useState({
    latitude: -33.8688,
    longitude: 151.2093,
  });

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
      <Map
        ref={mapRef}
        searchCenter={searchCenter}
        searchRadius={radius}
        selectedCuisine={selectedCuisine}
        selectedTags={selectedTags}
      />
      <View className="absolute top-0 left-0 right-0 bg-white pt-20 pb-4 px-4 z-10">
        <View className="mb-3 flex-row items-center bg-gray-100 rounded-lg px-4 py-2">
          <Ionicons
            name="search"
            size={20}
            color="gray"
            style={{ marginRight: 8 }}
          />
          <TextInput
            className="flex-1"
            placeholder="Search locations"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Add this section to display predictions */}
        {predictions.length > 0 && (
          <View className="rounded-lg shadow-md bg-wjite">
            {predictions.map((prediction) => (
              <Pressable
                key={prediction.place_id}
                className="p-3 border-b border-gray-100"
                onPress={() => handleSelectPlace(prediction.place_id)}
              >
                <Text>{prediction.description}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View className="flex-row justify-between gap-2 mb-3">
          <Pressable
            className="bg-gray-100 rounded-lg px-0 py-2 flex-1"
            onPress={() => toggleDropdown("cuisine")}
          >
            <Text className="text-gray-800 text-center">
              {selectedCuisine || "Cuisine"}
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
                isSelected={selectedCuisine === cuisine}
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
              minimumTrackTintColor="#FF0000"
              maximumTrackTintColor="#000000"
              thumbTintColor="#FF0000"
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
