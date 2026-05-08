import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
    const { user, token, logout, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        company: user?.company || '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                company: user.company || '',
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                updateProfile(data.user);
                setMessage('✅ Perfil actualizado correctamente');
                setIsEditing(false);
            } else {
                setMessage('❌ Error al actualizar el perfil');
            }
        } catch (error) {
            console.error('Save profile error:', error);
            setMessage('❌ Error al guardar');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

            {message && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded">
                    {message}
                </div>
            )}

            <div className="space-y-4">
                {/* Email (no editable) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 mt-1 bg-gray-100 text-gray-700 rounded border border-gray-300 cursor-not-allowed"
                    />
                </div>

                {/* Nombre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 mt-1 rounded border ${
                            isEditing
                                ? 'border-blue-500 bg-white'
                                : 'border-gray-300 bg-gray-100'
                        }`}
                    />
                </div>

                {/* Teléfono */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 mt-1 rounded border ${
                            isEditing
                                ? 'border-blue-500 bg-white'
                                : 'border-gray-300 bg-gray-100'
                        }`}
                    />
                </div>

                {/* Empresa */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Empresa</label>
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 mt-1 rounded border ${
                            isEditing
                                ? 'border-blue-500 bg-white'
                                : 'border-gray-300 bg-gray-100'
                        }`}
                    />
                </div>

                {/* Foto de perfil */}
                {user?.picture && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                        <img
                            src={user.picture}
                            alt="Perfil"
                            className="w-24 h-24 rounded-full border-2 border-blue-500"
                        />
                    </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 mt-6">
                    {!isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Editar Perfil
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        name: user?.name || '',
                                        phone: user?.phone || '',
                                        company: user?.company || '',
                                    });
                                }}
                                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                            >
                                Cancelar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
