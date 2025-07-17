import React, { Dispatch, SetStateAction, useState } from 'react';
import { checkMpass } from '../utils/api';
import { showError, showSuccess } from '../utils/toastutils';

interface PasswordPopupProps {
    onSuccess: () => void;
    show: Boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    userId: number | null
}

export const PasswordPopup: React.FC<PasswordPopupProps> = ({ onSuccess, show, setShow, userId }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = async () => {
        if (!userId)
            return;
        try {
            const response = await checkMpass(userId, password)
            showSuccess(response.message)
            setShow(false);
            setError(false);
            setPassword('');
            onSuccess();
        } catch (error) {
            showError("Mauvais mot de passe")
            setError(true);
        }
    };

    return (
        <>
            {show && (
                <div style={styles.overlay}>
                    <div style={styles.popup}>
                        <h3>Mot de passe requis</h3>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Entrez le mot de passe"
                        />
                        <div style={{ marginTop: '10px' }}>
                            <button onClick={handleSubmit}>Valider</button>
                            <button onClick={() => setShow(false)} style={{ marginLeft: '10px' }}>Annuler</button>
                        </div>
                        {error && <p style={{ color: 'red' }}>Mot de passe incorrect</p>}
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
        padding: '20px',
        borderRadius: '10px',
        minWidth: '300px',
        textAlign: 'center' as const,
    },
};
