import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LessonCompletedScreen() {
  const router = useRouter();
  const { title, lessonId } = useLocalSearchParams<{ title?: string; lessonId?: string }>();

  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scale]);

  const handleGoHome = () => {
    router.replace({
      pathname: "/",
      params: lessonId ? { completedLessonId: lessonId } : {},
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <Text style={styles.subtitle}>Nice work!</Text>
        <Text style={styles.title}>Lesson complete</Text>
        {title ? <Text style={styles.lessonTitle}>{title}</Text> : null}

        <Animated.View style={[styles.trophyBubble, { transform: [{ scale }] }]}>
          <Text style={styles.trophyEmoji}>🏆</Text>
        </Animated.View>

        <Text style={styles.message}>
          You answered all the questions in this lesson. Keep going to earn more
          XP and unlock new challenges!
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGoHome}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>Let's go!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#58CC02",
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#222222",
  },
  lessonTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#555555",
  },
  trophyBubble: {
    marginTop: 32,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFF3C4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  trophyEmoji: {
    fontSize: 64,
  },
  message: {
    marginTop: 24,
    fontSize: 16,
    color: "#444444",
    textAlign: "center",
  },
  primaryButton: {
    marginTop: 32,
    backgroundColor: "#1CB0F6",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 999,
    borderBottomWidth: 3,
    borderBottomColor: "#1899D6",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});

