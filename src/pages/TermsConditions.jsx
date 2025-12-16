import React from 'react';

const TermsConditions = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-cyan-400 mb-6">Terms & Conditions</h1>
                <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">1. Agreement to Terms</h2>
                    <p className="text-slate-300">
                        By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">2. Use License</h2>
                    <p className="text-slate-300">
                        Permission is granted to temporarily download one copy of the materials (information or software) on OBD.ai's website for personal, non-commercial transitory viewing only.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">3. Disclaimer</h2>
                    <p className="text-slate-300">
                        The materials on OBD.ai's website are provided on an 'as is' basis. OBD.ai makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                    <p className="text-slate-300 mt-2 font-bold">
                        The diagnostic information provided by this AI tool is for informational purposes only and does not constitute professional mechanical advice. Always consult with a qualified mechanic.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsConditions;
