// frontend/src/components/Work/Builder/SortableStep/StepBody.tsx

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepInstructions from "./StepInstructions";
import InputFieldList from "./InputFieldList";
import AddInputDropdown from "./AddInputDropdown";
import { INPUT_TYPE_OPTIONS } from "../../../../../constants/inputTypes";
import type { InputField, InputType } from "../../sharedTypes";

interface StepBodyProps {
  isExpanded: boolean;
  instructions: string;
  inputFields: InputField[];
  onChangeInstructions: (val: string) => void;
  onChangeInputFields: (fields: InputField[]) => void;
}

export default function StepBody({
  isExpanded,
  instructions,
  inputFields,
  onChangeInstructions,
  onChangeInputFields,
}: StepBodyProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleAddField = (type: InputType) => {
    const newField: InputField = {
      id: crypto.randomUUID(),
      label: "",
      type,
      prefix: "",
      suffix: "",
    };
    onChangeInputFields([...inputFields, newField]);
    setDropdownOpen(false);
  };

  const handleUpdateField = (index: number, update: Partial<InputField>) => {
    const updated = [...inputFields];
    updated[index] = { ...updated[index], ...update };
    onChangeInputFields(updated);
  };

  const handleRemoveField = (index: number) => {
    const updated = inputFields.filter((_, i) => i !== index);
    onChangeInputFields(updated);
  };

  useEffect(() => {
    if (!isExpanded && dropdownOpen) {
      setDropdownOpen(false);
    }
  }, [isExpanded, dropdownOpen]);

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          key="expanded"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="px-6 pt-2 pb-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              {/* Instructions */}
              <StepInstructions
                instructions={instructions}
                onChange={onChangeInstructions}
              />

              {/* Input Field Header */}
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Input fields:
                </label>
                <button
                  ref={dropdownButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((prev) => !prev);
                  }}
                  className="text-sm text-blue-600 hover:underline"
                  aria-expanded={dropdownOpen}
                >
                  + Add input
                </button>
              </div>

              {/* Input Fields */}
              <InputFieldList
                fields={inputFields}
                onChange={onChangeInputFields}
                onUpdateField={handleUpdateField}
                onRemoveField={handleRemoveField}
              />

              {/* Dropdown */}
              <AddInputDropdown
                targetRef={dropdownButtonRef}
                visible={dropdownOpen}
              >
                {INPUT_TYPE_OPTIONS.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => handleAddField(type)}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                  >
                    <Icon size={16} className="mr-2 text-gray-500" />
                    {label}
                  </button>
                ))}
              </AddInputDropdown>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
