import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-cyan-400 mb-6">Privacy Policy</h1>
                <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                    <p className="text-slate-300">
                        Welcome to OBD.ai. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website
                        and tell you about your privacy rights and how the law protects you.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">2. Data We Collect</h2>
                    <p className="text-slate-300">
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                        <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Identity Data: includes first name, last name, username or similar identifier.</li>
                            <li>Contact Data: includes email address.</li>
                            <li>Vehicle Data: includes make, model, year, and diagnostic codes you submit.</li>
                        </ul>
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">3. How We Use Your Data</h2>
                    <p className="text-slate-300">
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        <ul className="list-disc list-inside ml-4 mt-2">
                            <li>To provide the diagnostic services you request.</li>
                            <li>To manage your account and vehicle history.</li>
                            <li>To improve our website and services.</li>
                        </ul>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
