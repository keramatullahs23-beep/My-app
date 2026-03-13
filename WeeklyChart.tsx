import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { formatAmount } from "@/utils/persian";

interface DayData {
  day: string;
  total: number;
}

interface WeeklyChartProps {
  data: DayData[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const C = Colors.light;
  const maxValue = Math.max(...data.map((d) => d.total), 1);
  const today = new Date().getDay();
  const days = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
  const todayLabel = days[today];

  return (
    <View style={styles.container}>
      <View style={styles.chartArea}>
        {data.map((item, index) => {
          const barHeight = Math.max((item.total / maxValue) * 120, 4);
          const isToday = item.day === todayLabel && index === data.length - 1;

          return (
            <View key={index} style={styles.barColumn}>
              {item.total > 0 && (
                <Text style={[styles.valueLabel, { color: C.textSecondary }]}>
                  {formatAmount(item.total)}
                </Text>
              )}
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: isToday
                        ? C.primary
                        : item.total > 0
                        ? C.primaryLight
                        : C.border,
                      opacity: isToday ? 1 : item.total > 0 ? 0.7 : 0.3,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isToday ? C.primary : C.textSecondary,
                    fontFamily: isToday ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 160,
    paddingHorizontal: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 28,
    borderRadius: 6,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 6,
  },
  valueLabel: {
    fontSize: 9,
    marginBottom: 4,
    textAlign: "center",
  },
});
