import React, { useState, useEffect } from 'react';
import { Search, Package, User, Plus, Check, Trash2, ScanLine, X, Settings } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError } from './utils/toastutils';
import { getUserId, fetchItems, searchClientById, addItemToList, deleteItemFromList, finishUserTask, clearAllItems, pingSession, isAdmin, change_dest } from './utils/api';
import { focusScannerInput } from './utils/focus_scan';
import { PasswordPopup } from './components/passwordpopup';
import { SelectionPopup } from './components/ipmodepopup';

interface Client {
  id: string;
  name: string;
  info: string;
}

const options = [
  { label: 'Commande', value: '2' },
  { label: 'BL', value: '3' },
  { label: 'Facture', value: '4' }
];

function App() {
  const [isadmin, setIsadmin] = useState(false)
  const [showPopupIpMode, setShowPopupIpMode] = useState(false);
  const [showPopupPassword, setShowPopupPassword] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [clientId, setClientId] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [itemId, setItemId] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    initializeUserSession();
  }, []);

  useEffect(() => {
    if (userId)
      loadCid();
  }, [userId]);

  useEffect(() => {
    if (userId)
      loadItems();
  }, [userId]);

  useEffect(() => {
    if (userId)
      pingSession(userId);
  }, [userId])

  const initializeUserSession = async () => {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    } else {
      const newId = await getUserId();
      if (newId !== null) {
        setUserId(newId);
        sessionStorage.setItem('userId', newId.toString());
      }
    }
  };

  const loadCid = async () => {
    if (!userId)
      return;
    try {
      setClient(null);
    } catch (error) {
      showError("Impossible de charger les éléments.");
    }
  };

  const loadItems = async () => {
    if (!userId)
      return;
    try {
      const list = await fetchItems(userId);
      setItems(list || []);
    } catch (error) {
      showError("Impossible de charger les éléments.");
    }
  };

  const searchClient = async (option: string, id: string) => {
    if (!userId)
      return;
    setIsLoading(true);
    try {
      const response = await searchClientById(option, id, userId);
      if (response?.message) {
        showSuccess(response.message);
        const array = response.message.split(';');
        setClient({
          id,
          name: array[1] || `Client ${id}`,
          info: `${array[1]} ${array[2]} ${array[3]}`
        });
      } else if (response?.error) {
        showError(response.error);
      }
    } catch (error) {
      showError("Erreur lors de la recherche client.");
    }
    setClientId('');
    setIsLoading(false);
    pingSession(userId)
    focusScannerInput()
  };

  const addItem = async (id: string) => {
    if (!id.trim() || !userId)
      return;
    setIsLoading(true);
    try {
      const res = await addItemToList(id, userId);
      if (res?.message)
        showSuccess(res.message);
      focusScannerInput()
      await loadItems();
      await pingSession(userId)
    } catch (error) {
      showError("Impossible d'ajouter l'élément.");
    }
    setItemId('');
    setIsLoading(false);
  };

  const deleteItem = async (id: string) => {
    if (!userId)
      return;
    setIsLoading(true);
    try {
      const res = await deleteItemFromList(id, userId);
      if (res?.message)
        showSuccess(res.message);
      focusScannerInput()
      await loadItems();
      await pingSession(userId)
    } catch (error) {
      showError("Erreur lors de la suppression de l'élément.");
    }
    setIsLoading(false);
  };

  const finishTask = async () => {
    if (!userId)
      return;
    setIsLoading(true);
    try {
      const res = await finishUserTask(userId);
      if (res?.message)
        showSuccess(res.message);
      if (res?.error)
        showError(res.error);
      await loadItems();
      await pingSession(userId)
      loadCid();
    } catch (error) {
      showError("Impossible de terminer la tâche.");
    }
    setIsLoading(false);
  };

  const clearItems = async () => {
    if (!userId)
      return;
    setIsLoading(true);
    try {
      const res = await clearAllItems(userId);
      if (res?.message)
        showSuccess(res.message);
      focusScannerInput()
      await loadItems();
      await pingSession(userId)
    } catch (error) {
      showError("Erreur lors de la suppression des éléments.");
    }
    setIsLoading(false);
  };

  const handleClientSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) {
      showError('Veuillez sélectionner une option');
      return;
    }
    if (!clientId) {
      showError('Veuillez entrer un ID client');
      return;
    }
    searchClient(selectedOption, clientId);
  };

  const handleItemAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId) {
      showError("Veuillez entrer un ID d'item");
      return;
    }
    addItem(itemId);
  };

  const successPassWord = () => {
    setShowPopupIpMode(true)
  }

  const handleShowPopup = async () => {
    if (isadmin)
      setShowPopupIpMode(true)
    try {
      const admin_response = await isAdmin(userId)
      console.log(admin_response.message)
      setIsadmin(true)
    } catch (error) {
      setShowPopupPassword(true)
    }
  }

  const submitSelectedIp = async (selectedOption: string, userId: number | null) => {
    change_dest(selectedOption, userId)
    return ;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <Toaster position="top-right" />
      <div className="fixed top-5 right-5">
        <button className='hover:text-blue-500' onClick={handleShowPopup}>
          <Settings />
        </button>
        <PasswordPopup show={showPopupPassword} setShow={setShowPopupPassword} onSuccess={successPassWord} userId={userId} />
        <SelectionPopup show={showPopupIpMode} setShow={setShowPopupIpMode} onSuccess={submitSelectedIp} userId={userId}/>
      </div>
      <div className="max-w-4xl mx-auto space-y-6">
        <input
          readOnly
          id='for_scan'
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const scannedCode = e.currentTarget.value.trim();
              if (scannedCode) {
                addItem(scannedCode);
                e.currentTarget.value = '';
              }
            }
          }}
          className="fixed top-0 left-0 opacity-0 pointer-events-none"
        />
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <ScanLine className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">Outil Scann</h1>
          </div>
          <p className="text-slate-600 text-lg">Scanner code-barre MCFOI</p>
          <p className="text-slate-500 text-sm mt-2">Session utilisateur: {userId}</p>
        </div>

        {/* Option Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sélectionnez une option
          </h2>
          <div className="flex flex-wrap gap-4">
            {options.map(({ label, value }) => (
              <label key={value} className="flex items-center cursor-pointer group">
                <input
                  readOnly
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
        </div>

        {/* Client Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Recherche de document
          </h2>
          <form onSubmit={handleClientSearch} className="space-y-4">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-slate-700 mb-2">
                Numéro de document
              </label>
              <input
                type="number"
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Entrez un numéro de document"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Search className="h-5 w-5" />
              )}
              Rechercher document
            </button>
          </form>
        </div>

        {/* Client Display */}
        {client && (
          <div className="bg-green-50 rounded-xl shadow-lg p-6 border border-green-200">
            <h2 className="text-xl font-semibold text-green-800 mb-3">Client: </h2>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-green-700 font-medium">{client.info}</p>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Liste des codes-barres
            <span className="text-sm font-normal text-slate-500 ml-2">
              ({items.length} élément{items.length !== 1 ? 's' : ''})
            </span>
          </h2>

          {items.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun code-barres ajouté</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                  <button
                    onClick={() => deleteItem(item)}
                    disabled={isLoading}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700 disabled:opacity-50"
                    title="Supprimer cet élément"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Item Management */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Gestion des code-barres
          </h2>

          <form onSubmit={handleItemAdd} className="space-y-4 mb-6">
            <div>
              <label htmlFor="itemId" className="block text-sm font-medium text-slate-700 mb-2">
                Code-Barres
              </label>
              <input
                id="itemId"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Entrez un code-barres"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Plus className="h-5 w-5" />
              )}
              Ajouter
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={finishTask}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" />
              Terminer la tâche
            </button>
            <button
              onClick={clearItems}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              Supprimer tous les éléments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;