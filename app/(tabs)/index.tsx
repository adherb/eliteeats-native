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
import Slider from "@react-native-community/slider";
import { useCuisines, useTags } from "@/lib/data";
import { useDebouncedCallback } from "use-debounce";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const Badge = ({ label, isSelected, onPress }) => (
  <Pressable
    onPress={onPress}
    className={`px-4 py-2 mr-3 my-1 rounded-full ${
      isSelected ? "bg-[#FF0000]" : "bg-gray-200"
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
  const [distance, setDistance] = useState(5); // Default to 5km
  const [radius, setRadius] = useState(5000); // radius in meters
  const [openCuisine, setOpenCuisine] = useState(false);
  const [openTags, setOpenTags] = useState(false);
  const [openDistance, setOpenDistance] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
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
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  }, []);

  const [mapKey, setMapKey] = useState(0);

  const debouncedUpdateMap = useDebouncedCallback(
    (newRadius) => {
      setRadius(newRadius);
      setMapKey((prevKey) => prevKey + 1);
    },
    300 // 300ms delay
  );

  const updateMapRadius = useCallback(
    (value) => {
      let newDistance;
      if (value <= 5) {
        newDistance = Math.round(value);
      } else {
        newDistance = Math.round((value - 5) / 5) * 5 + 5;
      }
      setDistance(newDistance);
      const newRadius = newDistance * 1000; // Convert km to meters
      debouncedUpdateMap(newRadius);
    },
    [debouncedUpdateMap]
  );

  useEffect(() => {
    // Initial map setup
    if (mapRef.current) {
      mapRef.current.fitToRadius(radius);
    }
  }, []);

  const toggleCuisine = (cuisine) => {
    const newCuisine = selectedCuisine === cuisine ? "" : cuisine;
    setSelectedCuisine(newCuisine);
    setMapKey((prevKey) => prevKey + 1);
  };

  const toggleTag = useCallback(
    (tag) => {
      setSelectedTags((prev) => {
        const newTags = prev.includes(tag)
          ? prev.filter((t) => t !== tag)
          : [...prev, tag];
        setMapKey((prevKey) => prevKey + 1);
        return newTags;
      });
    },
    [radius, selectedCuisine]
  );

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
        setSearchCenter({ latitude: lat, longitude: lng }); // Make sure this is correct
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
        setShowSearch(false); // Hide the search input
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const [searchCenter, setSearchCenter] = useState({
    latitude: -33.8688,
    longitude: 151.2093,
  });

  const [showSearch, setShowSearch] = useState(false);

  const resetAllOptions = useCallback(() => {
    console.log("Resetting all options");
    try {
      setOpenDropdown(null);
      setShowSearch(false);
      setSearchQuery("");
      setPredictions([]);
      console.log("Options reset successfully");
    } catch (error) {
      console.error("Error resetting options:", error);
    }
  }, []);

  const handleRestaurantSelect = useCallback(
    (restaurant) => {
      console.log("Restaurant selected:", restaurant);
      // Handle the restaurant selection logic here
      // For example, you might want to set some state or navigate to a detail page

      // Then reset all options
      resetAllOptions();
    },
    [resetAllOptions]
  );

  useEffect(() => {
    console.log("Current state:", {
      openDropdown,
      showSearch,
      searchQuery,
      predictions: predictions.length,
    });
  }, [openDropdown, showSearch, searchQuery, predictions]);

  // Replace the static cuisines and tags arrays with the hooks
  const { data: cuisines = [], isLoading: isCuisinesLoading } = useCuisines();
  const { data: tags = [], isLoading: isTagsLoading } = useTags();

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
        key={mapKey}
        searchCenter={searchCenter}
        searchRadius={radius}
        selectedCuisine={selectedCuisine}
        selectedTags={selectedTags}
        onRestaurantSelect={handleRestaurantSelect}
        distance={distance}
      />
      <View className="absolute top-0 left-0 right-0 bg-white pt-20 pb-0 px-4 z-10">
        {!showSearch ? (
          <>
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row gap-2 flex-1">
                <Pressable
                  className="bg-gray-100 rounded-lg px-4 py-3 flex-1"
                  onPress={() => toggleDropdown("cuisine")}
                >
                  <Text className="text-gray-800 text-center">
                    {selectedCuisine || "Cuisine"}
                  </Text>
                </Pressable>
                <Pressable
                  className="bg-gray-100 rounded-lg px-4 py-3 flex-1"
                  onPress={() => toggleDropdown("tags")}
                >
                  <Text className="text-gray-800 text-center">
                    {selectedTags.length > 0
                      ? `${selectedTags.length} selected`
                      : "Tags"}
                  </Text>
                </Pressable>
                <Pressable
                  className="bg-gray-100 rounded-lg px-4 py-3 flex-1"
                  onPress={() => toggleDropdown("distance")}
                >
                  <Text className="text-gray-800 text-center">
                    {distance}km
                  </Text>
                </Pressable>
              </View>
              <Pressable
                className="bg-gray-100 rounded-lg p-2 ml-2"
                onPress={() => setShowSearch(true)}
              >
                <Ionicons name="search" size={24} color="gray" />
              </Pressable>
            </View>
            {openDropdown === "cuisine" && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3"
              >
                {isCuisinesLoading ? (
                  <Text>Loading cuisines...</Text>
                ) : (
                  cuisines.map((cuisine) => (
                    <Badge
                      key={cuisine}
                      label={cuisine}
                      isSelected={selectedCuisine === cuisine}
                      onPress={() => toggleCuisine(cuisine)}
                    />
                  ))
                )}
              </ScrollView>
            )}
            {openDropdown === "tags" && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3"
              >
                {isTagsLoading ? (
                  <Text>Loading tags...</Text>
                ) : (
                  tags.map((tag) => (
                    <Badge
                      key={tag}
                      label={tag}
                      isSelected={selectedTags.includes(tag)}
                      onPress={() => toggleTag(tag)}
                    />
                  ))
                )}
              </ScrollView>
            )}
            {openDropdown === "distance" && (
              <View className="mb-3">
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={1}
                  maximumValue={50}
                  step={1}
                  value={distance <= 5 ? distance : (distance - 5) / 5 + 5}
                  onValueChange={updateMapRadius}
                  minimumTrackTintColor="#FF0000"
                  maximumTrackTintColor="#000000"
                  thumbTintColor="#FF0000"
                />
                <Text className="text-center">{distance} km</Text>
              </View>
            )}
          </>
        ) : (
          <View>
            <View className="mb-3 flex-row items-center bg-gray-100 rounded-lg px-4 py-2">
              <TextInput
                className="flex-1"
                placeholder="Search locations"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              <Pressable onPress={() => setShowSearch(false)}>
                <Ionicons name="close" size={24} color="gray" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Add this section to display predictions */}
        {showSearch && predictions.length > 0 && (
          <View className="bg-white">
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
