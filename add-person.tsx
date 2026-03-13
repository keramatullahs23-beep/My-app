import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useLoan } from "@/context/LoanContext";

export default function AddPersonScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { addPerson } = useLoan();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validate = () => {
    const errs: { name?: string; phone?: string } = {};
    if (!name.trim()) errs.name = "نام الزامی است";
    if (!phone.trim()) errs.phone = "شماره تلفون الزامی است";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    try {
      await addPerson(name.trim(), phone.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.surface }]}>
      <View style={styles.handle} />
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: C.text }]}>افزودن فرد</Text>
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
          <Text style={[styles.label, { color: C.text }]}>نام فرد</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: C.surfaceSecondary,
                color: C.text,
                borderColor: errors.name ? C.danger : C.border,
              },
            ]}
            placeholder="نام و تخلص..."
            placeholderTextColor={C.textMuted}
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
            }}
            returnKeyType="next"
          />
          {errors.name && (
            <Text style={[styles.errorText, { color: C.danger }]}>
              {errors.name}
            </Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: C.text }]}>شماره تلفون</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: C.surfaceSecondary,
                color: C.text,
                borderColor: errors.phone ? C.danger : C.border,
              },
            ]}
            placeholder="07xx xxx xxxx"
            placeholderTextColor={C.textMuted}
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
            }}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          {errors.phone && (
            <Text style={[styles.errorText, { color: C.danger }]}>
              {errors.phone}
            </Text>
          )}
        </View>

        <Pressable
          style={[
            styles.saveBtn,
            { backgroundColor: loading ? C.primaryLight : C.primary },
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="check" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>ثبت فرد</Text>
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
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
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
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
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
