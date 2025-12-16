import React from 'react';

const About = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-cyan-400 mb-6">About OBD.ai</h1>

                <div className="prose prose-invert">
                    <p className="text-lg text-slate-300 mb-4">
                        OBD.ai is your personal automotive diagnostic assistant, powered by advanced artificial intelligence.
                    </p>

                    <p className="text-slate-300 mb-4">
                        We understand that seeing a "Check Engine" light can be stressful and confusing. Traditional code readers give you a cryptic code, but they don't tell you what it means for <em>your</em> specific car or how urgent it is.
                    </p>

                    <p className="text-slate-300 mb-4">
                        That's where we come in. By combining specific vehicle data with the vast knowledge of modern AI, we provide:
                    </p>

                    <ul className="list-disc list-inside text-slate-300 mb-6 space-y-2">
                        <li>Plain English explanations of error codes.</li>
                        <li>Severity assessments so you know if it's safe to drive.</li>
                        <li>Tailored troubleshooting steps for your specific make and model.</li>
                        <li>Estimates on repair difficulty.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-cyan-400 mt-8 mb-4">Our Mission</h2>
                    <p className="text-slate-300">
                        To empower car owners with knowledge, saving them time, money, and stress when dealing with vehicle maintenance.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
