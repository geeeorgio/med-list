import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  isSameDay,
  isBefore,
  format,
  differenceInDays,
  lastDayOfMonth,
  startOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { ru } from "date-fns/locale";
import { PenBox } from "lucide-react";

import "./App.css";

interface MedicationEntry {
  id: string;
  date: string;
  weekday: string;
  dosage: string;
  taken: boolean;
  notes: string;
}

const BASE_DATE = new Date(2023, 0, 1);

function generateMonthEntries(startDate = new Date()) {
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const daysInMonth = lastDayOfMonth(new Date(year, month));

  return eachDayOfInterval({
    start: startOfMonth(new Date(year, month)),
    end: daysInMonth,
  }).map((date) => {
    const diffInDays = differenceInDays(date, BASE_DATE);
    const dosage = diffInDays % 2 !== 0 ? "50 мг" : "75 мг";

    return {
      id: format(date, "yyyy-MM-dd"),
      date: format(date, "dd.MM"),
      weekday: format(date, "EEE", { locale: ru }),
      dosage,
      taken: false,
      notes: "",
    };
  });
}

function getCurrentMonthStart() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  now.setDate(1);
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

  const [editEntry, setEditEntry] = useState<MedicationEntry | null>(null);

  useEffect(() => {
    localStorage.setItem("medication-entries", JSON.stringify(allEntries));
  }, [allEntries]);

  useEffect(() => {
    localStorage.setItem("medication-entries-start", startDate.toISOString());
  }, [startDate]);

  const generatedEntries = generateMonthEntries(startDate);

  const currentMonthEntries = generatedEntries.map((entry) => {
    const savedEntry = allEntries[entry.id];
    return savedEntry || entry;
  });

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
    setStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setStartDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleCurrentMonth = () => {
    const now = getCurrentMonthStart();
    setStartDate(now);
  };

  const formatMonthYear = (date: Date) => {
    return format(date, "LLLL yyyy", { locale: ru });
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
      <div className="table-wrapper">
        <div className="table-container">
          <table className="med-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Доза</th>
                <th>Прием</th>
                <th>Заметки</th>
                <th>Изменить</th>
              </tr>
            </thead>
            <tbody>
              {currentMonthEntries.map((entry) => {
                const date = new Date(entry.id);
                const isToday = isSameDay(date, new Date());
                const isPastDate = isBefore(date, new Date()) && !isToday;

                return (
                  <tr
                    key={entry.id}
                    className={
                      isToday ? "today-row" : isPastDate ? "past-date-row" : ""
                    }
                  >
                    <td>
                      <div className="date-cell">
                        <span className="date-month">{entry.date}</span>
                        <span className="weekday">{entry.weekday}</span>
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
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(entry)}
                      >
                        <PenBox />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
                <option value="50 мг">50 мг</option>
                <option value="75 мг">75 мг</option>
              </select>
            </div>
            <div className="form-group">
              <label>Заметки</label>
              <input
                type="text"
                value={editEntry.notes}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, notes: e.target.value })
                }
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => handleEditSave(editEntry)}>
                Сохранить
              </button>
              <button className="btn" onClick={handleEditCancel}>
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
