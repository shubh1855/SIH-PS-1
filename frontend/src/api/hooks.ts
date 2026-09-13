import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  DistrictGeoJSON,
  ActiveAlert,
  SensorResponse,
  FieldReport,
  AlertRequest,
  AlertResponse,
} from '../types';

export function useRiskZones() {
  return useQuery<DistrictGeoJSON>({
    queryKey: ['riskZones'],
    queryFn: async () => {
      const { data } = await apiClient.get('/risk/zones');
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useActiveAlerts() {
  return useQuery<ActiveAlert[]>({
    queryKey: ['activeAlerts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/alerts/active');
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useSensorData(stationId: string) {
  return useQuery<SensorResponse>({
    queryKey: ['sensorData', stationId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/sensors/live?station_id=${stationId}`);
      return data;
    },
    enabled: !!stationId,
  });
}

export function useReports() {
  return useQuery<FieldReport[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reports');
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useSendAlert() {
  const queryClient = useQueryClient();
  return useMutation<AlertResponse, Error, AlertRequest>({
    mutationFn: async (request) => {
      const { data } = await apiClient.post('/alerts/send-sms', request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeAlerts'] });
    },
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation<FieldReport, Error, FormData>({
    mutationFn: async (formData) => {
      const { data } = await apiClient.post('/reports/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
