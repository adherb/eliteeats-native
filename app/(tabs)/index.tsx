import React, { useState, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Map } from "@/components/Map";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as DropdownMenu from "zeego/dropdown-menu";

const CuisineDropdown = DropdownMenu.create((props) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Pressable className="bg-red-200 rounded-full px-4 py-2">
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

export default function SearchScreen() {
  const router = useRouter();
  const [toggleView, setToggleView] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const cuisines = ["", "Cafes", "Japanese", "Italian", "Fast Food"];

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

      <View className="absolute top-20 left-0 right-0 mx-2">
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

        <CuisineDropdown
          selectedCuisine={selectedCuisine}
          cuisines={cuisines}
          onSelect={setSelectedCuisine}
        />
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
