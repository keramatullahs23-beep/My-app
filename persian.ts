export function getTodayPersianDate(): string {
  const now = new Date();
  const gregorianYear = now.getFullYear();
  const gregorianMonth = now.getMonth() + 1;
  const gregorianDay = now.getDate();

  let jYear: number, jMonth: number, jDay: number;

  const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  let gy = gregorianYear - 1600;
  let gm = gregorianMonth - 1;
  let gd = gregorianDay - 1;

  let g_day_no =
    365 * gy +
    Math.floor((gy + 3) / 4) -
    Math.floor((gy + 99) / 100) +
    Math.floor((gy + 399) / 400);

  for (let i = 0; i < gm; ++i) {
    g_day_no += g_days_in_month[i];
  }

  if (gm > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) {
    ++g_day_no;
  }

  g_day_no += gd;

  let j_day_no = g_day_no - 79;

  let j_np = Math.floor(j_day_no / 12053);
  j_day_no %= 12053;

  jYear = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);

  j_day_no %= 1461;

  if (j_day_no >= 366) {
    jYear += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }

  let i: number;
  for (i = 0; i < 11 && j_day_no >= j_days_in_month[i]; ++i) {
    j_day_no -= j_days_in_month[i];
  }

  jMonth = i + 1;
  jDay = j_day_no + 1;

  return `${jYear}/${String(jMonth).padStart(2, "0")}/${String(jDay).padStart(2, "0")}`;
}

export function formatAmount(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1) + " میلیون";
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + " هزار";
  }
  return amount.toLocaleString("fa-IR");
}

export function formatAmountFull(amount: number): string {
  return amount.toLocaleString("fa-IR") + " افغانی";
}

export const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
