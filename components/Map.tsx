import React from "react";
import { useState, useRef, useEffect } from "react";
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
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Image } from "expo-image";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const timeZone = "Australia/Brisbane"; // TODO: make this dynamic

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

// Add this near the top of your file, outside of the Map function
// const sampleRestaurants = [
//   {
//     id: "1",
//     name: "Sokyo",
//     latitude: -33.8683,
//     longitude: 151.1998,
//     image:
//       "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/e1/6d/6b/sokyo-s-elegant-dining.jpg?w=2000&h=-1&s=1",
//     distance: 1.2,
//     price_rating: "$$",
//     average_prep_time: 20,
//     opens_at: "11:00",
//     closes_at: "22:00",
//   },
//   {
//     id: "2",
//     name: "Nobu",
//     latitude: -33.8618,
//     longitude: 151.1998,
//     image:
//       "https://static.ffx.io/images/$zoom_1%2C$multiply_0.744%2C$ratio_1.777778%2C$width_2000%2C$x_0%2C$y_136/t_crop_custom/q_62%2Cf_auto/b3fa2c79d55f93381029e0fc1bc562c4fc60d54d",
//     distance: 0.8,
//     price_rating: "$$$",
//     average_prep_time: 25,
//     opens_at: "12:00",
//     closes_at: "21:30",
//   },
//   {
//     id: "3",
//     name: "Kazan",
//     latitude: -33.8688,
//     longitude: 151.2093,
//     image:
//       "https://cdn.concreteplayground.com/content/uploads/2023/09/Nobu-Sydney-_-Haku-_-Jude-Cohen-_-2023-7-1920x1440.jpg",
//     distance: 1.5,
//     price_rating: "$",
//     average_prep_time: 15,
//     opens_at: "10:00",
//     closes_at: "23:00",
//   },
// ];

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
  // const carouselRef = useRef<any>(null);
  const markerRefs = useRef([]);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Add default coordinates for Sydney
  const [region, setRegion] = useState({
    latitude: -33.8688,
    longitude: 151.2093,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Update snap points to include a 75% option
  // const snapPoints = React.useMemo(() => ["25%", "50%", "75%"], []);

  const snapPoints = React.useMemo(() => ["85%"], []);

  const router = useRouter();
  const colorScheme = useColorScheme();
  useEffect(() => {
    // If location is not available, use the default Sydney coordinates
    // if (!location) {
    setRegion({
      latitude: -33.8688,
      longitude: 151.2093,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    // }
  }, []);

  const animateToRegion = (region) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
      setRegion(region);
      // Removed setZoomLevel call
    } else {
      setTimeout(() => {
        animateToRegion(region);
      }, 100);
    }
  };

  // Update handleMarkerPress function to open to 75% height
  const handleMarkerPress = (index) => {
    bottomSheetRef.current?.snapToIndex(0); // Use index 0 for the 75% height
    setSelectedRestaurant(sampleRestaurants[index]);
  };

  const width = Dimensions.get("window").width;
  // const ITEM_WIDTH = Math.round(width * 0.7); // Width of the main item
  // const ITEM_HEIGHT = 160;
  // const SPACING = 10; // Spacing between items

  // const handleCarouselItemChange = (index) => {
  //   let location = sampleRestaurants[index];

  //   mapRef.current.animateToRegion({
  //     latitude: location && Number(location?.latitude),
  //     longitude: location && Number(location?.longitude),
  //     latitudeDelta: 0.09,
  //     longitudeDelta: 0.035,
  //   });

  //   markerRefs.current[index]?.showCallout();
  // };

  // Updated renderRestaurantCard function
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

  /* Commented out carousel item renderer
  const renderCarouselItem = ({ item }) => (
    <View
      style={{
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        marginHorizontal: SPACING / 2,
        borderRadius: 15,
        overflow: "hidden",
      }}
      className="bg-white mb-2"
    >
      <Image
        source="https://onenewchange.com/sites/one_new_change/files/styles/shop_gallery_small/public/images/gallery/gallery_nandos_new_cutlery_2.jpg?itok=ENpDDNnK"
        style={{
          width: "100%",
          height: "100%",
          resizeMode: "cover",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: 10,
        }}
      >
        <Text className="text-white font-bold">{item.name}</Text>
        <Text className="text-white">
          {item.rating} Stars, {item.review_count} Reviews
        </Text>
      </View>
    </View>
  );
  */

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
          >
            {sampleRestaurants.map((location, index) => (
              <Marker
                key={location.id}
                coordinate={{
                  latitude: Number(location.latitude),
                  longitude: Number(location.longitude),
                }}
                title={location.name}
                style={{ width: 50, height: 50 }}
                ref={(ref) => (markerRefs.current[index] = ref)}
                onPress={() => handleMarkerPress(index)}
              >
                <Image
                  source={require("../assets/images/custom-map-pin.png")}
                  className="w-auto h-10"
                  style={{ width: 40, height: 40 }} // Use explicit width and heigh
                  // onPress={() => handleMarkerPress(index)}
                />
                <Callout tooltip={true} />
              </Marker>
            ))}
          </MapView>

          <View style={styles.overlay} pointerEvents="none" />

          {/* Commented out Carousel component
          <Carousel
            loop
            width={ITEM_WIDTH + SPACING}
            height={ITEM_HEIGHT}
            autoPlay={false}
            data={sampleRestaurants}
            scrollAnimationDuration={1000}
            onSnapToItem={handleCarouselItemChange}
            renderItem={renderCarouselItem}
            style={styles.carouselContainer}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50,
            }}
            snapEnabled={true}
            defaultIndex={0}
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
          />
          */}

          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
          >
            <ScrollView contentContainerStyle={styles.bottomSheetContent}>
              {selectedRestaurant && renderRestaurantCard(selectedRestaurant)}
            </ScrollView>
          </BottomSheet>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  bottomSheetContent: {
    padding: 16,
  },
  restaurantCard: {
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: "#f8f8f8", // Light gray background for the title
  },
  restaurantImage: {
    width: "100%",
    height: 200, // Adjust this value as needed
    resizeMode: "cover",
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  restaurantHours: {
    fontSize: 14,
    color: "#666",
  },

  // Existing carousel styles (kept for future reference)
  carouselContainer: {
    width: "100%",
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  safeAreaView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Optional: Add a semi-transparent background
  },
  calloutTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  calloutDescription: {
    marginBottom: 5,
  },
  calloutImage: {
    width: 150,
    height: 150,
  },
  calloutScrollView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  calloutContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    width: 200,
  },
  openButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  openButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    // justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
  centeredView: {
    // flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    // marginTop: 22,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width: "90%",
    height: "20%",
    margin: 20,
    marginBottom: 100,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#2563eb",
  },
  buttonClose: {
    backgroundColor: "#2563eb",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  image: {
    flex: 1,
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 42,
    lineHeight: 84,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#000000c0",
  },
});
