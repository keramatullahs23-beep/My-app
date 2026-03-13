import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useMemo, useState } from "react";
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

import Colors from "@/constants/colors";
import { useLoan } from "@/context/LoanContext";
import { LoanEntry, Person } from "@/context/LoanContext";
import { formatAmountFull, getTodayPersianDate } from "@/utils/persian";

type ReportType = "daily" | "weekly" | "monthly" | "all";

function getDateRange(type: ReportType): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (type === "daily") {
    // today only
  } else if (type === "weekly") {
    start.setDate(start.getDate() - 6);
  } else if (type === "monthly") {
    start.setDate(start.getDate() - 29);
  } else {
    start.setFullYear(2000, 0, 1);
  }

  return { start, end };
}

const REPORT_LABELS: Record<ReportType, string> = {
  daily: "گزارش روزانه",
  weekly: "گزارش هفتگی",
  monthly: "گزارش ماهانه",
  all: "گزارش کلی",
};

export default function ReportsScreen() {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { type: typeParam } = useLocalSearchParams<{ type?: string }>();
  const { loans, persons } = useLoan();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeType, setActiveType] = useState<ReportType>(
    (typeParam as ReportType) || "all"
  );

  const filteredLoans = useMemo(() => {
    const { start, end } = getDateRange(activeType);
    return loans.filter((l) => {
      const d = new Date(l.createdAt);
      return d >= start && d <= end;
    });
  }, [loans, activeType]);

  const totalAmount = filteredLoans.reduce((s, l) => s + l.amount, 0);

  const byPerson = useMemo(() => {
    const map: Record<string, { person: Person; loans: LoanEntry[]; total: number }> =
      {};
    filteredLoans.forEach((l) => {
      const p = persons.find((x) => x.id === l.personId);
      if (!p) return;
      if (!map[l.personId]) {
        map[l.personId] = { person: p, loans: [], total: 0 };
      }
      map[l.personId].loans.push(l);
      map[l.personId].total += l.amount;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredLoans, persons]);

  const generatePDF = async () => {
    setPdfLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const rows = byPerson
        .map(
          ({ person, loans: pLoans, total }) => `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #eee;">${person.name}</td>
            <td style="padding:10px;border-bottom:1px solid #eee;">${person.phone}</td>
            <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${pLoans.length}</td>
            <td style="padding:10px;border-bottom:1px solid #eee;color:#E53935;font-weight:bold;">${formatAmountFull(total)}</td>
          </tr>
          ${pLoans
            .map(
              (l) => `
          <tr style="background:#fafafa;">
            <td colspan="2" style="padding:6px 10px 6px 28px;font-size:12px;color:#555;">${l.persianDate} — ${l.note || "بدون یادداشت"}</td>
            <td></td>
            <td style="padding:6px 10px;font-size:12px;color:#E53935;">${formatAmountFull(l.amount)}</td>
          </tr>
          `
            )
            .join("")}
        `
        )
        .join("");

      const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="utf-8" />
          <title>${REPORT_LABELS[activeType]}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap');
            body { font-family: 'Vazirmatn', Arial, sans-serif; direction: rtl; background: #fff; color: #111; margin: 0; padding: 0; }
            .header { background: #1A6B3C; color: white; padding: 32px 40px; }
            .header h1 { margin: 0 0 4px; font-size: 24px; }
            .header p { margin: 0; opacity: 0.8; font-size: 14px; }
            .summary { display: flex; gap: 20px; padding: 24px 40px; background: #f8f9fa; border-bottom: 1px solid #eee; }
            .stat { flex: 1; }
            .stat .value { font-size: 22px; font-weight: 700; color: #1A6B3C; }
            .stat .label { font-size: 12px; color: #666; margin-top: 2px; }
            .table-wrap { padding: 20px 40px 40px; }
            table { width: 100%; border-collapse: collapse; }
            thead tr { background: #1A6B3C; color: white; }
            thead th { padding: 12px 10px; text-align: right; font-weight: 600; }
            .total-row { background: #fff3e0; font-weight: 700; font-size: 16px; }
            .total-row td { padding: 14px 10px; border-top: 2px solid #F0A500; }
            .footer { text-align: center; color: #999; font-size: 12px; padding: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${REPORT_LABELS[activeType]}</h1>
            <p>تاریخ تهیه: ${getTodayPersianDate()}</p>
          </div>
          <div class="summary">
            <div class="stat">
              <div class="value">${formatAmountFull(totalAmount)}</div>
              <div class="label">مجموع کل</div>
            </div>
            <div class="stat">
              <div class="value">${byPerson.length} نفر</div>
              <div class="label">تعداد افراد</div>
            </div>
            <div class="stat">
              <div class="value">${filteredLoans.length} مورد</div>
              <div class="label">تعداد قرض‌ها</div>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>نام</th>
                  <th>تلفون</th>
                  <th>تعداد قرض</th>
                  <th>مجموع</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="total-row">
                  <td colspan="3">مجموع کل</td>
                  <td>${formatAmountFull(totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="footer">سیستم مدیریت قرض • ${getTodayPersianDate()}</div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: REPORT_LABELS[activeType],
          UTI: "com.adobe.pdf",
        });
      } else {
        await Print.printAsync({ html });
      }
    } catch (e) {
      console.error("PDF error:", e);
    } finally {
      setPdfLoading(false);
    }
  };

  const TYPES: ReportType[] = ["daily", "weekly", "monthly", "all"];
  const TYPE_LABELS: Record<ReportType, string> = {
    daily: "روزانه",
    weekly: "هفتگی",
    monthly: "ماهانه",
    all: "کلی",
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
        <Text style={[styles.headerTitle, { color: C.text }]}>
          {REPORT_LABELS[activeType]}
        </Text>
        <Pressable
          style={[styles.pdfBtn, { backgroundColor: C.primary }]}
          onPress={generatePDF}
          disabled={pdfLoading}
        >
          {pdfLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Feather name="download" size={16} color="#fff" />
          )}
        </Pressable>
      </View>

      <View style={styles.typeTabs}>
        {TYPES.map((t) => (
          <Pressable
            key={t}
            style={[
              styles.typeTab,
              {
                backgroundColor:
                  activeType === t ? C.primary : C.surface,
                borderColor: activeType === t ? C.primary : C.border,
              },
            ]}
            onPress={() => setActiveType(t)}
          >
            <Text
              style={[
                styles.typeTabText,
                { color: activeType === t ? "#fff" : C.textSecondary },
              ]}
            >
              {TYPE_LABELS[t]}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.summaryCard, { backgroundColor: C.primary }]}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{formatAmountFull(totalAmount)}</Text>
          <Text style={styles.summaryLabel}>مجموع</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{byPerson.length}</Text>
          <Text style={styles.summaryLabel}>نفر</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{filteredLoans.length}</Text>
          <Text style={styles.summaryLabel}>قرض</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 + 20 : 40,
          },
        ]}
      >
        {byPerson.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={52} color={C.border} />
            <Text style={[styles.emptyText, { color: C.textSecondary }]}>
              هیچ قرضی در این بازه نیست
            </Text>
          </View>
        ) : (
          byPerson.map(({ person, loans: pLoans, total }) => (
            <View
              key={person.id}
              style={[styles.personGroup, { backgroundColor: C.surface }]}
            >
              <View style={styles.personGroupHeader}>
                <View
                  style={[styles.avatar, { backgroundColor: C.surfaceSecondary }]}
                >
                  <Text style={[styles.avatarText, { color: C.primary }]}>
                    {person.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.personGroupInfo}>
                  <Text style={[styles.personName, { color: C.text }]}>
                    {person.name}
                  </Text>
                  <Text style={[styles.personPhone, { color: C.textSecondary }]}>
                    {person.phone}
                  </Text>
                </View>
                <Text style={[styles.personTotal, { color: C.danger }]}>
                  {formatAmountFull(total)}
                </Text>
              </View>

              {pLoans.map((loan, i) => (
                <View
                  key={loan.id}
                  style={[
                    styles.loanRow,
                    i < pLoans.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: C.border,
                    },
                  ]}
                >
                  <Text style={[styles.loanDate, { color: C.textSecondary }]}>
                    {loan.persianDate}
                  </Text>
                  {loan.note ? (
                    <Text
                      style={[styles.loanNote, { color: C.text }]}
                      numberOfLines={1}
                    >
                      {loan.note}
                    </Text>
                  ) : null}
                  <Text style={[styles.loanAmount, { color: C.danger }]}>
                    {formatAmountFull(loan.amount)}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  pdfBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  typeTabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  typeTabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    marginBottom: 16,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  content: { paddingHorizontal: 20, gap: 12 },
  emptyContainer: { alignItems: "center", paddingTop: 80, gap: 16 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  personGroup: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  personGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  personGroupInfo: { flex: 1 },
  personName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  personPhone: { fontSize: 12, fontFamily: "Inter_400Regular" },
  personTotal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  loanRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingLeft: 68,
    gap: 8,
  },
  loanDate: { fontSize: 12, fontFamily: "Inter_400Regular", minWidth: 80 },
  loanNote: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  loanAmount: { fontSize: 13, fontFamily: "Inter_700Bold" },
});
