export const getUserId = async (): Promise<number | null> => {
  try {
    const response = await fetch('/new_user_id');
    if (!response.ok)
      throw new Error('Erreur lors de la création du user ID');
    const data = await response.json();
    return data.userId ?? null;
  } catch (error) {
    console.error('[getUserId]', error);
    return null;
  }
};

export const fetchItems = async (userId: number): Promise<string[]> => {
  try {
    const response = await fetch(`/items/${userId}`);
    if (!response.ok)
      throw new Error('Erreur lors du fetch des items');
    const data = await response.json();
    return data.item || [];
  } catch (error) {
    console.error('[fetchItems]', error);
    return [];
  }
};

export const searchClientById = async (option: string, id: string, userId: number): Promise<any> => {
  try {
    const response = await fetch(`/get_client_id/${option}/${id}/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[searchClientById]', error);
    return { error: 'Erreur réseau' };
  }
};

export const addItemToList = async (itemId: string, userId: number): Promise<any> => {
  try {
    const response = await fetch(`/add_items/${itemId}/${userId}`, { method: 'PUT' });
    return await response.json();
  } catch (error) {
    console.error('[addItemToList]', error);
    return { error: 'Erreur réseau' };
  }
};

export const deleteItemFromList = async (itemId: string, userId: number): Promise<any> => {
  try {
    const response = await fetch(`/delete_item/${itemId}/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('[deleteItemFromList]', error);
    return { error: 'Erreur réseau' };
  }
};

export const finishUserTask = async (userId: number): Promise<any> => {
  try {
    const response = await fetch(`/finish_task/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('[finishUserTask]', error);
    return { error: 'Erreur réseau' };
  }
};

export const clearAllItems = async (userId: number): Promise<any> => {
  try {
    const response = await fetch(`/clear_items/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('[clearAllItems]', error);
    return { error: 'Erreur réseau' };
  }
};

export const pingSession = async (userId: number):Promise<any> => {
  if (!userId)
    return;
  fetch(`/check_session/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }).catch((err) => {
    console.error("Erreur lors du ping de session :", err);
  });
};
