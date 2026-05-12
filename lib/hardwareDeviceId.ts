import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";

const HARDWARE_ID_KEY = "hardware_device_id";

export async function getHardwareDeviceId(): Promise<string> {
  // Return cached value first — avoids async overhead on repeat calls
  const cached = await AsyncStorage.getItem(HARDWARE_ID_KEY);
  if (cached) return cached;

  let id: string;

  try {
    if (Platform.OS === "ios") {
      // Stable across reinstalls on the same device, resets on factory reset
      id = (await Application.getIosIdForVendorAsync()) ?? `ios_${Constants.sessionId}_${Date.now()}`;
    } else if (Platform.OS === "android") {
      // Stable unless the user factory-resets or sideloads a different app ID
      id = (await Application.getAndroidId()) ?? `android_${Constants.sessionId}_${Date.now()}`;
    } else {
      id = `web_${Constants.sessionId}_${Date.now()}`;
    }
  } catch {
    // Fall back to a session-scoped ID if the above fails (simulator, etc.)
    id = `fallback_${Constants.sessionId}_${Date.now()}`;
  }

  await AsyncStorage.setItem(HARDWARE_ID_KEY, id);
  return id;
}
