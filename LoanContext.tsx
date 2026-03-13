import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface Person {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface LoanEntry {
  id: string;
  personId: string;
  amount: number;
  persianDate: string;
  note: string;
  createdAt: string;
}

interface LoanContextValue {
  persons: Person[];
  loans: LoanEntry[];
  addPerson: (name: string, phone: string) => Promise<void>;
  removePerson: (id: string) => Promise<void>;
  addLoan: (
    personId: string,
    amount: number,
    persianDate: string,
    note: string
  ) => Promise<void>;
  removeLoan: (id: string) => Promise<void>;
  getPersonTotal: (personId: string) => number;
  getLoansForPerson: (personId: string) => LoanEntry[];
  getDailyTotals: () => { day: string; total: number }[];
  isLoading: boolean;
}

const LoanContext = createContext<LoanContextValue | null>(null);

const PERSONS_KEY = "loan_manager_persons";
const LOANS_KEY = "loan_manager_loans";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [personsData, loansData] = await Promise.all([
          AsyncStorage.getItem(PERSONS_KEY),
          AsyncStorage.getItem(LOANS_KEY),
        ]);
        if (personsData) setPersons(JSON.parse(personsData));
        if (loansData) setLoans(JSON.parse(loansData));
      } catch (e) {
        console.error("Error loading data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const savePersons = async (data: Person[]) => {
    await AsyncStorage.setItem(PERSONS_KEY, JSON.stringify(data));
  };

  const saveLoans = async (data: LoanEntry[]) => {
    await AsyncStorage.setItem(LOANS_KEY, JSON.stringify(data));
  };

  const addPerson = useCallback(async (name: string, phone: string) => {
    const newPerson: Person = {
      id: generateId(),
      name,
      phone,
      createdAt: new Date().toISOString(),
    };
    setPersons((prev) => {
      const updated = [...prev, newPerson];
      savePersons(updated);
      return updated;
    });
  }, []);

  const removePerson = useCallback(async (id: string) => {
    setPersons((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePersons(updated);
      return updated;
    });
    setLoans((prev) => {
      const updated = prev.filter((l) => l.personId !== id);
      saveLoans(updated);
      return updated;
    });
  }, []);

  const addLoan = useCallback(
    async (
      personId: string,
      amount: number,
      persianDate: string,
      note: string
    ) => {
      const newLoan: LoanEntry = {
        id: generateId(),
        personId,
        amount,
        persianDate,
        note,
        createdAt: new Date().toISOString(),
      };
      setLoans((prev) => {
        const updated = [...prev, newLoan];
        saveLoans(updated);
        return updated;
      });
    },
    []
  );

  const removeLoan = useCallback(async (id: string) => {
    setLoans((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      saveLoans(updated);
      return updated;
    });
  }, []);

  const getPersonTotal = useCallback(
    (personId: string) => {
      return loans
        .filter((l) => l.personId === personId)
        .reduce((sum, l) => sum + l.amount, 0);
    },
    [loans]
  );

  const getLoansForPerson = useCallback(
    (personId: string) => {
      return loans
        .filter((l) => l.personId === personId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },
    [loans]
  );

  const getDailyTotals = useCallback(() => {
    const days = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
    const now = new Date();
    const result: { day: string; total: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split("T")[0];
      const total = loans
        .filter((l) => l.createdAt.startsWith(dayStr))
        .reduce((sum, l) => sum + l.amount, 0);
      result.push({ day: days[date.getDay()], total });
    }
    return result;
  }, [loans]);

  const value = useMemo(
    () => ({
      persons,
      loans,
      addPerson,
      removePerson,
      addLoan,
      removeLoan,
      getPersonTotal,
      getLoansForPerson,
      getDailyTotals,
      isLoading,
    }),
    [
      persons,
      loans,
      addPerson,
      removePerson,
      addLoan,
      removeLoan,
      getPersonTotal,
      getLoansForPerson,
      getDailyTotals,
      isLoading,
    ]
  );

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
}

export function useLoan() {
  const context = useContext(LoanContext);
  if (!context) throw new Error("useLoan must be used within LoanProvider");
  return context;
}
