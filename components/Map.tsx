import React, { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRestaurants } from "../lib/data";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Carousel from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { useWindowDimensions } from "react-native";
import { Link } from "expo-router";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const customMapStyle = [
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ visibility: "on" }],
  },
];

interface MapProps {
  searchCenter: { latitude: number; longitude: number };
  searchRadius: number;
  selectedCuisine: string;
  selectedTags: string[];
  onRestaurantSelect: (restaurant: Restaurant) => void;
  distance: number;
}

export function Map({
  searchCenter,
  selectedCuisine,
  selectedTags,
  distance,
}: MapProps) {
  const mapRef = useRef<MapView | null>(null);
  const {
    data: allRestaurants,
    isLoading,
    error,
  } = useRestaurants({
    lat: searchCenter.latitude,
    lon: searchCenter.longitude,
    radius: 50000, // Fixed 50 km radius
  });

  // Filter restaurants based on cuisine, distance, and tags
  const restaurants = allRestaurants
    ? allRestaurants.filter((restaurant) => {
        const isWithinDistance = restaurant.distance <= distance;
        const hasSelectedCuisine = selectedCuisine
          ? restaurant.cuisine.includes(selectedCuisine)
          : true;
        const hasAllTags = selectedTags.every((tag) =>
          restaurant.tags.includes(tag)
        );
        return isWithinDistance && hasSelectedCuisine && hasAllTags;
      })
    : [];

  useEffect(() => {
    if (mapRef.current && searchCenter) {
      const latitudeDelta = distance / 111; // Approximate conversion from km to degrees
      const longitudeDelta =
        distance / (111 * Math.cos(searchCenter.latitude * (Math.PI / 180)));

      mapRef.current.animateToRegion(
        {
          latitude: searchCenter.latitude,
          longitude: searchCenter.longitude,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
        },
        1000
      );
    }
  }, [searchCenter, distance]);

  // Comment out the userLocation state
  // const [userLocation, setUserLocation] = useState(null);

  // Set a fixed region for Sydney
  const [region, setRegion] = useState({
    latitude: -33.8688,
    longitude: 151.2093,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedMarkerCoords, setSelectedMarkerCoords] = useState(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1);
  const [focusedRestaurantIndex, setFocusedRestaurantIndex] = useState(null);
  const carouselRef = useRef(null);

  // Comment out the useEffect hook that gets the user's location
  /*
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);
  */

  useEffect(() => {
    if (searchCenter) {
      const latitudeDelta = distance / 111; // Approximate conversion from km to degrees
      const longitudeDelta =
        distance / (111 * Math.cos(searchCenter.latitude * (Math.PI / 180)));

      const newRegion = {
        latitude: searchCenter.latitude,
        longitude: searchCenter.longitude,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  }, [searchCenter, distance]);

  const handleMarkerPress = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const restaurant = restaurants[index];
    setSelectedRestaurant(restaurant);
    setSelectedMarkerCoords({
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    });

    // Focus the carousel on the selected restaurant
    setFocusedRestaurantIndex(index);
    carouselRef.current?.scrollTo({ index: index, animated: true });

    // Calculate new region to position marker based on current bottom sheet position
    const { width, height } = Dimensions.get("window");
    const ASPECT_RATIO = width / height;
    const LATITUDE_DELTA = 0.02;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

    const newRegion = {
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };

    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const cardWidth = windowWidth * 0.75; // 75% of screen width
  const cardHeight = 240; // We'll make this dynamic

  // Create a shared value for the default scroll offset
  const defaultScrollOffset = useSharedValue(cardWidth * 0.125);
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const renderRestaurantCard = ({ item, index }) => (
    <Link href={`/restaurants/${item.id}`} asChild>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
      >
        <View
          style={{ width: cardWidth, height: cardHeight }}
          className="justify-center items-center shadow-md"
        >
          <View className="w-full h-full bg-white rounded-lg overflow-hidden">
            <Image
              source={{ uri: item.image }}
              style={{ width: "100%", height: cardHeight * 0.5 }}
              placeholder={blurhash}
              contentFit="cover"
              transition={1000}
            />
            <View className="p-3 flex-1">
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  className="text-base font-bold flex-1"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
                <Text className="text-xs text-yellow-500 ml-2">
                  {"★".repeat(Math.round(averageRating(item.reviews)))}
                  <Text className="text-gray-400">
                    {" "}
                    ({averageRating(item.reviews).toFixed(1)})
                  </Text>
                </Text>
              </View>
              <View className="flex-row flex-wrap mb-2">
                {item.cuisine && item.cuisine.length > 0 ? (
                  item.cuisine.map((cuisine, idx) => (
                    <View
                      key={idx}
                      className="bg-gray-200 rounded-full px-2 py-1 mr-1 mb-1"
                    >
                      <Text className="text-xs text-gray-700">{cuisine}</Text>
                    </View>
                  ))
                ) : (
                  <View className="bg-gray-200 rounded-full px-2 py-1">
                    <Text className="text-xs text-gray-700">
                      Cuisine not specified
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-400">
                  {item.opens_at && item.closes_at
                    ? `${formatTime(item.opens_at)} - ${formatTime(
                        item.closes_at
                      )}`
                    : "Hours not available"}
                </Text>
                <Text className="text-xs font-semibold">
                  {item.price_rating || "Price N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );

  // Helper function to calculate average rating
  const averageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <MapView
          className="flex-1"
          region={region}
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
          style={styles.map}
          ref={mapRef}
          scrollEnabled={true}
          zoomEnabled={true}
          rotateEnabled={true}
          pitchEnabled={true}
          customMapStyle={customMapStyle}
          mapType="standard"
          showsPointsOfInterest={false}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          showsScale={false}
          showsCompass={false}
        />
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="grey" />
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View className="flex-1">
          <MapView
            className="flex-1"
            region={region}
            key={`${region.latitude}_${region.longitude}`}
            provider={
              Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
            }
            style={styles.map}
            ref={mapRef}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={true}
            pitchEnabled={true}
            customMapStyle={customMapStyle}
            mapType="standard"
            showsPointsOfInterest={false}
            showsBuildings={false}
            showsTraffic={false}
            showsIndoors={false}
            showsScale={false}
            showsCompass={false}
          >
            {/* Restaurant markers */}
            {restaurants &&
              restaurants.length > 0 &&
              restaurants.map((restaurant, index) => (
                <Marker
                  key={restaurant.id}
                  coordinate={{
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                  }}
                  onPress={() => handleMarkerPress(index)}
                >
                  <Pressable onPress={() => handleMarkerPress(index)}>
                    <View
                      style={[
                        styles.markerContainer,
                        selectedMarkerCoords &&
                        selectedMarkerCoords.latitude === restaurant.latitude &&
                        selectedMarkerCoords.longitude === restaurant.longitude
                          ? styles.selectedMarkerContainer
                          : null,
                      ]}
                    >
                      <Image
                        source={{ uri: restaurant.image }}
                        style={styles.markerImage}
                      />
                    </View>
                  </Pressable>
                </Marker>
              ))}
          </MapView>

          {(!restaurants || restaurants.length === 0 || error) && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>Coming soon!</Text>
            </View>
          )}

          {/* Carousel with visible adjacent cards */}
          <View style={[styles.carouselContainer, { height: cardHeight }]}>
            <Carousel
              style={{ width: windowWidth }}
              ref={carouselRef}
              data={restaurants}
              renderItem={renderRestaurantCard}
              width={cardWidth}
              height={cardHeight}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.9,
                parallaxScrollingOffset: 40,
              }}
              loop
              defaultIndex={0}
              snapEnabled
              scrollAnimationDuration={1000}
              panGestureHandlerProps={{
                activeOffsetX: [-10, 10],
              }}
              windowSize={3}
              overscrollEnabled={false}
              defaultScrollOffsetValue={defaultScrollOffset}
              pagingEnabled
              onSnapToItem={(index) => {
                const restaurant = restaurants[index];
                if (restaurant && restaurant.latitude && restaurant.longitude) {
                  // Use requestAnimationFrame to ensure the animation starts as soon as possible
                  requestAnimationFrame(() => {
                    mapRef.current?.animateToRegion(
                      {
                        latitude: restaurant.latitude,
                        longitude: restaurant.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      },
                      1000
                    );
                  });
                }
                setSelectedRestaurant(restaurant);
                setSelectedMarkerCoords({
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude,
                });
              }}
            />
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "grey",
  },
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    padding: 20,
  },
  contentContainer: {
    padding: 16,
    // zIndex: 1000,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
  },
  markerImage: {
    width: "100%",
    height: "100%",
  },
  selectedMarkerContainer: {
    borderColor: "red", // Changed from "#007AFF" to "red"
    borderWidth: 3,
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  carouselContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    // height is now set dynamically
  },
  carousel: {
    flex: 1,
    // width: "10%",
  },
  cardContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
});
