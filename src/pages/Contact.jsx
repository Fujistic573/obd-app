import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState({ type: null, message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: null, message: '' });

        if (!form.name || !form.email || !form.message) {
            setStatus({ type: 'error', message: 'Please fill in all fields.' });
            setLoading(false);
            return;
        }

        // Keys from environment variables
        const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
            setStatus({ type: 'error', message: 'Email service not configured. Please check .env file.' });
            setLoading(false);
            return;
        }

        emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            {
                name: form.name,
                email: form.email,
                message: form.message,
                title: "Website Inquiry",
                time: new Date().toLocaleString(),
                to_name: "OBD.ai Team"
            },
            PUBLIC_KEY
        ).then(() => {
            setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
            setForm({ name: '', email: '', message: '' });
        }).catch((error) => {
            console.error('Email error:', error);
            // EmailJS error status often has a .text property
            const errorMessage = typeof error === 'string' ? error : (error.text || JSON.stringify(error));
            setStatus({ type: 'error', message: `Failed to send: ${errorMessage}` });
        }).finally(() => {
            setLoading(false);
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-cyan-400 mb-6">Contact Us</h1>

                <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                    <p className="text-slate-300 mb-6">
                        Have questions or suggestions? We'd love to hear from you.
                    </p>

                    {status.message && (
                        <div className={`p-4 rounded-lg mb-6 ${status.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-cyan-500 h-32"
                                placeholder="How can we help?"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full font-bold py-2 px-4 rounded transition-colors ${loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-600 text-white'}`}
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
