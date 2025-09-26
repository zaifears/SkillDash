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
    bangladeshContextTips?: string[];
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
    const renderInfoCards = (items: string[] | undefined, icon: string) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="space-y-3">
                {items.map((item, i) => <InfoCard key={i} text={item} icon={icon} />)}
            </div>
        );
    };
    
    return (
        <div className="space-y-6">
            {/* Header with Scores */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Your Resume Analysis</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-4xl font-bold">{feedback.overallScore || 'N/A'}</p>
                        <p className="text-sm opacity-80">Overall Score</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold">{feedback.atsScore || 'N/A'}/10</p>
                        <p className="text-sm opacity-80">ATS Readiness</p>
                    </div>
                </div>
                <div className="mt-4 bg-white/10 p-4 rounded-lg">
                    <ReactMarkdown className="prose prose-invert prose-sm">{feedback.overallFeedback}</ReactMarkdown>
                </div>
            </div>

            {/* Detailed Feedback Sections */}
            <CollapsibleSection title="Detailed Suggestions" emoji="📝" defaultOpen={true}>
                 <div className="space-y-6">
                    {feedback.detailedSuggestions?.contactInfo && <div>
                        <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Contact Info</h4>
                        {renderInfoCards(feedback.detailedSuggestions.contactInfo, '📞')}
                    </div>}
                    {feedback.detailedSuggestions?.summary && <div>
                        <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Summary/Objective</h4>
                        {renderInfoCards(feedback.detailedSuggestions.summary, '📄')}
                    </div>}
                    {feedback.detailedSuggestions?.experience && <div>
                        <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Experience</h4>
                        {renderInfoCards(feedback.detailedSuggestions.experience, '💼')}
                    </div>}
                    {feedback.detailedSuggestions?.skills && <div>
                        <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Skills</h4>
                        {renderInfoCards(feedback.detailedSuggestions.skills, '💡')}
                    </div>}
                 </div>
            </CollapsibleSection>

            <CollapsibleSection title="Physical Resume & Formatting" emoji="📄">
                {renderInfoCards(feedback.physicalFormattingTips, '🎨')}
            </CollapsibleSection>

            <CollapsibleSection title="Bangladesh Market Tips" emoji="🇧🇩">
                {renderInfoCards(feedback.bangladeshContextTips, '📈')}
            </CollapsibleSection>

            <CollapsibleSection title="Suggested Action Verbs" emoji="✨">
                <div className="flex flex-wrap gap-2">
                   {feedback.suggestedActionVerbs?.map((verb, i) => (
                       <span key={`verb-${i}`} className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">{verb}</span>
                   ))}
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