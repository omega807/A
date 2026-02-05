import React, { useState } from 'react';
import type { UserProfile as UserProfileType } from '../types';

interface UserProfileProps {
    profile: UserProfileType;
    onProfileChange: (profile: UserProfileType) => void;
}

const LANGUAGES = [
    'American English',
    'British English',
    'Canadian English',
    'Australian English',
];

const UserProfile: React.FC<UserProfileProps> = ({ profile, onProfileChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    
    const handleChange = <K extends keyof UserProfileType,>(
      field: K, 
      value: UserProfileType[K]
    ) => {
        onProfileChange({ ...profile, [field]: value });
    };

    return (
        <div className="pt-6 border-t border-white/5">
             <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex justify-between items-center group mb-4"
            >
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">Strategic Identity</span>
                <svg className={`w-4 h-4 text-gray-600 transform transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'}`}>
                <div className="space-y-6 pb-4">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600">Writing Style</label>
                        <input
                            type="text"
                            value={profile.style}
                            onChange={(e) => handleChange('style', e.target.value)}
                            className="w-full p-3 bg-premium-black border border-premium-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-white outline-none shadow-inner-glass"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600">Tone Response</label>
                        <input
                            type="text"
                            value={profile.tone}
                            onChange={(e) => handleChange('tone', e.target.value)}
                            className="w-full p-3 bg-premium-black border border-premium-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-white outline-none shadow-inner-glass"
                        />
                    </div>
                     <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600">Primary Dialect</label>
                        <select
                            value={profile.language || 'American English'}
                            onChange={(e) => handleChange('language', e.target.value)}
                            className="w-full p-3 bg-premium-black border border-premium-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-white outline-none shadow-inner-glass appearance-none"
                        >
                            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600">Target Audience Demographics</label>
                        <input
                            type="text"
                            value={profile.audience}
                            onChange={(e) => handleChange('audience', e.target.value)}
                            className="w-full p-3 bg-premium-black border border-premium-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-white outline-none shadow-inner-glass"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;