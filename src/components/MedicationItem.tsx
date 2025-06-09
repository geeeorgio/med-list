import { Pencil, Trash2 } from "lucide-react";
import type { MedicationItemProps } from "../types";

export const MedicationItem = ({
  medication,
  onToggle,
  onEdit,
  onDelete,
}: MedicationItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onToggle(medication.id)}
          className={`relative w-6 h-6 rounded-md border-2 transition-all duration-200 ease-in-out ${
            medication.taken
              ? "bg-green-500 border-green-500"
              : "bg-white border-gray-300 hover:border-green-500"
          }`}
        >
          {medication.taken && (
            <svg
              className="absolute inset-0 w-full h-full text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {medication.name}
          </h3>
          <p className="text-sm text-gray-500">{medication.time}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(medication)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(medication.id)}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
