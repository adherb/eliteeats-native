// import { Image, StyleSheet, Platform } from 'react-native';

// import { HelloWave } from '@/components/HelloWave';
// import ParallaxScrollView from '@/components/ParallaxScrollView';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';

// export default function HomeScreen() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
//       headerImage={
//         <Image
//           source={require('@/assets/images/partial-react-logo.png')}
//           style={styles.reactLogo}
//         />
//       }>
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Welcome!</ThemedText>
//         <HelloWave />
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 1: Try it</ThemedText>
//         <ThemedText>
//           Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
//           Press{' '}
//           <ThemedText type="defaultSemiBold">
//             {Platform.select({ ios: 'cmd + d', android: 'cmd + m' })}
//           </ThemedText>{' '}
//           to open developer tools.
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 2: Explore</ThemedText>
//         <ThemedText>
//           Tap the Explore tab to learn more about what's included in this starter app.
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
//         <ThemedText>
//           When you're ready, run{' '}
//           <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
//           <ThemedText type="defaultSemiBold">app-example</ThemedText>.
//         </ThemedText>
//       </ThemedView>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
// });

import React from "react";
import { useState } from "react";
import { ListView } from "../../../components/ListView";
import { Stack, useRouter } from "expo-router";
import { Map } from "../../../features/search/components/Map";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const router = useRouter();
  const [toggleView, setToggleView] = useState(false);

  const headerTitleColour = "black";
  const backgroundColour = "white";
  const backButtonColour = "black";

  const latitude = 43.0389025;
  const longitude = -87.9064736;

  // console.log("LAT", latitude);
  // console.log("LONG", longitude);

  const [lat, setLat] = useState(latitude);
  const [lng, setLng] = useState(longitude);
  const [radius, setRadius] = useState(5); // Set initial radius to 5km
  const [locations, setLocations] = useState([]);

  return (
    <>
      {/* <SafeAreaView className="" /> */}
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
      {toggleView ? (
        <Text>List View</Text>
      ) : (
        // <ListView setToggleView={setToggleView} />
        <Text>Map View</Text>
        // <Map setToggleView={setToggleView} markers={locations} />
      )}
      <View className="absolute top-14 left-0 right-0 flex-row mx-2">
        <Pressable
          className="flex-1"
          onPress={() => router.push("/search-location")}
        >
          <View>
            <View>
              <View
                className={clsx(
                  "px-4 w-full rounded-full opacity-100 flex flex-row items-center justify-center h-12", // Added h-12 for consistent height
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
                  Search Harty
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
        <Pressable
          onPress={() => setToggleView(!toggleView)}
          className={clsx(
            "rounded-full p-2.5 ml-1 flex items-center justify-center h-12 w-12",
            {
              "bg-gray-100": toggleView,
              "bg-white": !toggleView,
            }
          )}
        >
          <Ionicons
            name={toggleView ? "map-outline" : "list"}
            color="black"
            size={20}
          />
        </Pressable>
      </View>
      <StatusBar style="light" />
    </>
  );
}
