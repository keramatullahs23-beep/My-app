import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useLoan } from "@/context/LoanContext";
import { formatAmountFull } from "@/utils/persian";

export default function PersonsScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { persons, getPersonTotal, removePerson } = useLoan();
  const [search, setSearch] = useState("");

  const filtered = persons.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "حذف فرد",
      `آیا می‌خواهید ${name} را حذف کنید؟ تمام قرض‌های مرتبط نیز حذف خواهند شد.`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            removePerson(id);
          },
        },
      ]
    );
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
        <Text style={[styles.title, { color: C.text }]}>لیست افراد</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: C.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/add-person");
          }}
        >
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={[styles.searchContainer, { marginHorizontal: 20, marginBottom: 12 }]}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <Feather name="search" size={16} color={C.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: C.text }]}
            placeholder="جستجو..."
            placeholderTextColor={C.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 + 84 : 100,
          },
        ]}
        renderItem={({ item }) => {
          const total = getPersonTotal(item.id);
          return (
            <Pressable
              style={({ pressed }) => [
                styles.personCard,
                { backgroundColor: C.surface, opacity: pressed ? 0.95 : 1 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/person/${item.id}`);
              }}
              onLongPress={() => handleDelete(item.id, item.name)}
            >
              <View
                style={[styles.avatar, { backgroundColor: C.surfaceSecondary }]}
              >
                <Text style={[styles.avatarText, { color: C.primary }]}>
                  {item.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.personInfo}>
                <Text style={[styles.personName, { color: C.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.personPhone, { color: C.textSecondary }]}>
                  {item.phone}
                </Text>
              </View>
              <View style={styles.personRight}>
                {total > 0 ? (
                  <Text style={[styles.personTotal, { color: C.danger }]}>
                    {formatAmountFull(total)}
                  </Text>
                ) : (
                  <Text style={[styles.personZero, { color: C.success }]}>
                    تسویه
                  </Text>
                )}
                <Feather name="chevron-right" size={16} color={C.textMuted} />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="users" size={52} color={C.border} />
            <Text style={[styles.emptyTitle, { color: C.text }]}>
              {search ? "فردی یافت نشد" : "هیچ فردی ثبت نشده"}
            </Text>
            {!search && (
              <Pressable
                style={[styles.emptyBtn, { backgroundColor: C.primary }]}
                onPress={() => router.push("/add-person")}
              >
                <Text style={styles.emptyBtnText}>افزودن فرد</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {},
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  listContent: { paddingHorizontal: 20 },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { fontSize: 20, fontFamily: "Inter_700Bold" },
  personInfo: { flex: 1 },
  personName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  personPhone: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  personRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  personTotal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  personZero: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
    gap: 16,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
