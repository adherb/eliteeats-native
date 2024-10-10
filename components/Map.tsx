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
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Image } from "expo-image";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRestaurants } from "../lib/data";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";

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

export function Map() {
  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef([]);
  const bottomSheetRef = useRef<BottomSheet>(null);
  // Comment out the userLocation state
  // const [userLocation, setUserLocation] = useState(null);
  const {
    data: restaurants,
    isLoading,
    error,
  } = useRestaurants({
    lat: -33.8688,
    lon: 151.2093,
    radius: 5, // Set an appropriate radius in km
  });

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

      // Calculate new region to position marker in top 25% of screen
      const { width, height } = Dimensions.get("window");
      const ASPECT_RATIO = width / height;
      const LATITUDE_DELTA = 0.02;
      const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

      const newRegion = {
        latitude: restaurant.latitude - LATITUDE_DELTA * 0.325,
        longitude: restaurant.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      mapRef.current?.animateToRegion(newRegion, 1000);

      // Always ensure the bottom sheet is open
      if (bottomSheetIndex === -1) {
        bottomSheetRef.current?.snapToIndex(2);
      }

      animateMarker();
    },
    [restaurants, bottomSheetIndex, animateMarker]
  );

  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log("handleSheetChanges", index);
      setBottomSheetIndex(index);

      // Reset selected marker and restaurant when bottom sheet is closed
      if (index === -1) {
        setSelectedMarkerCoords(null);
        setSelectedRestaurant(null);
        markerAnimation.setValue(0); // Reset the animation value
      }
    },
    [markerAnimation]
  );

  const handleBottomSheetLayout = useCallback((event) => {
    const { height } = event.nativeEvent.layout;
    setBottomSheetHeight(height);
  }, []);

  const renderRestaurantCard = (item) => (
    <View className="bg-white rounded-lg overflow-hidden mb-5 shadow-md">
      <Image
        source={{ uri: item.image }}
        style={{
          width: "100%",
          height: 192,
          objectFit: "cover",
        }}
        placeholder={blurhash}
        contentFit="cover"
        transition={1000}
      />
      <View className="p-4">
        <Text className="text-2xl font-bold mb-2">{item.name}</Text>
        {/* <Text className="text-gray-600 mb-2">
          {item.cuisine && item.cuisine.length > 0
            ? item.cuisine.join(", ")
            : "Cuisine not specified"}
        </Text> */}
        <Text className="text-gray-500 text-sm mb-2">{item.address}</Text>
        <View className="flex-row items-center mb-2">
          <Text className="text-yellow-500 font-bold mr-1">
            ★ {item.reviews[0].rating}
          </Text>
          <Text className="text-gray-600 text-sm">
            ({item.reviews.length} reviews)
          </Text>
        </View>
        <Text className="text-gray-700 mb-2">
          {item.price_rating} •{" "}
          {typeof item.distance === "number"
            ? `${item.distance.toFixed(2)} km away`
            : "Distance unknown"}{" "}
          • {item.average_prep_time || "Prep time unknown"}
        </Text>
        <Text className="text-gray-600 mb-3">
          Open: {item.opens_at} - {item.closes_at}
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {item.tags.map((tag, index) => (
            <View
              key={index}
              className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2"
            >
              <Text className="text-sm text-gray-700">{tag}</Text>
            </View>
          ))}
        </View>

        {/* Reviews Section */}
        <View className="mt-4">
          <Text className="text-xl font-semibold mb-2">Recent Reviews</Text>
          {item.reviews.map((review) => (
            <View
              key={review.id}
              className="mb-3 pb-3 border-b border-gray-200"
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-medium">{review.author}</Text>
                <View className="flex-row items-center">
                  <Text className="text-yellow-500 mr-1">★</Text>
                  <Text>{review.rating}</Text>
                </View>
              </View>
              <Text className="text-gray-600">{review.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // const renderBackdrop = useCallback(
  //   (props: BottomSheetBackdropProps) => (
  //     <BottomSheetBackdrop
  //       {...props}
  //       disappearsOnIndex={-1}
  //       appearsOnIndex={0}
  //       opacity={0.5}
  //       pressBehavior="none" // This allows touches to pass through
  //     />
  //   ),
  //   []
  // );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-red-500">Error: {error.message}</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-red-500">Error: {errorMsg}</Text>
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
            <Marker
              coordinate={{
                latitude: -33.8688,
                longitude: 151.2093,
              }}
              title="Sydney"
              pinColor="red"
            />

            {/* Restaurant markers */}
            {restaurants &&
              restaurants.map((restaurant, index) => (
                <Marker
                  key={restaurant.id}
                  coordinate={{
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                  }}
                  onPress={() => handleMarkerPress(index)}
                >
                  <TouchableOpacity onPress={() => handleMarkerPress(index)}>
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
                  </TouchableOpacity>
                </Marker>
              ))}
          </MapView>

          {(!restaurants || restaurants.length === 0) && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>No restaurants found.</Text>
            </View>
          )}

          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
            // backdropComponent={renderBackdrop}
          >
            <BottomSheetScrollView
              contentContainerStyle={styles.contentContainer}
            >
              {selectedRestaurant && renderRestaurantCard(selectedRestaurant)}
            </BottomSheetScrollView>
          </BottomSheet>
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
    backgroundColor: "rgba(210, 180, 140, 0.7)", // Tan color with 70% opacity
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
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
});
