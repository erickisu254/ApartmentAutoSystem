import React, { useState } from 'react';
import { generateEmailDraft } from '../services/geminiService';
import { Loader2, Wand2, Copy, Check, MessageSquare, Mail, Phone } from 'lucide-react';

interface AiAssistantProps {
  tenantName: string;
  contextDetails: string;
  tenantPhone?: string;
  tenantEmail?: string;
  onClose: () => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ 
  tenantName, 
  contextDetails, 
  tenantPhone, 
  tenantEmail, 
  onClose 
}) => {
  const [type, setType] = useState<'overdue_rent' | 'lease_expiry' | 'maintenance_notice' | 'welcome'>('overdue_rent');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const typeTitles: Record<string, string> = {
    overdue_rent: 'Notice: Overdue Rent Payment Reminder',
    lease_expiry: 'Notice: Upcoming Lease Expiration',
    maintenance_notice: 'Notification: Scheduled Maintenance Notice',
    welcome: 'Welcome to Your New Home!'
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedText('');
    const text = await generateEmailDraft(tenantName, type, contextDetails);
    setGeneratedText(text);
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clean phone number for WhatsApp/SMS
  const cleanPhone = tenantPhone ? tenantPhone.replace(/[^0-9]/g, '') : '';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wand2 size={20} /> AI Communication Assistant
          </h2>
          <p className="text-blue-100 text-xs mt-1">Draft professional messages & dispatch directly via WhatsApp or Email.</p>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Purpose</label>
            <select
              className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="overdue_rent">Overdue Rent Reminder</option>
              <option value="lease_expiry">Lease Expiry Notice</option>
              <option value="maintenance_notice">Maintenance Notification</option>
              <option value="welcome">Welcome Message</option>
            </select>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Tenant Context:</p>
            <p>{contextDetails}</p>
            {tenantPhone && <p className="text-gray-500">Phone: {tenantPhone}</p>}
            {tenantEmail && <p className="text-gray-500">Email: {tenantEmail}</p>}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            {loading ? 'Composing Draft with Gemini...' : 'Generate Personalized Message'}
          </button>

          {generatedText && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Notice Draft</label>
                <button
                  onClick={copyToClipboard}
                  className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              </div>

              <textarea
                className="w-full h-44 p-3.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm leading-relaxed"
                value={generatedText}
                readOnly
              />

              {/* Direct Action Dispatch Buttons */}
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Direct Message Dispatch:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {tenantPhone ? (
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(generatedText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </a>
                  ) : null}

                  {tenantEmail ? (
                    <a
                      href={`mailto:${tenantEmail}?subject=${encodeURIComponent(typeTitles[type] || 'Notice')}&body=${encodeURIComponent(generatedText)}`}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Mail size={14} /> Email App
                    </a>
                  ) : null}

                  {tenantPhone ? (
                    <a
                      href={`sms:${cleanPhone}?body=${encodeURIComponent(generatedText)}`}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone size={14} /> SMS Text
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-900/50">
          <button 
            onClick={onClose} 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-5 py-2 text-sm font-medium rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
