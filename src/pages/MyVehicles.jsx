import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const MyVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const navigate = useNavigate();

    // New vehicle form state
    const [newVehicle, setNewVehicle] = useState({ year: '', make: '', model: '' });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) {
                navigate('/login');
            } else {
                fetchVehicles(session.user.id);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) navigate('/login');
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const fetchVehicles = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('user_id', userId);

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
                        model: newVehicle.model
                    }
                ])
                .select();

            if (error) throw error;
            setVehicles([...vehicles, ...data]);
            setNewVehicle({ year: '', make: '', model: '' });
        } catch (error) {
            alert('Error adding vehicle: ' + error.message);
        }
    };

    if (loading) return <div className="text-white p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-cyan-400">My Garage</h1>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="text-slate-400 hover:text-white"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Add Vehicle Form */}
                <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-xl font-semibold mb-4">Add a Vehicle</h2>
                    <form onSubmit={handleAddVehicle} className="flex gap-4 flex-wrap">
                        <input
                            type="text"
                            placeholder="Year"
                            value={newVehicle.year}
                            onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                            className="bg-slate-700 border border-slate-600 rounded p-2 text-white flex-1 min-w-[100px]"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Make"
                            value={newVehicle.make}
                            onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                            className="bg-slate-700 border border-slate-600 rounded p-2 text-white flex-1 min-w-[100px]"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Model"
                            value={newVehicle.model}
                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                            className="bg-slate-700 border border-slate-600 rounded p-2 text-white flex-1 min-w-[100px]"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded"
                        >
                            Add
                        </button>
                    </form>
                </div>

                {/* Vehicle List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vehicles.length === 0 ? (
                        <p className="text-slate-400">No vehicles added yet.</p>
                    ) : (
                        vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-white">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                                <p className="text-slate-400 mt-2">Added on: {new Date(vehicle.created_at).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyVehicles;
