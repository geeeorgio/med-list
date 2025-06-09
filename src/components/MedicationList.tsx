import { useState } from "react";
import type { Medication } from "../types";
import { EditModal } from "./EditModal";

interface MedicationListProps {
  entries: Medication[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onEdit: (entry: Medication) => void;
}

const MedicationList = ({
  entries,
  onDelete,
  onClearAll,
  onEdit,
}: MedicationListProps) => {
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedEntry, setSelectedEntry] = useState<Medication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredEntries = entries
    .filter((entry) => !filterDate || entry.time.startsWith(filterDate))
    .sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

  const handleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleEdit = (entry: Medication) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleSave = (entry: Medication) => {
    onEdit(entry);
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-4xl mx-auto px-4 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Фильтр по дате:
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={() => setFilterDate("")}
              className="text-sm text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl transition-colors"
            >
              Сбросить фильтр
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSort}
              className="text-sm text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl transition-colors"
            >
              Сортировка {sortOrder === "asc" ? "↑" : "↓"}
            </button>
            <button
              onClick={onClearAll}
              className="text-sm text-red-600 hover:text-red-700 px-4 py-2 rounded-xl border border-red-200 bg-white transition-colors"
            >
              Очистить всё
            </button>
          </div>
        </div>

        <div className="card">
          <h2>История приёма</h2>
          <div className="table-wrapper">
            <table className="med-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Время</th>
                  <th>Дозировка</th>
                  <th>Заметки</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="no-records">
                      Нет записей
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => {
                    const [date, time] = entry.time.split("T");
                    return (
                      <tr key={entry.id}>
                        <td>{date}</td>
                        <td>{time}</td>
                        <td>{entry.dosage}</td>
                        <td>{entry.notes || "-"}</td>
                        <td>
                          <span
                            className={
                              entry.taken ? "status-taken" : "status-not-taken"
                            }
                          >
                            {entry.taken ? "Принято" : "Не принято"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn"
                            onClick={() => handleEdit(entry)}
                            title="Редактировать"
                          >
                            Редактировать
                          </button>
                          <button
                            className="btn"
                            onClick={() => onDelete(entry.id)}
                            title="Удалить"
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div
            className="btn-group"
            style={{ marginTop: "1.5rem", justifyContent: "space-between" }}
          >
            <button className="btn" onClick={handleSort}>
              Сортировка {sortOrder === "asc" ? "↑" : "↓"}
            </button>
            <button className="btn" onClick={onClearAll}>
              Очистить всё
            </button>
          </div>
        </div>

        <EditModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEntry(null);
          }}
          entry={selectedEntry}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default MedicationList;
