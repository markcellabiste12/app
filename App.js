import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createContext, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import BorrowScreen from './screens/BorrowScreen';
import HomeScreen from './screens/HomeScreen';
import ReturnScreen from './screens/ReturnScreen';

// ─── Initial CD Inventory ─────────────────────────────────────
const INITIAL_CDS = [
  { id: '1', title: 'Thriller',                 artist: 'Michael Jackson', totalCopies: 3, availableCopies: 3 },
  { id: '2', title: 'Back in Black',            artist: 'AC/DC',           totalCopies: 2, availableCopies: 2 },
  { id: '3', title: 'The Dark Side of the Moon', artist: 'Pink Floyd',     totalCopies: 4, availableCopies: 4 },
  { id: '4', title: '21',                       artist: 'Adele',           totalCopies: 2, availableCopies: 2 },
  { id: '5', title: 'Abbey Road',               artist: 'The Beatles',     totalCopies: 3, availableCopies: 3 },
  { id: '6', title: 'Rumours',                  artist: 'Fleetwood Mac',   totalCopies: 2, availableCopies: 2 },
  { id: '7', title: 'Born to Die',              artist: 'Lana Del Rey',    totalCopies: 3, availableCopies: 3 },
  { id: '8', title: 'Doo-Wops & Hooligans',     artist: 'Bruno Mars',     totalCopies: 2, availableCopies: 2 },
];

// ─── Context ───────────────────────────────────────────────────
export const CDContext = createContext();

const Tab = createBottomTabNavigator();

const PENALTY_PER_DAY = 2; // PHP 2 per day overdue

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [borrowedCDs, setBorrowedCDs] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // ─── Load data on startup ──────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [savedInv, savedBor, savedInc, savedTot] = await Promise.all([
          AsyncStorage.getItem('cd_inventory'),
          AsyncStorage.getItem('cd_borrowed'),
          AsyncStorage.getItem('cd_totalIncome'),
          AsyncStorage.getItem('cd_totalBorrowed'),
        ]);

        setInventory(savedInv ? JSON.parse(savedInv) : INITIAL_CDS);
        setBorrowedCDs(savedBor ? JSON.parse(savedBor) : []);
        setTotalIncome(savedInc ? JSON.parse(savedInc) : 0);
        setTotalBorrowed(savedTot ? JSON.parse(savedTot) : 0);
      } catch (e) {
        console.error('Load error:', e);
        setInventory(INITIAL_CDS);
      }
      setIsLoaded(true);
    })();
  }, []);

  // ─── Persist every change ──────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      try {
        await Promise.all([
          AsyncStorage.setItem('cd_inventory', JSON.stringify(inventory)),
          AsyncStorage.setItem('cd_borrowed', JSON.stringify(borrowedCDs)),
          AsyncStorage.setItem('cd_totalIncome', JSON.stringify(totalIncome)),
          AsyncStorage.setItem('cd_totalBorrowed', JSON.stringify(totalBorrowed)),
        ]);
      } catch (e) {
        console.error('Save error:', e);
      }
    })();
  }, [inventory, borrowedCDs, totalIncome, totalBorrowed, isLoaded]);

  // ─── Borrow a CD ──────────────────────────────────────────
  const borrowCD = (cdId, borrowerName) => {
    const cd = inventory.find((c) => c.id === cdId);
    if (!cd || cd.availableCopies <= 0) {
      return { success: false, message: 'CD not available.' };
    }

    // Decrease available copies
    setInventory((prev) =>
      prev.map((c) =>
        c.id === cdId ? { ...c, availableCopies: c.availableCopies - 1 } : c
      )
    );

    // Record borrow
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7‑day loan

    setBorrowedCDs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        cdId,
        title: cd.title,
        artist: cd.artist,
        borrowerName,
        borrowDate: borrowDate.toISOString(),
        dueDate: dueDate.toISOString(),
      },
    ]);

    setTotalBorrowed((prev) => prev + 1);

    return { success: true, message: `"${cd.title}" borrowed successfully!` };
  };

  // ─── Return a CD ──────────────────────────────────────────
  const returnCD = (borrowId) => {
    const record = borrowedCDs.find((b) => b.id === borrowId);
    if (!record) return { success: false, message: 'Record not found.', penalty: 0 };

    // Calculate penalty
    const today = new Date();
    const due = new Date(record.dueDate);
    let penalty = 0;
    if (today > due) {
      const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
      penalty = diffDays * PENALTY_PER_DAY;
    }

    // Increase available copies
    setInventory((prev) =>
      prev.map((c) =>
        c.id === record.cdId ? { ...c, availableCopies: c.availableCopies + 1 } : c
      )
    );

    // Remove from borrowed list
    setBorrowedCDs((prev) => prev.filter((b) => b.id !== borrowId));

    // Add penalty to income
    if (penalty > 0) {
      setTotalIncome((prev) => prev + penalty);
    }

    return {
      success: true,
      penalty,
      message:
        penalty > 0
          ? `"${record.title}" returned. Overdue penalty: ₱${penalty}.00`
          : `"${record.title}" returned on time. No penalty.`,
    };
  };

  // ─── Loading screen ───────────────────────────────────────
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' }}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={{ marginTop: 12, color: '#666' }}>Loading CD Manager...</Text>
      </View>
    );
  }

  // ─── Main app ─────────────────────────────────────────────
  return (
    <CDContext.Provider
      value={{ inventory, borrowedCDs, totalIncome, totalBorrowed, borrowCD, returnCD, PENALTY_PER_DAY }}
    >
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#4A90D9',
            tabBarInactiveTintColor: '#999',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#E0E0E0',
              paddingBottom: 4,
              height: 60,
            },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            headerStyle: { backgroundColor: '#4A90D9' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'CD Manager',
              tabBarLabel: 'Home',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 22 }}>🏠</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Borrow"
            component={BorrowScreen}
            options={{
              title: 'Borrow a CD',
              tabBarLabel: 'Borrow',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 22 }}>📀</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Return"
            component={ReturnScreen}
            options={{
              title: 'Return a CD',
              tabBarLabel: 'Return',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 22 }}>↩️</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </CDContext.Provider>
  );
}
