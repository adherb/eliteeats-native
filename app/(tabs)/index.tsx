import React, { useState, useRef, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Map } from "@/components/Map";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as DropdownMenu from "zeego/dropdown-menu";
import Slider from "@react-native-community/slider"; // You may need to install this package

const CuisineDropdown = DropdownMenu.create((props) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Pressable className="bg-red-200 rounded-lg px-4 py-2 self-start">
          <Text className="text-gray-800">
            {props.selectedCuisine || "Cuisine"}
          </Text>
        </Pressable>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {props.cuisines.map((cuisine) => (
          <DropdownMenu.Item
            key={cuisine}
            onSelect={() => props.onSelect(cuisine)}
          >
            <DropdownMenu.ItemTitle>
              {cuisine || "All Cuisines"}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}, "CuisineDropdown");

const TagsDropdown = DropdownMenu.create((props) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Pressable className="bg-red-200 rounded-full px-4 py-2 self-start">
          <Text className="text-gray-800">{props.selectedTag || "Tags"}</Text>
        </Pressable>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {props.tags.map((tag) => (
          <DropdownMenu.Item key={tag} onSelect={() => props.onSelect(tag)}>
            <DropdownMenu.ItemTitle>{tag || "All Tags"}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}, "TagsDropdown");

export default function SearchScreen() {
  const router = useRouter();
  const [toggleView, setToggleView] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const cuisines = ["", "Cafes", "Japanese", "Italian", "Fast Food"];
  const tags = ["", "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher"];

  const headerTitleColour = "black";
  const backgroundColour = "white";
  const backButtonColour = "black";

  const latitude = 43.0389025;
  const longitude = -87.9064736;

  const [lat, setLat] = useState(latitude);
  const [lng, setLng] = useState(longitude);
  const [radius, setRadius] = useState(5); // Set initial radius to 5km
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

  const [distance, setDistance] = useState(5); // Default to 5km
  const [showDistanceSlider, setShowDistanceSlider] = useState(false);

  const toggleDistanceSlider = useCallback(() => {
    setShowDistanceSlider((prev) => !prev);
  }, []);

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
      <Map ref={mapRef} markers={locations} userLocation={userLocation} />

      {/* <View className="absolute top-20 left-0 right-0 mx-2">
        <View className="flex-row mb-2">
          <Pressable className="flex-1" onPress={() => router.push("/")}>
            <View
              className={clsx(
                "px-4 w-full rounded-full opacity-100 flex flex-row items-center justify-center h-14", // Added h-12 for consistent height
                {
                  "bg-gray-100": toggleView,
                  "bg-white": !toggleView,
                }
              )}
            >
              <Ionicons
                name="search"
                size={20}
                color="black"
                className="px-2"
              />
              <Text className="flex-1 ml-2 py-2 text-gray-600">
                Search Restaurants
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="flex-row gap-1 mb-2">
          <CuisineDropdown
            selectedCuisine={selectedCuisine}
            cuisines={cuisines}
            onSelect={setSelectedCuisine}
          />
          <TagsDropdown
            selectedTag={selectedTag}
            tags={tags}
            onSelect={setSelectedTag}
          />
          <Pressable
            className="bg-red-200 rounded-full px-4 py-2 self-start"
            onPress={toggleDistanceSlider}
          >
            <Text className="text-gray-800">{distance}km</Text>
          </Pressable>
        </View>

        {showDistanceSlider && (
          <View className="bg-white rounded-lg px-4 py-3 mb-2">
            <Text className="text-gray-800 mb-2">Distance: {distance}km</Text>
            <Slider
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={distance}
              onValueChange={setDistance}
              minimumTrackTintColor="#FF0000"
              maximumTrackTintColor="#000000"
              thumbTintColor="#FF0000"
            />
            <Pressable
              className="bg-red-500 rounded-full px-4 py-3 mt-4"
              onPress={() => {
                // Implement search functionality here
                console.log("Search with:", {
                  selectedCuisine,
                  selectedTag,
                  distance,
                });
                // Close the slider after search
                setShowDistanceSlider(false);
              }}
            >
              <Text className="text-white text-center font-bold">Search</Text>
            </Pressable>
          </View>
        )}

        <StatusBar style="dark" />
      </View> */}

      {/* <View className="absolute top-20 left-0 right-0 mx-2 flex-row justify-around bg-red-500">
        <Pressable className="bg-white rounded-full px-4 py-2">
          <Text className="text-gray-800">{selectedCuisine || "Cuisine"}</Text>
        </Pressable>
        <Pressable className="bg-white rounded-full px-4 py-2">
          <Text className="text-gray-800">{selectedTag || "Tags"}</Text>
        </Pressable>
        <Pressable className="bg-white rounded-full px-4 py-2">
          <Text className="text-gray-800">{distance}km</Text>
        </Pressable>
      </View> */}

      {/* New section */}
      <View className="absolute top-0 left-0 right-0 bg-white pt-20 pb-4 px-4">
        {/* <Pressable
          className="bg-gray-100 rounded-full px-4 py-3 mb-4 flex-row items-center"
          onPress={() => router.push("/")}
        >
          <Ionicons name="search" size={20} color="gray" />
          <Text className="ml-2 text-gray-600">Search Restaurants</Text>
        </Pressable> */}
        <View className="flex-row justify-between">
          <Pressable className="bg-red-100 rounded-full px-4 py-2 flex-1 mr-2">
            <Text className="text-gray-800 text-center">
              {selectedCuisine || "Cuisine"}
            </Text>
          </Pressable>
          <Pressable className="bg-red-100 rounded-full px-4 py-2 flex-1 mx-2">
            <Text className="text-gray-800 text-center">
              {selectedTag || "Tags"}
            </Text>
          </Pressable>
          <Pressable className="bg-red-100 rounded-full px-4 py-2 flex-1 ml-2">
            <Text className="text-gray-800 text-center">{distance}km</Text>
          </Pressable>
        </View>
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
