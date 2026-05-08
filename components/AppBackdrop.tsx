import { StyleSheet, View } from "react-native";

// Deep dark backdrop with very subtle violet/indigo ambient glows.
// pointerEvents="none" keeps it fully non-interactive.
export function AppBackdrop() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: -1, backgroundColor: "#09090B" }]}>
      <View style={[styles.glow, styles.glowTopRight]} />
      <View style={[styles.glow, styles.glowCenter]} />
      <View style={[styles.glow, styles.glowBottomLeft]} />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    borderRadius: 999,
  },
  glowTopRight: {
    width: 460,
    height: 460,
    top: -180,
    right: -140,
    backgroundColor: "rgba(139, 92, 246, 0.06)", // violet-500 — brand family
  },
  glowCenter: {
    width: 320,
    height: 320,
    top: "30%",
    left: "20%",
    backgroundColor: "rgba(167, 139, 250, 0.025)", // violet-400, near-invisible depth
  },
  glowBottomLeft: {
    width: 400,
    height: 400,
    bottom: -150,
    left: -110,
    backgroundColor: "rgba(99, 102, 241, 0.05)", // indigo-500 — cool anchor
  },
});

