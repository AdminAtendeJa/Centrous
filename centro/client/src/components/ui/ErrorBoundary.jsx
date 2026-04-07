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
            return (
                <div className="empty-state" style={{ border: '1px solid rgba(255,92,92,0.2)', borderRadius: 'var(--radius-lg)', padding: 40 }}>
                    <AlertTriangle size={40} color="var(--color-danger)" />
                    <h3>Algo salió mal en este módulo</h3>
                    <p>{this.state.error?.message || 'Error desconocido'}</p>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => this.setState({ hasError: false, error: null })}>
                        Reintentar
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
