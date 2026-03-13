import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import Colors from "@/constants/colors";
import { useLoan } from "@/context/LoanContext";
import { getTodayPersianDate } from "@/utils/persian";

export default function AddLoanScreen() {
  const C = Colors.light;
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const { addLoan, persons } = useLoan();

  const person = persons.find((p) => p.id === personId);

  const [amount, setAmount] = useState("");
  const [persianDate, setPersianDate] = useState(getTodayPersianDate());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string }>({});

  const validate = () => {
    const errs: { amount?: string } = {};
    const num = parseFloat(amount.replace(/,/g, ""));
    if (!amount.trim() || isNaN(num) || num <= 0) {
      errs.amount = "مبلغ معتبر وارد کنید";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!personId) return;
    setLoading(true);
    try {
      const num = parseFloat(amount.replace(/,/g, ""));
      await addLoan(personId, num, persianDate, note.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const QUICK_AMOUNTS = [1000, 5000, 10000, 50000, 100000];

  return (
    <View style={[styles.container, { backgroundColor: C.surface }]}>
      <View style={styles.handle} />
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: C.text }]}>پرداخت قرض</Text>
          {person && (
            <Text style={[styles.subtitle, { color: C.textSecondary }]}>
              {person.name}
            </Text>
          )}
        </View>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={20} color={C.textSecondary} />
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.form}
      >
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: C.text }]}>مبلغ (افغانی)</Text>
          <TextInput
            style={[
              styles.input,
              styles.amountInput,
              {
                backgroundColor: C.surfaceSecondary,
                color: C.text,
                borderColor: errors.amount ? C.danger : C.primary,
              },
            ]}
            placeholder="0"
            placeholderTextColor={C.textMuted}
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              if (errors.amount) setErrors((e) => ({ ...e, amount: undefined }));
            }}
            keyboardType="numeric"
            returnKeyType="next"
          />
          {errors.amount && (
            <Text style={[styles.errorText, { color: C.danger }]}>
              {errors.amount}
            </Text>
          )}
        </View>

        <View style={styles.quickAmountsRow}>
          {QUICK_AMOUNTS.map((q) => (
            <Pressable
              key={q}
              style={[
                styles.quickBtn,
                {
                  backgroundColor:
                    amount === q.toString()
                      ? C.primary
                      : C.surfaceSecondary,
                  borderColor:
                    amount === q.toString() ? C.primary : C.border,
                },
              ]}
              onPress={() => {
                setAmount(q.toString());
                if (errors.amount)
                  setErrors((e) => ({ ...e, amount: undefined }));
              }}
            >
              <Text
                style={[
                  styles.quickBtnText,
                  {
                    color:
                      amount === q.toString() ? "#fff" : C.textSecondary,
                  },
                ]}
              >
                {q >= 1000 ? q / 1000 + "ک" : q.toString()}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: C.text }]}>تاریخ شمسی</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: C.surfaceSecondary,
                color: C.text,
                borderColor: C.border,
              },
            ]}
            placeholder="1404/01/01"
            placeholderTextColor={C.textMuted}
            value={persianDate}
            onChangeText={setPersianDate}
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: C.text }]}>یادداشت (اختیاری)</Text>
          <TextInput
            style={[
              styles.input,
              styles.noteInput,
              {
                backgroundColor: C.surfaceSecondary,
                color: C.text,
                borderColor: C.border,
              },
            ]}
            placeholder="دلیل یا توضیح قرض..."
            placeholderTextColor={C.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            returnKeyType="done"
          />
        </View>

        <Pressable
          style={[
            styles.saveBtn,
            { backgroundColor: loading ? C.primaryLight : C.accent },
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>ثبت قرض</Text>
            </>
          )}
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 24 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  form: { paddingHorizontal: 24, gap: 20, paddingBottom: 32 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    borderWidth: 1.5,
  },
  amountInput: { fontSize: 28, fontFamily: "Inter_700Bold", textAlign: "center" },
  noteInput: { height: 100, paddingTop: 14 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  quickAmountsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
