import { useState } from "react";
import type { Medication } from "../types";

interface MedicationFormProps {
  onSubmit: (data: Omit<Medication, "id">) => void;
}

export const MedicationForm = ({ onSubmit }: MedicationFormProps) => {
  const [formData, setFormData] = useState<Omit<Medication, "id">>({
    time: new Date().toISOString().slice(0, 16),
    name: "",
    notes: "",
    taken: false,
    dosage: "50mg",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      time: new Date().toISOString().slice(0, 16),
      name: "",
      notes: "",
      taken: false,
      dosage: "50mg",
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
      <h2 className="text-2xl font-bold text-blue-800 mb-8 text-center tracking-tight">
        Добавить новую запись
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label htmlFor="date">Дата</label>
          <input
            id="date"
            type="date"
            value={formData.time.split("T")[0]}
            onChange={(e) =>
              setFormData({
                ...formData,
                time: e.target.value + "T" + formData.time.split("T")[1],
              })
            }
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="time">Время</label>
          <input
            id="time"
            type="time"
            value={formData.time.split("T")[1]}
            onChange={(e) =>
              setFormData({
                ...formData,
                time: formData.time.split("T")[0] + "T" + e.target.value,
              })
            }
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="dosage">Дозировка</label>
          <select
            id="dosage"
            value={formData.dosage || "50mg"}
            onChange={(e) =>
              setFormData({ ...formData, dosage: e.target.value })
            }
            required
          >
            <option value="50mg">50mg</option>
            <option value="75mg">75mg</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="notes">Заметки</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Добавьте заметки..."
            rows={3}
          />
        </div>
        <div
          className="form-group"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <input
            id="taken"
            type="checkbox"
            checked={formData.taken}
            onChange={(e) =>
              setFormData({ ...formData, taken: e.target.checked })
            }
          />
          <label htmlFor="taken" style={{ margin: 0 }}>
            Лекарство принято
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn"
            style={{ width: "100%", marginTop: "1rem" }}
          >
            Добавить запись
          </button>
        </div>
      </form>
    </div>
  );
};
