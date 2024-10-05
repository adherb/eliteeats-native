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
const sampleRestaurants = [
  {
    id: "1",
    name: "Joe's Pizza",
    latitude: -33.8688,
    longitude: 151.2093,
    image: "https://example.com/joes-pizza.jpg",
    distance: 1.2,
    price_rating: "$$",
    average_prep_time: 20,
    opens_at: "11:00",
    closes_at: "22:00",
  },
  {
    id: "2",
    name: "Sushi Paradise",
    latitude: -33.8701,
    longitude: 151.2055,
    image: "https://example.com/sushi-paradise.jpg",
    distance: 0.8,
    price_rating: "$$$",
    average_prep_time: 25,
    opens_at: "12:00",
    closes_at: "21:30",
  },
  {
    id: "3",
    name: "Burger Bliss",
    latitude: -33.8675,
    longitude: 151.207,
    image: "https://example.com/burger-bliss.jpg",
    distance: 1.5,
    price_rating: "$",
    average_prep_time: 15,
    opens_at: "10:00",
    closes_at: "23:00",
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

  const snapPoints = React.useMemo(() => ["25%", "50%", "75%"], []);

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

  const handleMarkerPress = (index) => {
    bottomSheetRef.current?.snapToIndex(1);
    setSelectedLocation(sampleRestaurants[index]);
  };

  const width = Dimensions.get("window").width;
  const ITEM_WIDTH = Math.round(width * 0.7); // Width of the main item
  const ITEM_HEIGHT = 160;
  const SPACING = 10; // Spacing between items

  const handleCarouselItemChange = (index) => {
    let location = sampleRestaurants[index];

    mapRef.current.animateToRegion({
      latitude: location && Number(location?.latitude),
      longitude: location && Number(location?.longitude),
      latitudeDelta: 0.09,
      longitudeDelta: 0.035,
    });

    markerRefs.current[index]?.showCallout();
  };

  // This is the bottom sheet restaurant card
  const renderRestaurantCard = (item) => (
    <View style={styles.restaurantCard}>
      <Image
        source="https://onenewchange.com/sites/one_new_change/files/styles/shop_gallery_small/public/images/gallery/gallery_nandos_new_cutlery_2.jpg?itok=ENpDDNnK"
        style={styles.restaurantImage}
      />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantDetails}>
          {item.price_rating} • {item.distance} km • {item.average_prep_time}{" "}
          min
        </Text>
        <Text style={styles.restaurantHours}>
          Opens: {item.opens_at} • Closes: {item.closes_at}
        </Text>
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
                ref={(ref) => (markerRefs.current[index] = ref)}
                onPress={() => handleMarkerPress(index)}
              >
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
              {sampleRestaurants.map((restaurant) =>
                renderRestaurantCard(restaurant)
              )}
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
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantImage: {
    width: 100,
    height: 100,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  restaurantDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
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
