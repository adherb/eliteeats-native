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
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [region, setRegion] = useState({
    latitude: -33.8688,
    longitude: 151.2093,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1);
  const [markerAnimation] = useState(new Animated.Value(0));

  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);

  const router = useRouter();
  const colorScheme = useColorScheme();

  // Use the useRestaurants hook
  const { data: restaurants, isLoading, error } = useRestaurants();

  useEffect(() => {
    setRegion({
      latitude: -33.8688,
      longitude: 151.2093,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  }, []);

  const animateMarker = useCallback(() => {
    Animated.spring(markerAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [markerAnimation]);

  const handleMarkerPress = (restaurant) => {
    setSelectedRestaurant(restaurant);

    // Calculate new region to position marker in top 25% of screen
    const { width, height } = Dimensions.get("window");
    const ASPECT_RATIO = width / height;
    const LATITUDE_DELTA = 0.02;
    const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

    const newRegion = {
      latitude: restaurant.latitude - LATITUDE_DELTA * 0.325, // Move center point up
      longitude: restaurant.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };

    mapRef.current?.animateToRegion(newRegion, 1000);
    bottomSheetRef.current?.snapToIndex(2);
    animateMarker();
  };

  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log("handleSheetChanges", index);
      setBottomSheetIndex(index);

      // Reset selected marker and restaurant when bottom sheet is closed
      if (index === -1) {
        setSelectedRestaurant(null);
        markerAnimation.setValue(0); // Reset the animation value
      }
    },
    [markerAnimation]
  );

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
        <Text className="text-gray-600 mb-2">{item.cuisine.join(", ")}</Text>
        <Text className="text-gray-500 text-sm mb-2">{item.address}</Text>
        <View className="flex-row items-center mb-2">
          <Text className="text-yellow-500 font-bold mr-1">★ 4.5</Text>
          <Text className="text-gray-600 text-sm">
            ({item.reviews.length} reviews)
          </Text>
        </View>
        <Text className="text-gray-700 mb-2">
          {item.price_rating} • {item.distance.toFixed(1)} km away •{" "}
          {item.average_prep_time} min prep time
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

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  if (isLoading) {
    return <Text>Loading restaurants...</Text>;
  }

  if (error) {
    return <Text>Error loading restaurants: {error.message}</Text>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={styles.container}>
          <MapView
            className="flex-1"
            region={region}
            key={`${region?.latitude}_${region?.longitude}`}
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
            {restaurants.map((restaurant) => (
              <Marker
                key={restaurant.id}
                coordinate={{
                  latitude: Number(restaurant.latitude),
                  longitude: Number(restaurant.longitude),
                }}
                onPress={() => handleMarkerPress(restaurant)}
              >
                {selectedRestaurant &&
                selectedRestaurant.id === restaurant.id ? (
                  <Animated.View
                    style={[
                      styles.selectedMarkerContainer,
                      {
                        transform: [
                          {
                            scale: markerAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.2],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: restaurant.image }}
                      style={styles.selectedMarkerImage}
                    />
                  </Animated.View>
                ) : (
                  <View style={styles.markerContainer}>
                    <Image
                      source={{ uri: restaurant.image }}
                      style={styles.markerImage}
                    />
                  </View>
                )}
              </Marker>
            ))}
          </MapView>

          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
            backdropComponent={renderBackdrop}
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
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
