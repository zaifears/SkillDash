'use client';

import React, { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';

// --- Type Definitions ---
interface ResumeFeedback {
    overallScore: string;
    overallFeedback: string;
    detailedSuggestions: {
        contactInfo?: string[];
        summary?: string[];
        education?: string[];
        experience?: string[];
        projects?: string[];
        skills?: string[];
    };
    physicalFormattingTips?: string[];
    suggestedActionVerbs?: string[];
    linkedinSynergy?: string;
    atsScore?: number;
    marketInsights?: string[];
}

// --- Reusable Sub-components for a Beautiful UI ---
const InfoCard = memo(({ text, icon }: { text: string; icon: string }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-xl pt-1">{icon}</div>
        <p className="text-gray-700 dark:text-gray-300">{text}</p>
    </div>
));
InfoCard.displayName = 'InfoCard';

const CollapsibleSection = memo(({ title, emoji, children, defaultOpen = false }: { title: string, emoji: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    if (!React.Children.count(children) || React.Children.toArray(children).every(c => !c)) return null;
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <h3 className="text-lg font-semibold flex items-center gap-3">
                    <span className="text-xl">{emoji}</span>
                    {title}
                </h3>
                <span className={`transform transition-transform duration-200 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && <div className="p-6 border-t dark:border-gray-700">{children}</div>}
        </div>
    );
});
CollapsibleSection.displayName = 'CollapsibleSection';

// --- Main Feedback Card ---
const FeedbackCard = ({ feedback, providerInfo }: { feedback: ResumeFeedback, providerInfo?: string }) => {
    const renderInfoCards = (items: string[] | string | undefined, icon: string) => {
        // 🛡️ Defensive check: ensure items is an array before calling map
        if (!items) return null;
        
        // Handle case where items is a string instead of array
        let itemsArray: string[] = [];
        if (Array.isArray(items)) {
            itemsArray = items;
        } else if (typeof items === 'string' && items.trim()) {
            itemsArray = [items];
        }
        
        if (itemsArray.length === 0) return null;
        
        return (
            <div className="space-y-3">
                {itemsArray.map((item, i) => <InfoCard key={i} text={String(item)} icon={icon} />)}
            </div>
        );
    };
    
    return (
        <div className="space-y-6">
            {/* Header with Scores */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Your Resume Analysis</h2>
                <div className="grid grid-cols-2 gap-6 sm:gap-8 text-center mb-6">
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-5xl sm:text-6xl font-bold mb-2">{feedback.overallScore || 'N/A'}</p>
                        <p className="text-sm sm:text-base font-medium opacity-90">out of 10</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-5xl sm:text-6xl font-bold mb-2">
                            {typeof feedback.atsScore === 'number' ? Math.min(100, Math.max(0, feedback.atsScore)) : 'N/A'}
                        </p>
                        <p className="text-sm sm:text-base font-medium opacity-90">ATS Score (0-100)</p>
                    </div>
                </div>
                <div className="mt-4 bg-white/10 p-4 rounded-lg border border-white/20">
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none text-center leading-relaxed">
                        {feedback.overallFeedback}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Detailed Feedback Sections */}
            <CollapsibleSection title="Detailed Suggestions" emoji="📝" defaultOpen={true}>
                <div className="space-y-8">
                    {feedback.detailedSuggestions?.contactInfo && <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span>📞</span> Contact Information
                        </h4>
                        {renderInfoCards(feedback.detailedSuggestions.contactInfo, '✓')}
                    </div>}
                    {feedback.detailedSuggestions?.summary && <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span>📄</span> Professional Summary/Objective
                        </h4>
                        {renderInfoCards(feedback.detailedSuggestions.summary, '✓')}
                    </div>}
                    {feedback.detailedSuggestions?.experience && <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span>💼</span> Work Experience
                        </h4>
                        {renderInfoCards(feedback.detailedSuggestions.experience, '✓')}
                    </div>}
                    {feedback.detailedSuggestions?.education && <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span>🎓</span> Education
                        </h4>
                        {renderInfoCards(feedback.detailedSuggestions.education, '✓')}
                    </div>}
                    {feedback.detailedSuggestions?.skills && <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span>💡</span> Skills & Competencies
                        </h4>
                        {renderInfoCards(feedback.detailedSuggestions.skills, '✓')}
                    </div>}
                    {feedback.detailedSuggestions?.projects && <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span>🚀</span> Projects & Achievements
                        </h4>
                        {renderInfoCards(feedback.detailedSuggestions.projects, '✓')}
                    </div>}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Physical Resume & Formatting" emoji="📄">
                {renderInfoCards(feedback.physicalFormattingTips, '🎨')}
            </CollapsibleSection>

            <CollapsibleSection title="Suggested Action Verbs" emoji="✨">
                <div className="flex flex-wrap gap-2">
                   {feedback.suggestedActionVerbs && Array.isArray(feedback.suggestedActionVerbs) ? feedback.suggestedActionVerbs.map((verb, i) => (
                       <span key={`verb-${i}`} className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">{verb}</span>
                   )) : null}
                </div>
            </CollapsibleSection>

            {feedback.linkedinSynergy && (
                 <CollapsibleSection title="LinkedIn Synergy" emoji="🔗">
                    <InfoCard text={feedback.linkedinSynergy} icon="🔗" />
                 </CollapsibleSection>
            )}
            
            <CollapsibleSection title="Market Insights" emoji="📊">
                {renderInfoCards(feedback.marketInsights, '💰')}
            </CollapsibleSection>

            {providerInfo && <p className="text-xs text-center text-gray-500 mt-6">{providerInfo}</p>}
        </div>
    );
};

export default FeedbackCard;