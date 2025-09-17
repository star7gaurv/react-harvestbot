import { useState, useEffect, useCallback } from "react";
import { memoriesAPI } from "../services/api";

export interface Memory {
  id: string;
  userId?: string;  // Optional since API doesn't return this
  name: string;
  exchangeType: "CEX" | "DEX";
  network: string;
  symbol: string;
  minTime: number;
  maxTime: number;
  minSpread: number;
  maxSpread: number;
  buyRatio: number;
  walletPercentage: number;
  pauseVolume: number;
  exchangeTypeValue?: string;
  created_at: string;  // Match API response format
  createdAt?: Date;    // Keep for backward compatibility
  updatedAt?: Date;    // Optional since API doesn't return this
}

export interface CreateMemoryData {
  name: string;
  network: string;
  symbol: string;
  exchangeType: "CEX" | "DEX";
  minTime: number;
  maxTime: number;
  minSpread: number;
  maxSpread: number;
  buyRatio: number;
  walletPercentage: number;
  pauseVolume: number;
  exchangeTypeValue?: string;
}

export const useMemories = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  // Start in loading state to avoid initial empty-state flash
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Normalize different possible API response shapes into Memory[]
  const normalizeMemories = (response: any): { data?: Memory[]; message?: string } => {
    try {
      // Common shape: { success: true, data: [...] }
      if (response && typeof response === "object") {
        if (response.success === true && Array.isArray(response.data)) {
          return { data: response.data };
        }

        // Shape: { data: [...] }
        if (Array.isArray(response.data)) {
          return { data: response.data };
        }

        // Shape: { memories: [...] }
        if (Array.isArray(response.memories)) {
          return { data: response.memories };
        }

        // Some APIs embed under { result: [...] }
        if (Array.isArray(response.result)) {
          return { data: response.result };
        }

        // If explicitly unsuccessful with message
        if (response.success === false) {
          return { message: response.message || "Request failed" };
        }
      }

      // Shape: [...]
      if (Array.isArray(response)) {
        return { data: response } as { data: Memory[] };
      }

      return { message: "Unexpected response format" };
    } catch (e) {
      return { message: "Failed to parse response" };
    }
  };

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await memoriesAPI.getAllMemories();
      const { data, message } = normalizeMemories(response);
      if (data) {
        setMemories(data);
      } else {
        setMemories([]);
        setError(message || "Failed to fetch memories");
      }
    } catch (err) {
      setError("Failed to fetch memories");
      console.error("Error fetching memories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMemory = useCallback(async (memoryData: CreateMemoryData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await memoriesAPI.createMemory(memoryData);
      // Accept a variety of shapes
      if (response?.success && response?.data) {
        setMemories((prev) => [...prev, response.data]);
        return response.data;
      }
      if (response && !response.success && response.message) {
        setError(response.message);
        return null;
      }
      // If API returns the created entity directly
      if (response && !response.success) {
        // fallthrough to try common fields
      }
      if (response && typeof response === "object") {
        const created = response.data ?? response.result ?? response;
        setMemories((prev) => [...prev, created]);
        return created;
      }
      setError("Unexpected response while creating memory");
      return null;
    } catch (err) {
      setError("Failed to create memory");
      console.error("Error creating memory:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMemory = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await memoriesAPI.deleteMemory(id);
      if (response?.success || response?.status === "ok" || response === true) {
        setMemories((prev) => prev.filter((memory) => memory.id !== id));
        return true;
      } else {
        setError(response?.message || "Failed to delete memory");
        return false;
      }
    } catch (err) {
      setError("Failed to delete memory");
      console.error("Error deleting memory:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const getMemoryById = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await memoriesAPI.getMemoryById(id);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      setError("Failed to fetch memory");
      console.error("Error fetching memory:", err);
      return null;
    }
  }, []);

  const loadMemory = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await memoriesAPI.useMemory(id);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      setError("Failed to load memory");
      console.error("Error loading memory:", err);
      return null;
    }
  }, []);

  return {
    memories,
    loading,
    error,
    fetchMemories,
    createMemory,
    deleteMemory,
    getMemoryById,
    loadMemory,
  };
};
