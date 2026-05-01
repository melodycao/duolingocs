import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  featherGreen: "#58CC02",
  maskGreen: "#89E219",
  eel: "#4B4B4B",
  snow: "#FFFFFF",
  macaw: "#1CB0F6", // turquoise
  flamingo: "#FF79C6", // pink
  cardinal: "#FF4B4B",
  bee: "#FFC800",
  fox: "#FF9600",
  wolf: "#777777",
  hare: "#AFAFAF",
  swan: "#E5E5E5",
  polar: "#F7F7F7",
};

type LessonType = "current" | "completed" | "locked" | "chest" | "boss";

type LessonConfig = {
  id: string;
  label?: string;
};

type SectionConfig = {
  id: number;
  name: string;
  colorType: "turquoise" | "pink";
  subtitle: string;
  lessons: LessonConfig[];
};

const SECTIONS: SectionConfig[] = [
  {
    id: 1,
    name: "Unit 1: The Logic of Instructions",
    colorType: "turquoise",
    subtitle: "Algorithms and Decomposition",
    lessons: [
      { id: "1-1", label: "Step-by-Step" },
      { id: "1-2", label: "Breaking Things" },
      { id: "1-3", label: "Fixing the Recipe" },
    ],
  },
  {
    id: 2,
    name: "Unit 2: Storing Information",
    colorType: "pink",
    subtitle: "Variables and Data Types",
    lessons: [
      { id: "2-1", label: "Labeled Box" },
      { id: "2-2", label: "Numbers vs Words" },
      { id: "2-3", label: "True or False" },
    ],
  },
  {
    id: 3,
    name: "Unit 3: Making Decisions",
    colorType: "turquoise",
    subtitle: "Conditionals and Logic",
    lessons: [
      { id: "3-1", label: "If This Then That" },
      { id: "3-2", label: "Otherwise Clause" },
      { id: "3-3", label: "AND / OR Logic" },
      { id: "3-4", label: "If/Elif/Else Typing" },
    ],
  },
  {
    id: 4,
    name: "Unit 4: Efficiency through Repetition",
    colorType: "pink",
    subtitle: "Loops and Patterns",
    lessons: [
      { id: "4-1", label: "Repeat Button" },
      { id: "4-2", label: "Keep Going Until..." },
      { id: "4-4", label: "List Boss Challenge" },
    ],
  },
];

const TESTING_UNLOCK_ALL_LEVELS_DEFAULT = ["true", "1", "yes", "on"].includes(
  (process.env.EXPO_PUBLIC_UNLOCK_ALL_LEVELS ?? "").toLowerCase()
);

type LessonNodeProps = {
  type: LessonType;
  label?: string;
  onPress: () => void;
};

function LessonNode({ type, label, onPress }: LessonNodeProps) {
  const isLocked = type === "locked";

  return (
    <View style={styles.nodeContainer}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.8}
        style={[
          styles.nodeCircle,
          type === "completed" && {
            backgroundColor: COLORS.featherGreen,
            borderBottomColor: "#46A302",
          },
          type === "current" && {
            backgroundColor: COLORS.bee,
            borderBottomColor: "#E5A500",
          },
          type === "chest" && {
            backgroundColor: COLORS.macaw,
            borderBottomColor: "#1899D6",
          },
          type === "boss" && {
            backgroundColor: COLORS.cardinal,
            borderBottomColor: "#D33131",
          },
          isLocked && {
            backgroundColor: COLORS.swan,
            borderBottomColor: COLORS.hare,
          },
        ]}
      >
        <Text style={styles.nodeIcon}>
          {isLocked
            ? "🔒"
            : type === "chest"
            ? "🎁"
            : type === "boss"
            ? "👑"
            : "★"}
        </Text>
      </TouchableOpacity>
      {label && <Text style={styles.nodeLabel}>{label}</Text>}
    </View>
  );
}

