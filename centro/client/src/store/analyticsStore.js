import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAnalyticsStore = create(
    persist(
        (set, get) => ({
            moduleVisits: {}, // { '/dashboard': 15, '/crm': 5 }
            actionLogs: [], // [ { action: 'clicked_auto_fix', time: '...', data: {} } ]
            
            logVisit: (path) => set((state) => {
                const visits = { ...state.moduleVisits };
                visits[path] = (visits[path] || 0) + 1;
                return { moduleVisits: visits };
            }),

            logAction: (action, data = {}) => set((state) => {
                const newLog = { action, data, time: new Date().toISOString() };
                // Mantener solo los últimos 50 eventos para no sobrecargar el storage
                const updatedLogs = [newLog, ...state.actionLogs].slice(0, 50);
                return { actionLogs: updatedLogs };
            }),

            clearAnalytics: () => set({ moduleVisits: {}, actionLogs: [] })
        }),
        {
            name: 'centro-analytics'
        }
    )
);
