import { apiClient } from "./client";
import type { ChatMessage, Recipe } from "./types";

// Recipe generation and chat both wait on the LLM, so they get a longer timeout.
const LLM_TIMEOUT = 60000;

export const recipesApi = {
  async list(): Promise<Recipe[]> {
    const response = await apiClient.get<Recipe[]>("/recipes");
    return response.data;
  },

  async generate(regenerate = false): Promise<Recipe> {
    const response = await apiClient.post<{ recipe: Recipe }>(
      "/recipes",
      { regenerate },
      { timeout: LLM_TIMEOUT },
    );
    return response.data.recipe;
  },

  async setFavorite(id: string, isFavorite: boolean): Promise<Recipe> {
    const response = await apiClient.patch<Recipe>(`/recipes/${id}/favorite`, { is_favorite: isFavorite });
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/recipes/${id}`);
  },

  async chat(id: string, messages: ChatMessage[]): Promise<string> {
    const response = await apiClient.post<{ reply: string }>(
      `/recipes/${id}/chat`,
      { messages },
      { timeout: LLM_TIMEOUT },
    );
    return response.data.reply;
  },
};
