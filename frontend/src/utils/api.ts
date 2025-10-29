export const getUserId = async (): Promise<number | null> => {
  try {
    const response = await fetch('/user/new', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
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
    const response = await fetch(`/items/list/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
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
    const response = await fetch(`/user/get_client_id/${option}/${id}/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[searchClientById]', error);
    return { error: 'Erreur réseau' };
  }
};

export const addItemToList = async (itemId: string, userId: number): Promise<any> => {
  try {
    const response = await fetch(`/items/add/${itemId}/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
  } catch (error) {
    console.error('[addItemToList]', error);
    return { error: 'Erreur réseau' };
  }
};

export const deleteItemFromList = async (itemId: string, userId: number): Promise<any> => {
  try {
    const response = await fetch(`/items/delete/${itemId}/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
  } catch (error) {
    console.error('[deleteItemFromList]', error);
    return { error: 'Erreur réseau' };
  }
};

export const finishUserTask = async (userId: number): Promise<any> => {
  try {
    const response = await fetch(`/items/finish_task/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
  } catch (error) {
    console.error('[finishUserTask]', error);
    return { error: 'Erreur réseau' };
  }
};

export const clearAllItems = async (userId: number): Promise<any> => {
  try {
    const response = await fetch(`/items/clear/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
  } catch (error) {
    console.error('[clearAllItems]', error);
    return { error: 'Erreur réseau' };
  }
};

export const pingSession = async (userId: number): Promise<any> => {
  if (!userId)
    return;
  fetch(`/user/check_session/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }).catch((err) => {
    console.error("Erreur lors du ping de session :", err);
  });
};

export const checkMpass = async (userId: number | null, mpass: string): Promise<any> => {
  try {
    const response = await fetch(`/user/sudo/${userId}/${mpass}`, {
      method: 'POST'
    });
    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.error || 'Erreur inconnue');
    }
    return res;
  } catch (error) {
    console.error('[checkmpass]', error);
    throw error;
  }
};

export const isAdmin = async (userId: number | null): Promise<any> => {
  try {
    const response = await fetch(`/user/isadmin/${userId}`, {
      method: 'GET'
    });
    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.error || 'Erreur inconnue');
    }
    return res;
  } catch (error) {
    console.error('[isAdmin]', error);
    throw error;
  }
};

export const change_dest = async (selected:string, userId: number | null): Promise<any> => {
  try {
    const response = await fetch(`/user/change_dest/${userId}/${selected}`, {
      method: 'POST'
    });
    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.error || 'Erreur inconnue');
    }
    return res;
  } catch (error) {
    console.error('[change_dest]', error);
    throw error;
  }
};