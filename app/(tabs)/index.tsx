import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Animated,
  LayoutAnimation,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Map } from "@/components/Map";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as DropdownMenu from "zeego/dropdown-menu";
import Slider from "@react-native-community/slider"; // You may need to install this package

const CustomDropdown = ({
  options,
  selectedValue,
  onSelect,
  placeholder,
  isOpen,
  onToggle,
}) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  return (
    <View className="flex-1">
      <Pressable
        className="bg-gray-100 rounded-lg px-0 py-2"
        onPress={onToggle}
      >
        <Text className="text-gray-800 text-center">
          {selectedValue || placeholder}
        </Text>
      </Pressable>
      <Animated.View
        style={{
          maxHeight: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200],
          }),
          overflow: "hidden",
        }}
      >
        <FlatList
          data={options}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <Pressable
              className="p-4 border-b border-gray-200 bg-white"
              onPress={() => {
                onSelect(item);
                onToggle();
              }}
            >
              <Text>{item}</Text>
            </Pressable>
          )}
        />
      </Animated.View>
    </View>
  );
};

export default function SearchScreen() {
  const router = useRouter();
  const [toggleView, setToggleView] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [distance, setDistance] = useState(5);
  const [openDropdown, setOpenDropdown] = useState(null);
  const cuisines = ["", "Cafes", "Japanese", "Italian", "Fast Food"];
  const tags = ["", "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher"];
  const distances = [1, 5, 10, 20, 50];

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

  const [showDistanceSlider, setShowDistanceSlider] = useState(false);

  const toggleDropdown = (dropdownName) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

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
      <View className="absolute top-0 left-0 right-0 bg-white pt-20 pb-4 px-4 z-10">
        <View className="flex-row justify-between gap-2">
          <CustomDropdown
            options={cuisines}
            selectedValue={selectedCuisine}
            onSelect={setSelectedCuisine}
            placeholder="Cuisine"
            isOpen={openDropdown === "cuisine"}
            onToggle={() => toggleDropdown("cuisine")}
          />
          <CustomDropdown
            options={tags}
            selectedValue={selectedTag}
            onSelect={setSelectedTag}
            placeholder="Tags"
            isOpen={openDropdown === "tags"}
            onToggle={() => toggleDropdown("tags")}
          />
          <Pressable
            className="bg-gray-100 rounded-lg px-0 py-2 flex-1"
            onPress={toggleDistanceSlider}
          >
            <Text className="text-gray-800 text-center">{distance}km</Text>
          </Pressable>
        </View>
        {showDistanceSlider && (
          <View className="mt-2">
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
