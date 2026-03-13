import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WeeklyChart } from "@/components/WeeklyChart";
import Colors from "@/constants/colors";
import { useLoan } from "@/context/LoanContext";
import { formatAmountFull } from "@/utils/persian";

export default function HomeScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { persons, loans, getDailyTotals, getPersonTotal, isLoading } =
    useLoan();

  const weeklyData = getDailyTotals();
  const totalAll = loans.reduce((sum, l) => sum + l.amount, 0);

  const topDebtors = [...persons]
    .map((p) => ({ ...p, total: getPersonTotal(p.id) }))
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop:
            Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
          paddingHorizontal: 20,
        }}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: C.textSecondary }]}>
              مدیریت قرض
            </Text>
            <Text style={[styles.title, { color: C.text }]}>داشبورد</Text>
          </View>
          <Pressable
            style={[styles.reportBtn, { backgroundColor: C.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/reports");
            }}
          >
            <Feather name="file-text" size={16} color="#fff" />
          </Pressable>
        </View>

        <View style={[styles.totalCard, { backgroundColor: C.primary }]}>
          <Text style={styles.totalLabel}>مجموع کل قرض‌ها</Text>
          <Text style={styles.totalAmount}>{formatAmountFull(totalAll)}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{persons.length}</Text>
              <Text style={styles.statLabel}>نفر</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{loans.length}</Text>
              <Text style={styles.statLabel}>قرض</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: C.surface }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>
            هفت روز اخیر
          </Text>
          <WeeklyChart data={weeklyData} />
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: C.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/add-person");
            }}
          >
            <Feather name="user-plus" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>افزودن فرد</Text>
          </Pressable>

          <Pressable
            style={[
              styles.actionBtn,
              { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.primary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/persons");
            }}
          >
            <Feather name="users" size={20} color={C.primary} />
            <Text style={[styles.actionBtnText, { color: C.primary }]}>
              لیست افراد
            </Text>
          </Pressable>
        </View>

        {topDebtors.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: C.text }]}>
              بیشترین بدهکاران
            </Text>
            {topDebtors.map((person, index) => (
              <Pressable
                key={person.id}
                style={[styles.debtorRow, { backgroundColor: C.surface }]}
                onPress={() => router.push(`/person/${person.id}`)}
              >
                <View
                  style={[styles.rankBadge, { backgroundColor: C.surfaceSecondary }]}
                >
                  <Text style={[styles.rankText, { color: C.textSecondary }]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.debtorInfo}>
                  <Text style={[styles.debtorName, { color: C.text }]}>
                    {person.name}
                  </Text>
                  <Text style={[styles.debtorPhone, { color: C.textSecondary }]}>
                    {person.phone}
                  </Text>
                </View>
                <Text style={[styles.debtorAmount, { color: C.danger }]}>
                  {formatAmountFull(person.total)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {persons.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: C.surface }]}>
            <Feather name="users" size={48} color={C.border} />
            <Text style={[styles.emptyTitle, { color: C.text }]}>
              هیچ فردی ثبت نشده
            </Text>
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>
              با زدن دکمه افزودن فرد شروع کنید
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 2 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  reportBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  totalCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  totalLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  totalAmount: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  statItem: { alignItems: "center" },
  statValue: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  debtorRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  debtorInfo: { flex: 1 },
  debtorName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  debtorPhone: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  debtorAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  emptyState: {
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
