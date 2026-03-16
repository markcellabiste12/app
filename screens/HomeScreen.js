import { useContext } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { CDContext } from '../App';

export default function HomeScreen() {
  const { inventory, borrowedCDs, totalIncome, totalBorrowed, PENALTY_PER_DAY } =
    useContext(CDContext);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPenalty = (dueDateISO) => {
    const today = new Date();
    const due = new Date(dueDateISO);
    if (today > due) {
      const days = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
      return days * PENALTY_PER_DAY;
    }
    return 0;
  };

  return (
    <ScrollView style={styles.container}>
      {/* ── Summary Cards ─────────────────────────────── */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#27AE60' }]}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={styles.summaryValue}>₱{totalIncome}.00</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#4A90D9' }]}>
          <Text style={styles.summaryLabel}>Total Borrowed</Text>
          <Text style={styles.summaryValue}>{totalBorrowed}</Text>
        </View>
      </View>

      {/* ── Available CDs ─────────────────────────────── */}
      <Text style={styles.sectionTitle}>📀 Available CDs</Text>
      {inventory.map((cd) => (
        <View key={cd.id} style={styles.card}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{cd.title}</Text>
              <Text style={styles.cardSub}>{cd.artist}</Text>
            </View>
            <View
              style={[
                styles.badge,
                cd.availableCopies === 0 ? styles.badgeRed : styles.badgeGreen,
              ]}
            >
              <Text style={styles.badgeText}>{cd.availableCopies}</Text>
            </View>
          </View>
          <Text style={styles.copiesLabel}>
            {cd.availableCopies} of {cd.totalCopies} copies available
          </Text>
        </View>
      ))}

      {/* ── Borrowed CDs ──────────────────────────────── */}
      <Text style={styles.sectionTitle}>📋 Currently Borrowed</Text>
      {borrowedCDs.length === 0 ? (
        <Text style={styles.emptyText}>No CDs currently borrowed.</Text>
      ) : (
        borrowedCDs.map((rec) => {
          const penalty = getPenalty(rec.dueDate);
          const overdue = penalty > 0;
          return (
            <View
              key={rec.id}
              style={[styles.borrowCard, overdue && styles.borrowCardOverdue]}
            >
              <Text style={styles.cardTitle}>{rec.title}</Text>
              <Text style={styles.cardSub}>{rec.artist}</Text>
              <View style={styles.divider} />
              <Text style={styles.infoText}>👤  Borrower: {rec.borrowerName}</Text>
              <Text style={styles.infoText}>📅  Borrowed: {formatDate(rec.borrowDate)}</Text>
              <Text style={styles.infoText}>⏰  Due: {formatDate(rec.dueDate)}</Text>
              {overdue ? (
                <View style={styles.penaltyBanner}>
                  <Text style={styles.penaltyBannerText}>
                    ⚠️  OVERDUE — Penalty: ₱{penalty}.00
                  </Text>
                </View>
              ) : (
                <View style={styles.onTimeBanner}>
                  <Text style={styles.onTimeBannerText}>✅  On Time</Text>
                </View>
              )}
            </View>
          );
        })
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 16 },

  /* Summary */
  summaryRow: { flexDirection: 'row', marginBottom: 20 },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryLabel: { color: '#ffffffCC', fontSize: 13, fontWeight: '600' },
  summaryValue: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 4 },

  /* Section */
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 8, marginBottom: 10 },

  /* Available card */
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cardSub: { fontSize: 14, color: '#777', marginTop: 2 },
  badge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  badgeGreen: { backgroundColor: '#27AE60' },
  badgeRed: { backgroundColor: '#E74C3C' },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  copiesLabel: { fontSize: 12, color: '#999', marginTop: 6 },

  /* Borrowed card */
  borrowCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#4A90D9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  borrowCardOverdue: { borderLeftColor: '#E74C3C', backgroundColor: '#FFF8F8' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 8 },
  infoText: { fontSize: 13, color: '#555', marginTop: 3 },
  penaltyBanner: {
    marginTop: 10,
    backgroundColor: '#FDEDEC',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  penaltyBannerText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 14 },
  onTimeBanner: {
    marginTop: 10,
    backgroundColor: '#EAFAF1',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  onTimeBannerText: { color: '#27AE60', fontWeight: '600', fontSize: 13 },

  emptyText: { color: '#AAA', fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },
});


