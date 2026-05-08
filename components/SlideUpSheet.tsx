import { ReactNode, useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

type SlideUpSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function SlideUpSheet({ visible, onClose, children, contentStyle }: SlideUpSheetProps) {
  const translateY = useRef(new Animated.Value(480)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    translateY.setValue(480);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 22,
        stiffness: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.6,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, translateY, visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 480,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={dismiss}>
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#000",
          opacity: backdropOpacity,
        }}
      />

      <Pressable style={{ flex: 1 }} onPress={dismiss} />

      <Animated.View
        style={[
          {
            transform: [{ translateY }],
          },
          contentStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}
