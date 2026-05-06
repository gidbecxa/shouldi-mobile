import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "shouldi-device-id";

export async function getDeviceId() {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const generatedId = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, generatedId);
  return generatedId;
}
