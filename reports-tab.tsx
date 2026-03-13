import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";

const REPORT_TYPES = [
  {
    key: "daily",
    label: "گزارش روزانه",
    desc: "قرض‌های امروز",
    icon: "calendar" as const,
  },
  {
    key: "weekly",
    label: "گزارش هفتگی",
    desc: "قرض‌های ۷ روز اخیر",
    icon: "bar-chart-2" as const,
  },
  {
    key: "monthly",
    label: "گزارش ماهانه",
    desc: "قرض‌های ۳۰ روز اخیر",
    icon: "trending-up" as const,
  },
  {
    key: "all",
    label: "گزارش کلی",
    desc: "تمام قرض‌های ثبت شده",
    icon: "layers" as const,
  },
];

export default function ReportsTabScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop:
              Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
          },
        ]}
      >
        <Text style={[styles.title, { color: C.text }]}>گزارش‌ها</Text>
      </View>

      <View style={styles.content}>
        {REPORT_TYPES.map((r) => (
          <Pressable
            key={r.key}
            style={({ pressed }) => [
              styles.reportCard,
              { backgroundColor: C.surface, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/reports?type=${r.key}`);
            }}
          >
            <View style={[styles.iconWrap, { backgroundColor: C.surfaceSecondary }]}>
              <Feather name={r.icon} size={22} color={C.primary} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={[styles.reportLabel, { color: C.text }]}>
                {r.label}
              </Text>
              <Text style={[styles.reportDesc, { color: C.textSecondary }]}>
                {r.desc}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={C.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  content: { paddingHorizontal: 20, gap: 12 },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  reportInfo: { flex: 1 },
  reportLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  reportDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
});
