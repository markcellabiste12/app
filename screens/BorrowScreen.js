import { useContext, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CDContext } from '../App';

export default function BorrowScreen() {
  const { inventory, borrowCD } = useContext(CDContext);
  const [selectedCD, setSelectedCD] = useState(null);
  const [borrowerName, setBorrowerName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  const showModal = (message, success = false) => {
    setModalMessage(message);
    setModalSuccess(success);
    setModalVisible(true);
  };

  const handleSelect = (cd) => {
    if (cd.availableCopies <= 0) {
      showModal('CD not available.');
      return;
    }
    setSelectedCD(cd);
  };

  const handleBorrow = () => {
    if (!borrowerName.trim()) {
      showModal('Please enter the borrower\'s name.');
      return;
    }
    const result = borrowCD(selectedCD.id, borrowerName.trim());
    showModal(result.message, result.success);
    if (result.success) {
      setSelectedCD(null);
      setBorrowerName('');
    }
  };

  const handleCancel = () => {
    setSelectedCD(null);
    setBorrowerName('');
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Select a CD to borrow:</Text>

      {inventory.map((cd) => {
        const isSelected = selectedCD?.id === cd.id;
        const isUnavailable = cd.availableCopies === 0;
        return (
          <TouchableOpacity
            key={cd.id}
            activeOpacity={0.7}
            onPress={() => handleSelect(cd)}
            style={[
              styles.cdCard,
              isSelected && styles.cdCardSelected,
              isUnavailable && styles.cdCardDisabled,
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cdTitle}>{cd.title}</Text>
              <Text style={styles.cdArtist}>{cd.artist}</Text>
            </View>
            <Text style={[styles.copiesText, isUnavailable && { color: '#E74C3C' }]}>
              {isUnavailable ? 'Unavailable' : `${cd.availableCopies} avail.`}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* ── Borrow Form ────────────────────────────── */}
      {selectedCD && (
        <View style={styles.formBox}>
          <Text style={styles.formLabel}>
            Borrowing: <Text style={{ color: '#4A90D9' }}>{selectedCD.title}</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter borrower's name"
            placeholderTextColor="#AAA"
            value={borrowerName}
            onChangeText={setBorrowerName}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleBorrow}>
              <Text style={styles.confirmBtnText}>Confirm Borrow</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Modal ──────────────────────────────────── */}
      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>
              {modalSuccess ? '✅' : '⚠️'}
            </Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={[styles.modalBtn, modalSuccess ? { backgroundColor: '#27AE60' } : { backgroundColor: '#4A90D9' }]}
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

  cdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cdCardSelected: { borderColor: '#4A90D9', backgroundColor: '#EAF2FD' },
  cdCardDisabled: { opacity: 0.5 },
  cdTitle: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  cdArtist: { fontSize: 13, color: '#777', marginTop: 2 },
  copiesText: { fontSize: 13, fontWeight: '600', color: '#27AE60' },

  formBox: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  formLabel: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 14,
  },
  formButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: {
    flex: 1,
    marginRight: 6,
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#EEE',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#666', fontWeight: '600', fontSize: 15 },
  confirmBtn: {
    flex: 1,
    marginLeft: 6,
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#4A90D9',
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  /* Modal */
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '82%', alignItems: 'center' },
  modalText: { fontSize: 16, color: '#333', textAlign: 'center', marginVertical: 16, lineHeight: 22 },
  modalBtn: { paddingVertical: 11, paddingHorizontal: 36, borderRadius: 10 },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
