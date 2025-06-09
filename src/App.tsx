import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function generateMonthEntries(startDate: Date) {
  const result = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    result.push({
      id: yyyy + "-" + mm + "-" + dd,
      date: yyyy + "-" + mm + "-" + dd,
      dosage: i % 2 === 0 ? "50mg" : "75mg",
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

function formatDateWithWeekday(dateStr: string) {
  const date = new Date(dateStr);
  const days = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const weekday = days[date.getDay()];
  return { formatted: `${day}.${month}.${year}`, weekday };
}

function App() {
  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem("medication-entries-start");
    return saved ? new Date(saved) : getCurrentMonthStart();
  });
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("medication-entries");
    if (saved) return JSON.parse(saved);
    return generateMonthEntries(getCurrentMonthStart());
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    dosage: string;
    taken: boolean;
    notes: string;
  }>({ dosage: "50mg", taken: false, notes: "" });

  useEffect(() => {
    localStorage.setItem("medication-entries", JSON.stringify(entries));
    localStorage.setItem("medication-entries-start", startDate.toISOString());
  }, [entries, startDate]);

  const handleToggle = (id: string) => {
    setEntries((prev: typeof entries) =>
      prev.map((entry: (typeof entries)[0]) =>
        entry.id === id ? { ...entry, taken: !entry.taken } : entry
      )
    );
    toast.info("Статус обновлён");
  };

  const handlePrevMonth = () => {
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() - 30);
    setStartDate(newStart);
    setEntries(generateMonthEntries(newStart));
  };
  const handleNextMonth = () => {
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() + 30);
    setStartDate(newStart);
    setEntries(generateMonthEntries(newStart));
  };
  const handleCurrentMonth = () => {
    const now = getCurrentMonthStart();
    setStartDate(now);
    setEntries(generateMonthEntries(now));
  };

  const handleEdit = (entry: (typeof entries)[0]) => {
    setEditId(entry.id);
    setEditData({
      dosage: entry.dosage,
      taken: entry.taken,
      notes: entry.notes || "",
    });
  };
  const handleEditSave = () => {
    setEntries((prev: typeof entries) =>
      prev.map((entry: (typeof entries)[0]) =>
        entry.id === editId ? { ...entry, ...editData } : entry
      )
    );
    setEditId(null);
    toast.success("Запись обновлена!");
  };

  return (
    <div className="centered-app">
      <ToastContainer position="top-center" autoClose={2000} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <button className="btn" onClick={handlePrevMonth}>
          ← Предыдущий месяц
        </button>
        <button className="btn" onClick={handleCurrentMonth}>
          Текущий месяц
        </button>
        <button className="btn" onClick={handleNextMonth}>
          Следующий месяц →
        </button>
      </div>
      <div className="table-container">
        <table className="med-table">
          <thead>
            <tr>
              <th>День недели</th>
              <th>Дата</th>
              <th>Дозировка</th>
              <th>Заметки</th>
              <th>Принято</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-records">
                  Нет записей
                </td>
              </tr>
            ) : (
              entries.map((entry: (typeof entries)[0]) => {
                const { formatted, weekday } = formatDateWithWeekday(
                  entry.date
                );
                return (
                  <tr key={entry.id}>
                    <td className="weekday-cell">{weekday}</td>
                    <td>{formatted}</td>
                    <td>{entry.dosage}</td>
                    <td
                      style={{
                        maxWidth: 180,
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                        color: "#555",
                      }}
                    >
                      {entry.notes || "-"}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={entry.taken}
                        onChange={() => handleToggle(entry.id)}
                      />
                    </td>
                    <td>
                      <button className="btn" onClick={() => handleEdit(entry)}>
                        Редактировать
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {editId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Редактировать запись</h2>
            <div className="form-group">
              <label>Дозировка</label>
              <select
                value={editData.dosage}
                onChange={(e) =>
                  setEditData({ ...editData, dosage: e.target.value })
                }
              >
                <option value="50mg">50mg</option>
                <option value="75mg">75mg</option>
              </select>
            </div>
            <div className="form-group">
              <label>Заметки</label>
              <textarea
                value={editData.notes}
                onChange={(e) =>
                  setEditData({ ...editData, notes: e.target.value })
                }
                rows={3}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  border: "1px solid #e5e5ea",
                  padding: "0.7rem 1rem",
                  fontSize: "1rem",
                  background: "#f9f9f9",
                  color: "#1c1c1e",
                  resize: "vertical",
                }}
                placeholder="Добавьте заметки..."
              />
            </div>
            <div
              className="form-group"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: "0.7rem",
              }}
            >
              <input
                type="checkbox"
                checked={editData.taken}
                onChange={(e) =>
                  setEditData({ ...editData, taken: e.target.checked })
                }
                id="edit-taken"
              />
              <label htmlFor="edit-taken" style={{ margin: 0 }}>
                Принято
              </label>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="btn" onClick={handleEditSave}>
                Сохранить
              </button>
              <button className="btn" onClick={() => setEditId(null)}>
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
