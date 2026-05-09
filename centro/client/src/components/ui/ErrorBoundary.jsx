import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary]', error, info);
    }

    render() {
        if (this.state.hasError) {
            const isLoadError = this.state.error?.message?.includes('fetch') || this.state.error?.message?.includes('import');
            
            return (
                <div className="empty-state" style={{ border: '1px solid rgba(255,92,92,0.2)', borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center' }}>
                    <AlertTriangle size={40} color="var(--color-danger)" style={{ marginBottom: 16 }} />
                    <h3 style={{ marginBottom: 8 }}>Algo salió mal en este módulo</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                        {isLoadError 
                            ? 'Parece que hubo un problema al cargar los recursos del servidor. Esto suele solucionarse recargando.' 
                            : (this.state.error?.message || 'Error desconocido')}
                    </p>
                    <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => isLoadError ? window.location.reload() : this.setState({ hasError: false, error: null })}
                    >
                        {isLoadError ? 'Recargar Aplicación 🔄' : 'Reintentar'}
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
