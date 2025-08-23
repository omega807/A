
import React, { useState } from 'react';
import type { UserProfile as UserProfileType } from '../types';

interface UserProfileProps {
    profile: UserProfileType;
    onProfileChange: (profile: UserProfileType) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, onProfileChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    
    const handleChange = <K extends keyof UserProfileType,>(
      field: K, 
      value: UserProfileType[K]
    ) => {
        onProfileChange({ ...profile, [field]: value });
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full text-left p-6 flex justify-between items-center bg-gray-700/50 hover:bg-gray-700 transition"
            >
                <h2 className="text-xl font-semibold text-white">Author Profile</h2>
                <svg className={`w-6 h-6 transform transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {!isCollapsed && (
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="style" className="block text-sm font-medium text-gray-400 mb-1">Writing Style</label>
                        <input
                            type="text"
                            id="style"
                            value={profile.style}
                            onChange={(e) => handleChange('style', e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-gray-400 mb-1">Tone of Voice</label>
                        <input
                            type="text"
                            id="tone"
                            value={profile.tone}
                            onChange={(e) => handleChange('tone', e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="audience" className="block text-sm font-medium text-gray-400 mb-1">Target Audience</label>
                        <input
                            type="text"
                            id="audience"
                            value={profile.audience}
                            onChange={(e) => handleChange('audience', e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
