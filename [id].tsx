import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useLoan } from "@/context/LoanContext";
import { formatAmountFull } from "@/utils/persian";

export default function PersonDetailScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { persons, getPersonTotal, getLoansForPerson, removeLoan } = useLoan();

  const person = persons.find((p) => p.id === id);
  const loans = getLoansForPerson(id || "");
  const total = getPersonTotal(id || "");

  if (!person) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Text style={{ color: C.text }}>فرد پیدا نشد</Text>
      </View>
    );
  }

  const handleDeleteLoan = (loanId: string) => {
    Alert.alert("حذف قرض", "آیا می‌خواهید این قرض را حذف کنید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          removeLoan(loanId);
        },
      },
    ]);
  };

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
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>جزئیات قرض</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={loans}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!loans.length}
        ListHeaderComponent={
          <View>
            <View style={[styles.profileCard, { backgroundColor: C.primary }]}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {person.name.charAt(0)}
                </Text>
              </View>
              <Text style={styles.personName}>{person.name}</Text>
              <Text style={styles.personPhone}>{person.phone}</Text>
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>مجموع قرض</Text>
                <Text style={styles.totalAmount}>{formatAmountFull(total)}</Text>
              </View>
            </View>

            <Pressable
              style={[styles.addLoanBtn, { backgroundColor: C.accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(`/add-loan/${id}`);
              }}
            >
              <Feather name="plus-circle" size={20} color="#fff" />
              <Text style={styles.addLoanBtnText}>پرداخت قرض جدید</Text>
            </Pressable>

            {loans.length > 0 && (
              <Text style={[styles.sectionTitle, { color: C.text }]}>
                تاریخچه قرض‌ها
              </Text>
            )}
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 + 20 : 40,
          },
        ]}
        renderItem={({ item, index }) => (
          <Pressable
            onLongPress={() => handleDeleteLoan(item.id)}
            style={[styles.loanItem, { backgroundColor: C.surface }]}
          >
            <View
              style={[styles.loanIndex, { backgroundColor: C.surfaceSecondary }]}
            >
              <Text style={[styles.loanIndexText, { color: C.textSecondary }]}>
                {index + 1}
              </Text>
            </View>
            <View style={styles.loanInfo}>
              <Text style={[styles.loanDate, { color: C.textSecondary }]}>
                {item.persianDate}
              </Text>
              {item.note ? (
                <Text style={[styles.loanNote, { color: C.text }]}>
                  {item.note}
                </Text>
              ) : null}
            </View>
            <Text style={[styles.loanAmount, { color: C.danger }]}>
              {formatAmountFull(item.amount)}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="credit-card" size={48} color={C.border} />
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>
              هیچ قرضی ثبت نشده
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  listContent: { paddingHorizontal: 20 },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  personName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  personPhone: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 20,
  },
  totalBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "center",
    width: "100%",
  },
  totalLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  totalAmount: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  addLoanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 24,
  },
  addLoanBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  loanItem: {
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
  loanIndex: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  loanIndexText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  loanInfo: { flex: 1 },
  loanDate: { fontSize: 13, fontFamily: "Inter_400Regular" },
  loanNote: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 2 },
  loanAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  emptyContainer: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
