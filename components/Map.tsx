import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEffect } from "react";
import MapView, {
  Marker,
  Callout,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRestaurants } from "../lib/data";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Carousel from "react-native-reanimated-carousel";

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
  searchRadius,
  selectedCuisine,
  selectedTags,
  onRestaurantSelect,
  distance,
}: MapProps) {
  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef([]);
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
  const restaurants = useMemo(() => {
    if (!allRestaurants) return [];
    return allRestaurants.filter((restaurant) => {
      const isWithinDistance = restaurant.distance <= distance;
      const hasSelectedCuisine = selectedCuisine
        ? restaurant.cuisine.includes(selectedCuisine)
        : true;
      const hasAllTags = selectedTags.every((tag) =>
        restaurant.tags.includes(tag)
      );
      return isWithinDistance && hasSelectedCuisine && hasAllTags;
    });
  }, [allRestaurants, distance, selectedCuisine, selectedTags]);

  // Add this useEffect to log errors
  useEffect(() => {
    if (error) {
      console.error("Error in useRestaurants:", error);
    }
  }, [error]);

  // Update the log to show both allRestaurants and filtered restaurants
  console.log("All restaurants data:", allRestaurants);
  console.log("Filtered restaurants:", restaurants);
  console.log("Search params:", {
    lat: searchCenter.latitude,
    lon: searchCenter.longitude,
    radius: 50000, // Fixed 50 km radius
    appliedCuisine: selectedCuisine,
    appliedDistance: distance,
    appliedTags: selectedTags,
  });

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
  const [bottomSheetHeight, setBottomSheetHeight] = useState(0);
  const [selectedMarkerCoords, setSelectedMarkerCoords] = useState(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1);
  const [markerAnimation] = useState(new Animated.Value(0));
  const [errorMsg, setErrorMsg] = useState(null);
  const [focusedRestaurantIndex, setFocusedRestaurantIndex] = useState(null);
  const carouselRef = useRef(null);

  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);

  const router = useRouter();
  const colorScheme = useColorScheme();

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

  const animateMarker = useCallback(() => {
    Animated.spring(markerAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [markerAnimation]);

  const handleMarkerPress = useCallback(
    (index) => {
      // Trigger haptic feedback
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

      let offsetMultiplier;
      switch (bottomSheetIndex) {
        case 0: // 25%
          offsetMultiplier = 0.025;
          break;
        case 1: // 50%
          offsetMultiplier = 0.125;
          break;
        case 2: // 70%
          offsetMultiplier = 0.325;
          break;
        default:
          offsetMultiplier = 0.325; // Default to 70% if sheet is closed
      }

      const newRegion = {
        latitude: restaurant.latitude - LATITUDE_DELTA * offsetMultiplier,
        longitude: restaurant.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      mapRef.current?.animateToRegion(newRegion, 1000);

      animateMarker();
    },
    [restaurants, bottomSheetIndex, animateMarker]
  );

  const windowWidth = Dimensions.get("window").width;
  const cardWidth = windowWidth * 0.7; // Reduced from 0.8 to 0.7

  const renderRestaurantCard = ({ item, index }) => (
    <View style={[styles.cardContainer, { width: cardWidth - 20 }]}>
      <View style={styles.card}>
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          placeholder={blurhash}
          contentFit="cover"
          transition={1000}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>
            {item.cuisine && item.cuisine.length > 0
              ? item.cuisine.join(", ")
              : "Cuisine not specified"}
          </Text>
          <Text style={styles.cardDistance}>
            {typeof item.distance === "number"
              ? `${item.distance.toFixed(2)} km away`
              : "Distance unknown"}
          </Text>
        </View>
      </View>
    </View>
  );

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
          <ActivityIndicator size="large" color="#ff0000" />
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={styles.container}>
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
            {/* Sydney marker */}
            {/* <Marker
              coordinate={{
                latitude: -33.8688,
                longitude: 151.2093,
              }}
              title="Sydney"
              pinColor="red"
            /> */}

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
                    <Animated.View
                      style={[
                        styles.markerContainer,
                        selectedMarkerCoords &&
                        selectedMarkerCoords.latitude === restaurant.latitude &&
                        selectedMarkerCoords.longitude === restaurant.longitude
                          ? styles.selectedMarkerContainer
                          : null,
                        {
                          transform: [
                            {
                              scale: markerAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.5],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: restaurant.image }}
                        style={styles.markerImage}
                      />
                    </Animated.View>
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
          <View className="" style={styles.carouselContainer}>
            <Carousel
              style={{ width: "100%" }}
              ref={carouselRef}
              data={restaurants}
              renderItem={renderRestaurantCard}
              width={cardWidth}
              height={220}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.9,
                parallaxScrollingOffset: 50,
              }}
              loop
              defaultIndex={0}
              snapEnabled
              scrollAnimationDuration={1000}
              // itemSnapToAlignment="center"
              // inactiveSlideScale={0.9}
              // inactiveSlideOpacity={0.7}
              // sliderWidth={windowWidth}
              // itemWidth={cardWidth}
              // slideStyle={{ display: "flex", alignItems: "center" }}
              onSnapToItem={(index) => {
                const restaurant = restaurants[index];
                setSelectedRestaurant(restaurant);
                setSelectedMarkerCoords({
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude,
                });
                mapRef.current?.animateToRegion(
                  {
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  },
                  1000
                );
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
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "red", // Changed from "#007AFF" to "red"
  },
  selectedMarkerImage: {
    width: "100%",
    height: "100%",
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
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor: "red",
    paddingBottom: 0,
    marginBottom: 0,
    // height: 250,
  },
  carousel: {
    flex: 1,
    // width: "10%",
  },
  cardContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10, // Add horizontal margin
  },
  card: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 120,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  cardDistance: {
    fontSize: 12,
    color: "#999",
  },
});