export default function Index() {
  const { completedLessonId } = useLocalSearchParams<{ completedLessonId?: string }>();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<number>(1);
  const [selectedLesson, setSelectedLesson] = useState<LessonConfig | null>(
    null
  );
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [unlockAllForTesting, setUnlockAllForTesting] = useState(TESTING_UNLOCK_ALL_LEVELS_DEFAULT);

  useEffect(() => {
    if (!completedLessonId) return;
    setCompletedLessonIds((prev) => (prev.includes(completedLessonId) ? prev : [...prev, completedLessonId]));
  }, [completedLessonId]);

  const lessonOrder = useMemo(() => SECTIONS.flatMap((section) => section.lessons.map((lesson) => lesson.id)), []);
  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);

  const getLessonType = (lessonId: string): LessonType => {
    if (completedSet.has(lessonId)) return "completed";
    if (unlockAllForTesting) return "current";
    const idx = lessonOrder.indexOf(lessonId);
    if (idx <= 0) return "current";
    const previousLessonId = lessonOrder[idx - 1];
    return completedSet.has(previousLessonId) ? "current" : "locked";
  };

  const currentSection =
    SECTIONS.find((s) => s.id === currentSectionId) ?? SECTIONS[0];

  const isTurquoise = currentSection.colorType === "turquoise";
  const sectionPrimaryColor = isTurquoise ? COLORS.macaw : COLORS.flamingo;
  const sectionPrimaryBorder = isTurquoise ? "#1899D6" : "#E25EA9";

  const getLessonDisplayName = (lesson: LessonConfig): string => {
    if (lesson.label) return lesson.label;
    return `Lesson ${lesson.id}`;
  };

  const handleNodePress = (lesson: LessonConfig) => {
    setSelectedLesson(lesson);
  };

  const handleStartLesson = (lesson: LessonConfig) => {
    const title = getLessonDisplayName(lesson);
    setSelectedLesson(null);
    router.push({
      pathname: "/lesson/[lessonId]",
      params: { lessonId: lesson.id, title },
    });
  };

  const handleSectionSelect = (sectionId: number) => {
    setCurrentSectionId(sectionId);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* FULL SCREEN SECTION SWITCHER */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choose Section</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={{ padding: 20 }}>
            {SECTIONS.map((sec, index) => {
              const isActive = sec.id === currentSectionId;
              const isTurq = sec.colorType === "turquoise";
              const bg = isTurq ? COLORS.macaw : COLORS.flamingo;
              const border = isTurq ? "#1899D6" : "#E25EA9";

              return (
                <TouchableOpacity
                  key={sec.id}
                  style={[
                    styles.sectionOption,
                    {
                      backgroundColor: bg,
                      borderColor: border,
                      borderBottomColor: border,
                      opacity: isActive ? 1 : 0.9,
                    },
                  ]}
                  onPress={() => handleSectionSelect(sec.id)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.sectionOptionText, { color: COLORS.snow }]}>
                    {sec.name}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      marginTop: 4,
                      fontWeight: "600",
                    }}
                  >
                    {sec.subtitle}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      marginTop: 8,
                      fontSize: 12,
                    }}
                  >
                    {`Lessons: ${sec.lessons.length}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <View style={styles.root}>
        {/* RESOURCE BAR */}
        <View style={styles.resourceBar}>
          <Text style={[styles.resourceValue, { color: COLORS.fox }]}>🔥 10</Text>
          <Text style={[styles.resourceValue, { color: COLORS.macaw }]}>
            💎 2667
          </Text>
          <Text style={[styles.resourceValue, { color: COLORS.cardinal }]}>
            ❤️ 25
          </Text>
        </View>
        <View style={styles.devToggleRow}>
          <Text style={styles.devToggleLabel}>Testing Unlock Mode</Text>
          <TouchableOpacity
            onPress={() => setUnlockAllForTesting((v) => !v)}
            style={[
              styles.devToggleButton,
              unlockAllForTesting && styles.devToggleButtonOn,
            ]}
            activeOpacity={0.85}
          >
            <Text style={styles.devToggleButtonText}>
              {unlockAllForTesting ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* UNIT / SECTION BANNER BUTTON */}
        <TouchableOpacity
          style={[
            styles.unitHeader,
            {
              backgroundColor: sectionPrimaryColor,
              borderBottomColor: sectionPrimaryBorder,
            },
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.9}
        >
          <View style={styles.unitTextContainer}>
            <Text style={styles.unitSectionText}>
              {currentSection.name.toUpperCase()}
            </Text>
            <Text style={styles.unitTitleText}>{currentSection.subtitle}</Text>
          </View>
          <View style={styles.unitButtonInner}>
            <Text style={styles.unitButtonIcon}>≡</Text>
          </View>
        </TouchableOpacity>

        {/* SCROLLABLE MAP – PER SECTION */}
        <ScrollView
          contentContainerStyle={styles.mapScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentSection.lessons.map((lesson) => {
            const lessonType = getLessonType(lesson.id);
            return (
              <LessonNode
                key={lesson.id}
                type={lessonType}
                label={lesson.label}
                onPress={() => handleNodePress(lesson)}
              />
            );
          })}
        </ScrollView>
        {selectedLesson && (
          <View style={styles.lessonPreviewOverlay} pointerEvents="box-none">
            <View style={styles.lessonPreviewCard}>
              <Text style={styles.lessonPreviewTitle}>
                {getLessonDisplayName(selectedLesson)}
              </Text>
              <View style={styles.lessonPreviewActions}>
                <TouchableOpacity
                  onPress={() => setSelectedLesson(null)}
                  style={styles.lessonPreviewSecondaryButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.lessonPreviewSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleStartLesson(selectedLesson)}
                  style={styles.lessonPreviewPrimaryButton}
                  activeOpacity={0.9}
                >
                  <Text style={styles.lessonPreviewPrimaryText}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.snow },
  root: { flex: 1, paddingHorizontal: 16 },
  resourceBar: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12 },
  resourceValue: { fontWeight: "800", fontSize: 18 },
  devToggleRow: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  devToggleLabel: {
    color: COLORS.wolf,
    fontSize: 12,
    fontWeight: "700",
  },
  devToggleButton: {
    backgroundColor: COLORS.swan,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  devToggleButtonOn: {
    backgroundColor: COLORS.featherGreen,
  },
  devToggleButtonText: {
    color: COLORS.snow,
    fontWeight: "800",
    fontSize: 12,
  },
  
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.featherGreen,
    borderRadius: 15,
    padding: 16,
    borderBottomWidth: 5,
    borderBottomColor: "#46A302",
  },
  unitTextContainer: { flex: 1 },
  unitSectionText: { fontSize: 12, fontWeight: "800", color: "rgba(255,255,255,0.7)" },
  unitTitleText: { fontSize: 18, fontWeight: "800", color: COLORS.snow },
  unitButtonInner: { width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  unitButtonIcon: { color: COLORS.snow, fontSize: 24, fontWeight: "bold" },

  mapScrollContent: { alignItems: "center", paddingBottom: 100, paddingTop: 20 },
  nodeContainer: { alignItems: "center", marginVertical: 15 },
  nodeCircle: {
    width: 80,
    height: 72,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 8,
  },
  nodeIcon: { fontSize: 32, color: COLORS.snow },
  nodeLabel: { marginTop: 8, fontWeight: "800", color: COLORS.eel, textTransform: "uppercase" },

  // Modal Styles
  fullScreenModal: { flex: 1, backgroundColor: COLORS.snow },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    borderBottomWidth: 2, 
    borderBottomColor: COLORS.swan 
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.eel },
  closeX: { fontSize: 22, fontWeight: '800', color: COLORS.hare },
  sectionOption: { 
    padding: 20, 
    borderRadius: 15, 
    borderWidth: 2, 
    borderColor: COLORS.swan, 
    marginBottom: 15, 
    borderBottomWidth: 5 
  },
  sectionOptionText: { fontWeight: '800', color: COLORS.eel, fontSize: 16 },

  lessonPreviewOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 140,
    alignItems: "center",
  },
  lessonPreviewCard: {
    backgroundColor: COLORS.snow,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    minWidth: 220,
    maxWidth: 260,
  },
  lessonPreviewTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.eel,
    marginBottom: 10,
    textAlign: "center",
  },
  lessonPreviewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lessonPreviewSecondaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  lessonPreviewSecondaryText: {
    color: COLORS.hare,
    fontWeight: "700",
    fontSize: 14,
  },
  lessonPreviewPrimaryButton: {
    backgroundColor: COLORS.featherGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderBottomWidth: 3,
    borderBottomColor: "#46A302",
  },
  lessonPreviewPrimaryText: {
    color: COLORS.snow,
    fontWeight: "800",
    fontSize: 14,
  },
});