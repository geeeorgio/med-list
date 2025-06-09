export interface Medication {
  id: string;
  name: string;
  time: string;
  dosage: string;
  taken: boolean;
  notes?: string;
}

export interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (medication: Omit<Medication, "id">) => void;
}

export interface MedicationItemProps {
  medication: Medication;
  onToggle: (id: string) => void;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
}

export interface MedicationListProps {
  medications: Medication[];
  onToggle: (id: string) => void;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}
