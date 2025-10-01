import { useState, useEffect } from 'react';
import apiClient from '@/services/api'; // Use centralized client instead of axios
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

// Generic data fetcher - UPDATED
export const useEntityData = <T>(endpoint: string, dependencies: any[] = []) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(endpoint); // Use apiClient instead of axios
        setData(response.data);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        toast({ 
          title: 'Error', 
          description: `Failed to load data`, 
          variant: 'destructive' 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (dependencies.every(dep => dep !== null && dep !== undefined)) {
      fetchData();
    }
  }, [endpoint, ...dependencies, toast]);

  return { data, isLoading, setData };
};

// Authentication & API setup - UPDATED
export const useApiClient = () => {
  const { user } = useAuth();
  
  // No need for interceptor here since it's in apiClient
  
  return { currentUserId: user ? parseInt(user.id) : null };
};

// Polling hook - UPDATED
export const usePolling = (callback: () => Promise<void>, interval: number, dependencies: any[] = []) => {
  useEffect(() => {
    callback(); // Initial call
    
    const intervalId = setInterval(callback, interval);
    return () => clearInterval(intervalId);
  }, dependencies);
};

// CRUD operations hook - UPDATED
export const useCrudOperations = <T>(baseEndpoint: string) => {
  const { toast } = useToast();

  const create = async (data: Partial<T>): Promise<T | null> => {
    try {
      const response = await apiClient.post(baseEndpoint, data); // Use apiClient
      toast({ title: 'Success', description: 'Item created successfully' });
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      toast({ title: 'Error', description: 'Failed to create item', variant: 'destructive' });
      return null;
    }
  };

  const update = async (id: string, data: Partial<T>): Promise<T | null> => {
    try {
      const response = await apiClient.put(`${baseEndpoint}/${id}`, data); // Use apiClient
      toast({ title: 'Success', description: 'Item updated successfully' });
      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
      return null;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`${baseEndpoint}/${id}`); // Use apiClient
      toast({ title: 'Success', description: 'Item deleted successfully' });
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
      return false;
    }
  };

  return { create, update, remove };
};