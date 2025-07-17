import React, { Dispatch, SetStateAction, useState } from 'react';
import { showError, showSuccess } from '../utils/toastutils';

interface SelectionPopupProps {
  onSuccess: (selected: string, uid: number | null) => void;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  userId: number | null
}

const options = [
  { label: 'Production', value: '0' },
  { label: 'Test', value: '1' }
];

export const SelectionPopup: React.FC<SelectionPopupProps> = ({ onSuccess, show, setShow, userId }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!selectedOption) {
      setError(true);
      showError("Veuillez sélectionner une option");
      return;
    }

    showSuccess(`Option sélectionnée : ${selectedOption}`);
    onSuccess(selectedOption, userId);
    setShow(false);
    setSelectedOption('');
    setError(false);
  };

  return (
    <>
      {show && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <h3 className="text-lg font-semibold mb-4">Sélectionnez une option</h3>
            <div className="flex flex-wrap gap-4 justify-center mb-4">
              {options.map(({ label, value }) => (
                <label key={value} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="selection"
                    value={value}
                    checked={selectedOption === value}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-3 transition-all duration-200 ${selectedOption === value
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-slate-300 group-hover:border-blue-400'
                      }`}
                  >
                    {selectedOption === value && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <span
                    className={`font-medium transition-colors ${selectedOption === value ? 'text-blue-600' : 'text-slate-700'
                      }`}
                  >
                    {label}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={handleSubmit}>Valider</button>
              <button onClick={() => setShow(false)}>Annuler</button>
            </div>
            {error && <p style={{ color: 'red', marginTop: 10 }}>Aucune option sélectionnée</p>}
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popup: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '10px',
    minWidth: '320px',
    textAlign: 'center' as const,
  },
};
