import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

interface MedicationEntry {
  id: string;
  date: string;
  dosage: string;
  taken: boolean;
  notes: string;
}

function generateMonthEntries(startDate: Date) {
  const result: MedicationEntry[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateStr = yyyy + "-" + mm + "-" + dd;

    // Calculate days difference from today to determine dosage
    const daysDiff = Math.floor(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dosage = daysDiff % 2 === 0 ? "75mg" : "50mg";

    result.push({
      id: dateStr,
      date: dateStr,
      dosage: dosage,
      taken: false,
      notes: "",
    });
  }
  return result;
}

function getCurrentMonthStart() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function App() {
  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem("medication-entries-start");
    return saved ? new Date(saved) : getCurrentMonthStart();
  });

  const [allEntries, setAllEntries] = useState<Record<string, MedicationEntry>>(
    () => {
      const saved = localStorage.getItem("medication-entries");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          console.error("Failed to parse saved entries from localStorage");
          return {};
        }
      }
      return {};
    }
  );

  const [currentMonthEntries, setCurrentMonthEntries] = useState<
    MedicationEntry[]
  >(() => {
    return generateMonthEntries(startDate);
  });

  const [editEntry, setEditEntry] = useState<MedicationEntry | null>(null);

  // Save all entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("medication-entries", JSON.stringify(allEntries));
  }, [allEntries]);

  // Save startDate to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("medication-entries-start", startDate.toISOString());
  }, [startDate]);

  // Update current month entries when startDate or allEntries change
  useEffect(() => {
    const newEntries = generateMonthEntries(startDate);
    const updatedEntries = newEntries.map((entry) => {
      const savedEntry = allEntries[entry.id];
      return savedEntry || entry;
    });
    setCurrentMonthEntries(updatedEntries);
  }, [startDate, allEntries]);

  const handleToggle = (id: string) => {
    setAllEntries((prev) => {
      const entry = prev[id] || currentMonthEntries.find((e) => e.id === id);
      if (!entry) return prev;

      const updatedEntry = { ...entry, taken: !entry.taken };
      return { ...prev, [id]: updatedEntry };
    });
    toast.info("Статус обновлён");
  };

  const handleEdit = (entry: MedicationEntry) => {
    setEditEntry(entry);
  };

  const handleEditSave = (updatedEntry: MedicationEntry) => {
    setAllEntries((prev) => ({
      ...prev,
      [updatedEntry.id]: updatedEntry,
    }));
    setEditEntry(null);
    toast.success("Запись обновлена!");
  };

  const handleEditCancel = () => {
    setEditEntry(null);
  };

  const handlePrevMonth = () => {
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() - 30);
    setStartDate(newStart);
  };

  const handleNextMonth = () => {
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() + 30);
    setStartDate(newStart);
  };

  const handleCurrentMonth = () => {
    const now = getCurrentMonthStart();
    setStartDate(now);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString("ru-RU", { month: "long", year: "numeric" });
  };

  return (
    <div className="centered-app">
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="month-header">
        <h1>{formatMonthYear(startDate)}</h1>
      </div>
      <div className="med-form">
        <button className="btn" onClick={handlePrevMonth}>
          Предыдущий месяц
        </button>
        <button className="btn" onClick={handleCurrentMonth}>
          Текущий месяц
        </button>
        <button className="btn" onClick={handleNextMonth}>
          Следующий месяц
        </button>
      </div>
      <div className="table-container">
        <table className="med-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Дозировка</th>
              <th>Статус</th>
              <th>Заметки</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentMonthEntries.map((entry) => {
              const date = new Date(entry.date);
              const isToday = new Date().toDateString() === date.toDateString();
              const isCurrentMonth = date.getMonth() === new Date().getMonth();

              return (
                <tr key={entry.id} className={isToday ? "today-row" : ""}>
                  <td>
                    <div
                      className={`date-cell ${isToday ? "today" : ""} ${
                        isCurrentMonth ? "current-month" : ""
                      }`}
                    >
                      {date.toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        weekday: "long",
                      })}
                    </div>
                  </td>
                  <td>{entry.dosage}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={entry.taken}
                      onChange={() => handleToggle(entry.id)}
                    />
                  </td>
                  <td>{entry.notes || "-"}</td>
                  <td>
                    <button className="btn" onClick={() => handleEdit(entry)}>
                      Редактировать
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editEntry && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Редактировать запись</h2>
            <div className="form-group">
              <label>Дозировка</label>
              <select
                value={editEntry.dosage}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, dosage: e.target.value })
                }
              >
                <option value="50mg">50mg</option>
                <option value="75mg">75mg</option>
              </select>
            </div>
            <div className="form-group">
              <label>Заметки</label>
              <textarea
                value={editEntry.notes}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, notes: e.target.value })
                }
                rows={3}
                placeholder="Добавьте заметки..."
              />
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                checked={editEntry.taken}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, taken: e.target.checked })
                }
                id="edit-taken"
              />
              <label htmlFor="edit-taken">Принято</label>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => handleEditSave(editEntry)}>
                Сохранить
              </button>
              <button className="btn btn-secondary" onClick={handleEditCancel}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
