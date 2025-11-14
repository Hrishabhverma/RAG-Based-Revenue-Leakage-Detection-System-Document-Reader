
import React from 'react';

const presets = [
    {
        name: 'Leakage Detected',
        query: 'Check INV-001 against contract C-001 for billing discrepancies.',
        documents: `[
  {
    "doc_id": "C-001",
    "type": "Contract",
    "text": "Service XYZ will be billed at a rate of 5,000 INR per hour. A 10% discount applies for projects exceeding 100 hours."
  },
  {
    "doc_id": "INV-001",
    "type": "Invoice",
    "text": "Line Item: Service XYZ, Hours: 120, Rate: 5,500 INR, Total: 660,000 INR. No discount applied."
  }
]`
    },
    {
        name: 'No Leakage',
        query: 'Verify invoice INV-002 against contract C-002.',
        documents: `[
  {
    "doc_id": "C-002",
    "type": "Contract",
    "text": "Standard consultation fee is 8,000 INR per session."
  },
  {
    "doc_id": "INV-002",
    "type": "Invoice",
    "text": "Item: Standard Consultation, Quantity: 1, Unit Price: 8,000 INR, Total: 8,000 INR."
  }
]`
    },
    {
        name: 'Insufficient Evidence',
        query: 'Audit purchase order PO-555.',
        documents: `[
  {
    "doc_id": "PO-555",
    "type": "Purchase Order",
    "text": "Item: 50x Model-T Keyboards, Unit Price: 3,500 INR. Total: 175,000 INR."
  }
]`
    },
];

interface ExamplePresetsProps {
    onSelectPreset: (query: string, documents: string) => void;
}

export const ExamplePresets: React.FC<ExamplePresetsProps> = ({ onSelectPreset }) => {
    return (
        <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">
                Or try an example:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {presets.map((preset) => (
                    <button
                        key={preset.name}
                        onClick={() => onSelectPreset(preset.query, preset.documents)}
                        className="text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-3 rounded-md transition duration-200 text-center"
                    >
                        {preset.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
