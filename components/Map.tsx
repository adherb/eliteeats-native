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

const sampleRestaurants = [
  {
    id: "1",
    name: "Sokyo",
    latitude: -33.8683,
    longitude: 151.1998,
    address:
      "Level G, The Darling at The Star, 80 Pyrmont Street, Pyrmont NSW 2009",
    image:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/e1/6d/6b/sokyo-s-elegant-dining.jpg?w=2000&h=-1&s=1",
    distance: 1.2,
    price_rating: "$$",
    average_prep_time: 20,
    opens_at: "11:00",
    closes_at: "22:00",
    cuisine: ["Japanese", "Sushi"],
    tags: ["Fine Dining", "Hotel Restaurant"],
    reviews: [
      {
        id: 1,
        author: "John D.",
        rating: 5,
        text: "Exceptional sushi and ambiance!",
      },
      {
        id: 2,
        author: "Sarah M.",
        rating: 4,
        text: "Great food, but a bit pricey.",
      },
    ],
  },
  {
    id: "2",
    name: "Nobu",
    latitude: -33.8618,
    longitude: 151.1998,
    address: "Crown Sydney, Level 2/1 Barangaroo Avenue, Barangaroo NSW 2000",
    image:
      "https://static.ffx.io/images/$zoom_1%2C$multiply_0.744%2C$ratio_1.777778%2C$width_2000%2C$x_0%2C$y_136/t_crop_custom/q_62%2Cf_auto/b3fa2c79d55f93381029e0fc1bc562c4fc60d54d",
    distance: 0.8,
    price_rating: "$$$",
    average_prep_time: 25,
    opens_at: "12:00",
    closes_at: "21:30",
    cuisine: ["Japanese", "Peruvian"],
    tags: ["Fine Dining", "Fusion", "Celebrity Chef"],
    reviews: [
      {
        id: 1,
        author: "Emily R.",
        rating: 5,
        text: "Amazing fusion flavors! A must-visit.",
      },
      {
        id: 2,
        author: "Michael T.",
        rating: 4,
        text: "Innovative dishes, but portions are small.",
      },
    ],
  },
  {
    id: "3",
    name: "Kazan",
    latitude: -33.8689,
    longitude: 151.2068,
    address: "69 Pitt St, Sydney NSW 2000",
    image:
      "https://cdn.concreteplayground.com/content/uploads/2023/09/Nobu-Sydney-_-Haku-_-Jude-Cohen-_-2023-7-1920x1440.jpg",
    distance: 1.5,
    price_rating: "$",
    average_prep_time: 15,
    opens_at: "10:00",
    closes_at: "23:00",
    cuisine: ["Japanese"],
    tags: ["Izakaya", "Casual Dining"],
    reviews: [
      {
        id: 1,
        author: "Lisa W.",
        rating: 4,
        text: "Authentic izakaya experience in Sydney!",
      },
      {
        id: 2,
        author: "David L.",
        rating: 3,
        text: "Good food, but service was a bit slow.",
      },
    ],
  },
  {
    id: "4",
    name: "Mr. Wong",
    latitude: -33.8651,
    longitude: 151.2075,
    address: "3 Bridge Ln, Sydney NSW 2000",
    image:
      "https://s3.ap-southeast-2.amazonaws.com/production.assets.merivale.com.au/wp-content/uploads/2017/06/30104217/mrwong_gallery_3.jpg",
    distance: 0.9,
    price_rating: "$$$",
    average_prep_time: 30,
    opens_at: "12:00",
    closes_at: "23:00",
    cuisine: ["Chinese", "Cantonese"],
    tags: ["Fine Dining", "Dimsum"],
    reviews: [
      {
        id: 1,
        author: "Anna K.",
        rating: 5,
        text: "Best dim sum in Sydney! Loved the atmosphere.",
      },
      {
        id: 2,
        author: "Tom H.",
        rating: 4,
        text: "Excellent food, but can be crowded on weekends.",
      },
    ],
  },
  {
    id: "5",
    name: "Uncle Ming's",
    latitude: -33.8688,
    longitude: 151.2092,
    address: "55 York St, Sydney NSW 2000",
    image:
      "https://media-cdn.tripadvisor.com/media/photo-s/18/3d/f5/f5/caption.jpg",
    distance: 0.7,
    price_rating: "$$",
    average_prep_time: 20,
    opens_at: "16:00",
    closes_at: "02:00",
    cuisine: ["Chinese", "Asian Fusion"],
    tags: ["Bar", "Cocktails", "Late Night"],
    reviews: [
      {
        id: 1,
        author: "Chris P.",
        rating: 4,
        text: "Great cocktails and fun atmosphere!",
      },
      {
        id: 2,
        author: "Sophie L.",
        rating: 5,
        text: "Perfect spot for late-night drinks and snacks.",
      },
    ],
  },
];

export function Map() {
  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef([]);
  const bottomSheetRef = useRef<BottomSheet>(null);

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

  const snapPoints = useMemo(() => ["25%", "50%", "70%"], []);

  const router = useRouter();
  const colorScheme = useColorScheme();

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

  const handleMarkerPress = (index) => {
    const restaurant = sampleRestaurants[index];
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
            {sampleRestaurants.map((location, index) => (
              <Marker
                key={location.id}
                coordinate={{
                  latitude: Number(location.latitude),
                  longitude: Number(location.longitude),
                }}
                onPress={() => handleMarkerPress(index)}
              >
                {selectedRestaurant && selectedRestaurant.id === location.id ? (
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
                      source={{ uri: location.image }}
                      style={styles.selectedMarkerImage}
                    />
                  </Animated.View>
                ) : (
                  <View style={styles.markerContainer}>
                    <Image
                      source={{ uri: location.image }}
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
