import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import VehicleSelector from '../components/VehicleSelector';

const MyVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const navigate = useNavigate();

    const [newVehicle, setNewVehicle] = useState({ year: '', make: '', model: '', trim: '' });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                fetchVehicles(session.user.id);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchVehicles = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVehicles(data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        if (!session) return;

        try {
            const { data, error } = await supabase
                .from('vehicles')
                .insert([
                    {
                        user_id: session.user.id,
                        year: newVehicle.year,
                        make: newVehicle.make,
                        model: newVehicle.model,
                        trim: newVehicle.trim || null
                    }
                ])
                .select();

            if (error) throw error;
            setVehicles([...data, ...vehicles]);
            setNewVehicle({ year: '', make: '', model: '', trim: '' });
            setShowAddForm(false);
        } catch (error) {
            alert('Error adding vehicle: ' + error.message);
        }
    };

    const handleDeleteVehicle = async (id) => {
        if (!confirm('Are you sure you want to remove this vehicle?')) return;

        try {
            const { error } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setVehicles(vehicles.filter(v => v.id !== id));
        } catch (error) {
            alert('Error removing vehicle: ' + error.message);
        }
    };

    const handleEditVehicle = (vehicle) => {
        setEditingVehicle(vehicle);
        setNewVehicle({
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim || ''
        });
        setShowAddForm(true);
    };

    const handleUpdateVehicle = async (e) => {
        e.preventDefault();
        if (!session || !editingVehicle) return;

        try {
            const { data, error } = await supabase
                .from('vehicles')
                .update({
                    year: newVehicle.year,
                    make: newVehicle.make,
                    model: newVehicle.model,
                    trim: newVehicle.trim || null
                })
                .eq('id', editingVehicle.id)
                .select();

            if (error) throw error;
            setVehicles(vehicles.map(v => v.id === editingVehicle.id ? data[0] : v));
            setNewVehicle({ year: '', make: '', model: '', trim: '' });
            setEditingVehicle(null);
            setShowAddForm(false);
        } catch (error) {
            alert('Error updating vehicle: ' + error.message);
        }
    };

    const handleFormSubmit = editingVehicle ? handleUpdateVehicle : handleAddVehicle;

    const handleCancelForm = () => {
        setShowAddForm(false);
        setEditingVehicle(null);
        setNewVehicle({ year: '', make: '', model: '', trim: '' });
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-cyan-400 text-2xl animate-pulse">Loading your garage...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                            My Garage
                        </h1>
                        <p className="text-slate-400">
                            {session?.user?.email}
                        </p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-6">
                        <div className="text-cyan-400 text-sm font-medium mb-1">Total Vehicles</div>
                        <div className="text-3xl font-bold">{vehicles.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-6">
                        <div className="text-blue-400 text-sm font-medium mb-1">Latest Addition</div>
                        <div className="text-lg font-semibold truncate">
                            {vehicles.length > 0 ? `${vehicles[0].year} ${vehicles[0].make}` : 'None yet'}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-6">
                        <div className="text-violet-400 text-sm font-medium mb-1">Quick Actions</div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="text-sm text-violet-300 hover:text-violet-200 transition-colors"
                        >
                            + Add Vehicle
                        </button>
                    </div>
                </div>

                {/* Add Vehicle Form (Modal) */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-slate-700">
                            <h2 className="text-2xl font-bold text-cyan-400 mb-6">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <VehicleSelector vehicle={newVehicle} onVehicleChange={setNewVehicle} />

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCancelForm}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/30"
                                    >
                                        {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Vehicle Grid */}
                {vehicles.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🚗</div>
                        <h3 className="text-2xl font-bold text-slate-300 mb-2">Your garage is empty</h3>
                        <p className="text-slate-400 mb-6">Add your first vehicle to get started</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-cyan-500/30"
                        >
                            + Add Your First Vehicle
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-200">Your Vehicles</h2>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                            >
                                + Add Vehicle
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehicles.map((vehicle) => (
                                <div
                                    key={vehicle.id}
                                    className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-4xl">🚙</div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditVehicle(vehicle)}
                                                className="text-slate-500 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Edit vehicle"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                                className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove vehicle"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {vehicle.year} {vehicle.make}
                                    </h3>
                                    <p className="text-lg text-slate-300 mb-3">{vehicle.model}</p>
                                    <div className="text-xs text-slate-500 border-t border-slate-700 pt-3">
                                        Added {new Date(vehicle.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyVehicles;
