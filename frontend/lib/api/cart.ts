import { apiClient } from "./client";
import type { CartItem } from "./types";

export const cartApi = {
  async list(): Promise<CartItem[]> {
    const response = await apiClient.get<CartItem[]>("/cart");
    return response.data;
  },

  async setQuantity(itemId: string, quantity: number): Promise<void> {
    await apiClient.patch(`/cart/items/${itemId}`, { quantity });
  },

  async remove(itemId: string): Promise<void> {
    await apiClient.delete(`/cart/items/${itemId}`);
  },
};
