import React, { useState, useEffect } from 'react';
import { Search, Package, User, Plus, Check, Trash2, ScanLine, X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  info: string;
}

const options = [
  { label: 'Commande', value: '1' },
  { label: 'BL', value: '2' },
  { label: 'Facture', value: '3' }
];


function App() {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [client, setClient] = useState<Client | null>(null);
  const [itemId, setItemId] = useState<string>('');
  const [items, setItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await fetch('/items/');
      const data = await response.json();
      
      if (data.item) {
        setItems(data.item);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des items :', error);
      setItems([]);
    }
  };

  const searchClient = async (option: string, id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/get_client_id/${option}/${id}`);
      const data = await response.json();
      
      alert("Réponse du serveur : " + JSON.stringify(data));
      
      // Parse the message like in the original code
      const message = data.message;
      const array = message.split(";");
      
      const clientData = {
        id: id,
        name: array[1] || `Client ${id}`,
        info: `${array[1]} ${array[2]} ${array[3]}` || `Informations client ${id} - Option ${option}`
      };
      
      setClient(clientData);
      setClientId(''); // Reset form like in original
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert("Erreur !");
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (id: string) => {
    if (!id.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/add_items/${id}`, {
        method: "PUT"
      });
      const data = await response.json();
      
      alert("Réponse du serveur : " + JSON.stringify(data));
      setItemId(''); // Reset form like in original
      
      // Reload items from backend
      await loadItems();
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert("Erreur !");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/delete_item/${id}`);
      const data = await response.json();
      
      alert("Réponse du serveur : " + JSON.stringify(data));
      
      // Reload items from backend
      await loadItems();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur !");
    } finally {
      setIsLoading(false);
    }
  };

  const finishTask = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/finish_task");
      const data = await response.json();
      
      alert("Réponse du serveur : " + JSON.stringify(data));
      
      // Reload items from backend
      await loadItems();
    } catch (error) {
      console.error("Erreur :", error);
      alert("Erreur !");
    } finally {
      setIsLoading(false);
    }
  };

  const clearItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/clear_items");
      const data = await response.json();
      
      alert("Réponse du serveur : " + JSON.stringify(data));
      
      // Reload items from backend
      await loadItems();
    } catch (error) {
      console.error("Erreur :", error);
      alert("Erreur !");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) {
      alert('Veuillez sélectionner une option');
      return;
    }
    if (!clientId) {
      alert('Veuillez entrer un ID client');
      return;
    }
    searchClient(selectedOption, clientId);
  };

  const handleItemAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId) {
      alert('Veuillez entrer un ID d\'item');
      return;
    }
    addItem(itemId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <input
          type="text"
          autoFocus
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
                  type="radio"
                  name="selection"
                  value={value}
                  checked={selectedOption === value}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 mr-3 transition-all duration-200 ${
                    selectedOption === value
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-slate-300 group-hover:border-blue-400'
                  }`}
                >
                  {selectedOption === value && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <span
                  className={`font-medium transition-colors ${
                    selectedOption === value ? 'text-blue-600' : 'text-slate-700'
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
            Recherche client
          </h2>
          <form onSubmit={handleClientSearch} className="space-y-4">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-slate-700 mb-2">
                ID client
              </label>
              <input
                type="number"
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Entrez l'ID du client"
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
              Rechercher client
            </button>
          </form>
        </div>

        {/* Client Display */}
        {client && (
          <div className="bg-green-50 rounded-xl shadow-lg p-6 border border-green-200">
            <h2 className="text-xl font-semibold text-green-800 mb-3">Client trouvé</h2>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-green-700 font-medium">{client.info}</p>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Liste des éléments
            <span className="text-sm font-normal text-slate-500 ml-2">
              ({items.length} élément{items.length !== 1 ? 's' : ''})
            </span>
          </h2>
          
          {items.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun élément ajouté</p>
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
            Gestion des éléments
          </h2>
          
          <form onSubmit={handleItemAdd} className="space-y-4 mb-6">
            <div>
              <label htmlFor="itemId" className="block text-sm font-medium text-slate-700 mb-2">
                ID de l'item
              </label>
              <input
                type="number"
                id="itemId"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Entrez l'ID de l'item"
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