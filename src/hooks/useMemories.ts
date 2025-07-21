import { useState, useEffect, useCallback } from "react";
import { memoriesAPI } from "../services/api";

export interface Memory {
  id: string;
  userId: string;
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
  createdAt: Date;
  updatedAt: Date;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await memoriesAPI.getAllMemories();
      if (response.success) {
        setMemories(response.data);
      } else {
        setError(response.message);
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
      if (response.success) {
        setMemories((prev) => [...prev, response.data]);
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
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
      if (response.success) {
        setMemories((prev) => prev.filter((memory) => memory.id !== id));
        return true;
      } else {
        setError(response.message);
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
