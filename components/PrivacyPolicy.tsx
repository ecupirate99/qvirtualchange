import React from 'react';
import { Shield, Lock, Database } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto text-gray-700 dark:text-gray-300 space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
           <Shield className="text-accent-600 dark:text-accent-400 w-8 h-8 mb-4" />
           <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">Data Protection</h3>
           <p className="text-sm text-gray-600 dark:text-gray-400">We prioritize the security of your personal images. Data is processed securely and minimal information is retained.</p>
        </div>
        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
           <Database className="text-accent-600 dark:text-accent-400 w-8 h-8 mb-4" />
           <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">Local Storage</h3>
           <p className="text-sm text-gray-600 dark:text-gray-400">Your gallery is stored entirely in your browser's local storage. We do not maintain a database of your saved looks.</p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3 text-gray-900 dark:text-white mb-2">
            <h2 className="text-2xl font-display font-bold">1. Information We Collect</h2>
        </div>
        <p>
          When you use Quintin's Virtual Dressing Room, you upload images of people and clothing. 
          These images are temporarily processed to generate the virtual try-on result.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>User-uploaded photos (Person & Clothing)</li>
            <li>Generated output images</li>
            <li>Usage data for service optimization</li>
        </ul>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 text-gray-900 dark:text-white mb-2">
             <h2 className="text-2xl font-display font-bold">2. Third-Party AI Processing</h2>
        </div>
        <p>
          We utilize Google's Gemini AI models to power our virtual try-on technology. By using this service, you acknowledge that your uploaded images 
          are sent to Google's API for processing. The data is used solely for the purpose of generating your request and is subject to 
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-accent-600 dark:text-accent-400 hover:underline ml-1">Google's Privacy Policy</a>.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 text-gray-900 dark:text-white mb-2">
             <h2 className="text-2xl font-display font-bold">3. Data Retention</h2>
        </div>
        <p>
          <strong>We do not permanently store your uploaded photos on our servers.</strong> Once the AI generation is complete, the images are returned to your browser. 
          The "Gallery" feature uses your browser's LocalStorage to save your results on your specific device. Clearing your browser cache will remove these saved images.
        </p>
      </section>

       <section className="space-y-4">
        <div className="flex items-center gap-3 text-gray-900 dark:text-white mb-2">
             <h2 className="text-2xl font-display font-bold">4. Contact Us</h2>
        </div>
        <p>
          If you have any questions about this Privacy Policy, please contact us at privacy@quintinvto.com.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;