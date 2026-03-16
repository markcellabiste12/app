import { useContext, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CDContext } from '../App';

export default function ReturnScreen() {
  const { borrowedCDs, returnCD, PENALTY_PER_DAY } = useContext(CDContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalPenalty, setModalPenalty] = useState(0);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
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

  const handleReturn = (borrowId) => {
    const result = returnCD(borrowId);
    setModalMessage(result.message);
    setModalPenalty(result.penalty);
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Select a borrowed CD to return:</Text>

      {borrowedCDs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={{ fontSize: 48 }}>📭</Text>
          <Text style={styles.emptyText}>No CDs to return.</Text>
        </View>
      ) : (
        borrowedCDs.map((rec) => {
          const penalty = getPenalty(rec.dueDate);
          const overdue = penalty > 0;
          return (
            <View key={rec.id} style={[styles.card, overdue && styles.cardOverdue]}>
              <Text style={styles.cardTitle}>{rec.title}</Text>
              <Text style={styles.cardArtist}>{rec.artist}</Text>
              <View style={styles.divider} />
              <Text style={styles.info}>👤  {rec.borrowerName}</Text>
              <Text style={styles.info}>📅  Borrowed: {formatDate(rec.borrowDate)}</Text>
              <Text style={styles.info}>⏰  Due: {formatDate(rec.dueDate)}</Text>

              {overdue && (
                <View style={styles.penaltyBox}>
                  <Text style={styles.penaltyText}>
                    ⚠️  Overdue — Current Penalty: ₱{penalty}.00
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.returnBtn, overdue && styles.returnBtnOverdue]}
                onPress={() => handleReturn(rec.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.returnBtnText}>
                  {overdue ? `Return  (₱${penalty}.00 penalty)` : 'Return  (No penalty)'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}

      {/* ── Modal ──────────────────────────────────── */}
      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>
              {modalPenalty > 0 ? '💰' : '✅'}
            </Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: modalPenalty > 0 ? '#E67E22' : '#27AE60' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 16 },
  heading: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },

  card: {
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
  cardOverdue: { borderLeftColor: '#E74C3C', backgroundColor: '#FFF8F8' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cardArtist: { fontSize: 13, color: '#777', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 8 },
  info: { fontSize: 13, color: '#555', marginTop: 3 },

  penaltyBox: {
    marginTop: 10,
    backgroundColor: '#FDEDEC',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  penaltyText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 13 },

  returnBtn: {
    marginTop: 12,
    backgroundColor: '#27AE60',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  returnBtnOverdue: { backgroundColor: '#E74C3C' },
  returnBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#AAA', fontSize: 16, fontStyle: 'italic', marginTop: 10 },

  /* Modal */
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '82%', alignItems: 'center' },
  modalText: { fontSize: 16, color: '#333', textAlign: 'center', marginVertical: 16, lineHeight: 22 },
  modalBtn: { paddingVertical: 11, paddingHorizontal: 36, borderRadius: 10 },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});


