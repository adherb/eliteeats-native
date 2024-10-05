import React from "react";
import { useState, useRef, useEffect } from "react";
import Carousel from "react-native-snap-carousel";
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
  Pressable,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
// import { useRestaurantsQuery } from "../../../lib/api";
// import { isOpenNow, convert24HourTo12Hour } from "../../../lib/utils";
// import { useLocation } from "../../../LocationContext";
// import { useSession } from "../../../AuthContext";

const timeZone = "Australia/Brisbane"; // TODO: make this dynamic

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export function Map() {
  const mapRef = useRef(null);
  const carouselRef = useRef(null);
  const markerRefs = useRef([]);

  const [region, setRegion] = useState(null); // Initialize region as null
  const [selectedLocation, setSelectedLocation] = useState(null);

  const router = useRouter();
  const colorScheme = useColorScheme();
  // const { session } = useSession();
  // const userId = session?.user?.id;

  // const { location, radius } = useLocation();
  // const coords = location ? location.coords : null;

  // const { data, error, isLoading } = useRestaurantsQuery(
  //   userId,
  //   undefined,
  //   coords,
  //   radius // Use radius from the hook
  // );

  // useEffect(() => {
  //   if (location) {
  //     setRegion({
  //       latitude: location.coords.latitude,
  //       longitude: location.coords.longitude,
  //       latitudeDelta: 0.0922,
  //       longitudeDelta: 0.0421,
  //     });
  //   }
  // }, [location]);

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
    carouselRef.current.snapToItem(index);
  };

  const SLIDER_WIDTH = Dimensions.get("window").width;
  const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.7); // this determines how much of the next item is visible

  // const handleCarouselItemChange = (index) => {
  //   let location = data.restaurants[index];

  //   mapRef.current.animateToRegion({
  //     latitude: location && Number(location?.latitude),
  //     longitude: location && Number(location?.longitude),
  //     latitudeDelta: 0.09,
  //     longitudeDelta: 0.035,
  //   });

  //   markerRefs.current[index]?.showCallout();
  // };

  // if (isLoading) {
  //   return <Text>Loading...</Text>;
  // }

  // if (isLoading) {
  //   return (
  //     <View style={styles.container}>
  //       <MapView
  //         className="flex-1"
  //         region={region}
  //         key={`${region?.latitude}_${region?.longitude}`}
  //         provider={
  //           Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
  //         }
  //         style={{ flex: 1 }}
  //         ref={mapRef}
  //         scrollEnabled={true}
  //         zoomEnabled={true}
  //         rotateEnabled={true}
  //         pitchEnabled={true}
  //       />
  //       <View style={styles.loadingOverlay}>
  //         <ActivityIndicator size="large" color="grey" />
  //       </View>
  //     </View>
  //   );
  // }

  // This is the carousel restaurant card
  const renderCarouselItem = ({ item }) => (
    <View
      style={{
        // backgroundColor: "floralwhite",
        // height: 200,
        width: ITEM_WIDTH,
        // padding: 10,
      }}
      className="bg-white flex-1 h-52 rounded-xl mb-2 w-full"
    >
      {/* <Pressable onPress={() => router.push(`/restaurant/${item.id}`)}> */}
      <Pressable onPress={() => router.push(`/`)}>
        <View className="flex-row justify-between mb-2 rounded-xl w-full">
          {/* <View className="h-24"> */}
          <View className="w-full flex-1 rounded-xl">
            <View className="relative h-32 w-full rounded-xl">
              <View className="z-10 absolute top-2 left-2 items-center rounded-full bg-[#FF3C41] px-2 py-1 text-sm font-medium text-gray-600">
                <Text className="text-sm font-medium text-white">
                  Up to 20% discount
                </Text>
              </View>
              <Image
                className="rounded-t-xl absolute h-32 w-full transform bg-cover bg-center transition-all duration-500 ease-in-out hover:scale-110"
                //   alt={name}
                // source={{
                //   uri: image,
                // }}
                // source={item.featured_image}
                source="https://onenewchange.com/sites/one_new_change/files/styles/shop_gallery_small/public/images/gallery/gallery_nandos_new_cutlery_2.jpg?itok=ENpDDNnK"
                placeholder={blurhash}
                // contentFit="cover"
                transition={500}
              />
            </View>
            <View className="px-2 mt-1">
              <Text className="text-base font-semibold text-gray-900">
                {/* {item.name} */}
                Name
              </Text>
            </View>
            {/* </View> */}
            <View className="flex-row px-2 mt-1">
              <View className="flex-row items-center">
                <View className="">
                  <Ionicons name="car" size={16} color="#4b5563" />
                </View>
                <View className="ml-1 text-gray-400">
                  <Text className="text-gray-900 text-sm font-bold">
                    {/* {item.distance.toFixed(1)} km */}
                    10 km
                  </Text>
                </View>
              </View>
              <Text className="mx-1 text-gray-500"> {"\u2022"}</Text>
              <View className="flex-row items-center">
                <View className="ml-1">
                  <Text className="text-gray-700 text-sm">
                    {/* {item.price_rating} */}
                    price
                  </Text>
                </View>
              </View>
              <Text className="mx-1 text-gray-500"> {"\u2022"}</Text>
              <View className="ml-1">
                <Text className="text-gray-700 text-sm">
                  {/* {item.average_prep_time} mins */}
                  10 mins
                </Text>
              </View>
            </View>

            <View className="flex-row px-2 mt-1">
              <View className="flex-row items-center">
                <View className="">
                  <Ionicons name="time-outline" size={16} color="#4b5563" />
                </View>
                <View className="ml-1">
                  <Text className="text-green-600 font-semibold text-sm">
                    Open
                  </Text>
                  {/* {isOpenNow(item.opens_at, item.closes_at, timeZone) ? (
                    <Text className="text-green-600 font-semibold text-sm">
                      Open
                    </Text>
                  ) : (
                    <Text className="text-red-600 font-semibold text-sm">
                      Closed
                    </Text>
                  )} */}
                </View>
              </View>
              <Text className="mx-1 text-gray-500"> {"\u2022"}</Text>
              <View className="flex-row items-center">
                {/* <View className="">
                <Ionicons name="time-outline" size={16} color="#4b5563" />
              </View> */}
                <View className="ml-1">
                  <Text className="text-gray-700 text-sm">
                    {/* Closes at {convert24HourTo12Hour(item.closes_at)} */}
                    Closes at
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );

  return (
    <>
      {/* <Text>{JSON.stringify(data)}</Text> */}
      <StatusBar style="dark" />
      <View style={styles.container}>
        <MapView
          className="flex-1"
          region={region}
          // customMapStyle={isDarkMode ? darkMapStyle : []}
          key={`${region?.latitude}_${region?.longitude}`}
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
          style={{ flex: 1 }}
          ref={mapRef}
          scrollEnabled={true}
          zoomEnabled={true}
          rotateEnabled={true}
          pitchEnabled={true}
        >
          {/* {data.restaurants.map((location, index) => (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location && Number(location?.latitude),
                longitude: location && Number(location?.longitude),
              }}
              title={location.name}
              style={{ width: 50, height: 50 }}
              ref={(ref) => (data.restaurants[index].ref = ref)}
              onPress={() => handleMarkerPress(index)}
            >
              <Image
                source={require("../../../assets/images/custom-map-pin.png")}
                className="w-auto h-10"
                onPress={() => handleMarkerPress(index)}
              />
              <Callout tooltip={true} />
            </Marker>
          ))} */}
        </MapView>

        <View
          className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-10"
          pointerEvents="none"
        ></View>

        {/* <View className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-10"></View> */}
        {/* <Carousel
          ref={carouselRef}
          data={data.restaurants}
          renderItem={renderCarouselItem}
          sliderWidth={SLIDER_WIDTH}
          itemWidth={ITEM_WIDTH}
          onSnapToItem={handleCarouselItemChange}
          containerCustomStyle={{ position: "absolute", bottom: 0 }}
          inactiveSlideShift={0}
        /> */}
        <SafeAreaView
          style={{ position: "absolute", top: 0, left: 0, right: 0 }}
        >
          <View style={{ backgroundColor: "" }}></View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Optional: Add a semi-transparent background
  },
  map: {
    // width: "100%",
    // height: "100%",
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
  // container: {
  //   flex: 1,
  // },
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
