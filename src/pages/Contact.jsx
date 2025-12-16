import React from 'react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-cyan-400 mb-6">Contact Us</h1>

                <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                    <p className="text-slate-300 mb-6">
                        Have questions or suggestions? We'd love to hear from you.
                    </p>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
                            <textarea
                                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-cyan-500 h-32"
                                placeholder="How can we help?"
                            ></textarea>
                        </div>

                        <button
                            type="button"
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
