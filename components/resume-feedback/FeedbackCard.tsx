'use client';

import React, { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';

// --- Type Definitions ---
interface ResumeFeedback {
    overallScore: string;
    overallFeedback: string;
    // Weaknesses Analysis
    weaknessesAnalysis?: {
        criticalGaps?: string[];
        marketImpact?: string;
    };
    // ATS Optimization (simplified)
    atsOptimization?: {
        atsScore?: number;
        keywordGaps?: string[];
        keywordMatches?: string[];
    };
    // JD Alignment
    jdAlignment?: {
        alignmentPercentage?: number | null;
        matchedRequirements?: string[];
        missingRequirements?: string[];
    };
    // Section Feedback (4 main sections)
    sectionFeedback?: {
        summary?: { status?: string; feedback?: string };
        experience?: { status?: string; feedback?: string };
        skills?: { status?: string; feedback?: string };
        education?: { status?: string; feedback?: string };
    };
    // Top improvements (flattened)
    topImprovements?: string[];
    // Suggested action verbs
    suggestedActionVerbs?: string[];
    // Final Recommendation (simplified)
    finalRecommendation?: {
        isReadyForApplying?: boolean;
        nextSteps?: string[];
    };
    // Legacy field
    atsScore?: number;
}

// --- Reusable Sub-components for a Beautiful UI ---
const InfoCard = memo(({ text, icon, variant = 'default' }: { text: string; icon: string; variant?: 'default' | 'warning' | 'success' | 'danger' }) => {
    const variantStyles = {
        default: 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-50',
        warning: 'bg-amber-50 dark:bg-gray-700 border-amber-200 dark:border-amber-600 text-gray-900 dark:text-amber-50',
        success: 'bg-green-50 dark:bg-gray-700 border-green-200 dark:border-green-600 text-gray-900 dark:text-green-50',
        danger: 'bg-red-50 dark:bg-gray-700 border-red-200 dark:border-red-600 text-gray-900 dark:text-red-50'
    };
    
    return (
        <div className={`flex items-start gap-4 p-4 rounded-lg border ${variantStyles[variant]}`}>
            <div className="text-xl pt-1 flex-shrink-0">{icon}</div>
            <div className="prose prose-sm dark:prose-invert max-w-none [&_*]:text-current [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0 [&_li]:m-0 [&_strong]:text-inherit [&_em]:text-inherit">
                <ReactMarkdown>{text}</ReactMarkdown>
            </div>
        </div>
    );
});
InfoCard.displayName = 'InfoCard';

const PriorityBadge = memo(({ priority }: { priority: number }) => {
    const colors = {
        1: 'bg-red-500 text-white',
        2: 'bg-orange-500 text-white',
        3: 'bg-yellow-500 text-gray-900'
    };
    return (
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${colors[priority as keyof typeof colors] || 'bg-gray-500 text-white'}`}>
            {priority}
        </span>
    );
});
PriorityBadge.displayName = 'PriorityBadge';

const CollapsibleSection = memo(({ title, emoji, children, defaultOpen = false, variant = 'default' }: { 
    title: string; 
    emoji: string; 
    children: React.ReactNode; 
    defaultOpen?: boolean;
    variant?: 'default' | 'warning' | 'success' | 'danger';
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    if (!React.Children.count(children) || React.Children.toArray(children).every(c => !c)) return null;
    
    const headerStyles = {
        default: 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
        warning: 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30',
        success: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30',
        danger: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
    };
    
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`w-full p-4 flex justify-between items-center text-left transition-colors ${headerStyles[variant]}`}
            >
                <h3 className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <span className="text-xl">{emoji}</span>
                    {title}
                </h3>
                <span className={`transform transition-transform duration-200 text-gray-500 dark:text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && <div className="p-6 border-t border-gray-200 dark:border-gray-700">{children}</div>}
        </div>
    );
});
CollapsibleSection.displayName = 'CollapsibleSection';

// --- Main Feedback Card ---
const FeedbackCard = ({ feedback, providerInfo }: { feedback: ResumeFeedback; providerInfo?: string }) => {
    const renderInfoCards = (items: string[] | string | undefined, icon: string, variant: 'default' | 'warning' | 'success' | 'danger' = 'default') => {
        if (!items) return null;
        
        let itemsArray: string[] = [];
        if (Array.isArray(items)) {
            itemsArray = items;
        } else if (typeof items === 'string' && items.trim()) {
            itemsArray = [items];
        }
        
        if (itemsArray.length === 0) return null;
        
        return (
            <div className="space-y-3">
                {itemsArray.map((item, i) => <InfoCard key={i} text={String(item)} icon={icon} variant={variant} />)}
            </div>
        );
    };

    // Get effective ATS score
    const atsScore = feedback.atsOptimization?.atsScore ?? feedback.atsScore ?? 0;
    
    // Check if JD alignment data exists
    const hasJdAlignment = feedback.jdAlignment?.alignmentPercentage !== null && feedback.jdAlignment?.alignmentPercentage !== undefined;
    
    return (
        <div className="space-y-6">
            {/* Header with Scores */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Your Resume Analysis</h2>
                <div className={`grid ${hasJdAlignment ? 'grid-cols-3' : 'grid-cols-2'} gap-4 sm:gap-8 text-center mb-6`}>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-4xl sm:text-5xl font-bold mb-2">{feedback.overallScore || 'N/A'}</p>
                        <p className="text-xs sm:text-sm font-medium opacity-90">Overall Score</p>
                        <p className="text-xs opacity-70">out of 10</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-4xl sm:text-5xl font-bold mb-2">
                            {typeof atsScore === 'number' ? Math.min(100, Math.max(0, atsScore)) : 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm font-medium opacity-90">ATS Score</p>
                        <p className="text-xs opacity-70">out of 100</p>
                    </div>
                    {hasJdAlignment && (
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-4xl sm:text-5xl font-bold mb-2">
                                {feedback.jdAlignment?.alignmentPercentage}%
                            </p>
                            <p className="text-xs sm:text-sm font-medium opacity-90">JD Match</p>
                            <p className="text-xs opacity-70">alignment</p>
                        </div>
                    )}
                </div>
                
                {/* Overall Feedback */}
                <div className="mt-4 bg-white/10 p-4 rounded-lg border border-white/20">
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none text-center leading-relaxed">
                        {feedback.overallFeedback}
                    </ReactMarkdown>
                </div>
            </div>

            {/* 🎯 TOP IMPROVEMENTS - Most Important Section */}
            {feedback.topImprovements && feedback.topImprovements.length > 0 && (
                <CollapsibleSection title="🎯 Top Things to Fix NOW" emoji="🔥" defaultOpen={true} variant="danger">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            These are the most impactful improvements you can make. Fix these first!
                        </p>
                        {feedback.topImprovements.map((improvement, index) => (
                            <div key={index} className={`flex items-start gap-4 p-4 rounded-lg border ${
                                index === 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
                                index === 1 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' :
                                'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                            }`}>
                                <PriorityBadge priority={index + 1} />
                                <div className="flex-1">
                                    <p className={`font-semibold mb-1 ${
                                        index === 0 ? 'text-red-800 dark:text-red-200' :
                                        index === 1 ? 'text-orange-800 dark:text-orange-200' :
                                        'text-yellow-800 dark:text-yellow-200'
                                    }`}>
                                        {index === 0 ? 'Most Critical' : index === 1 ? 'High Impact' : 'Important'}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">{improvement}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {/* CRITICAL GAPS / WEAKNESSES */}
            {feedback.weaknessesAnalysis && feedback.weaknessesAnalysis.criticalGaps?.length ? (
                <CollapsibleSection title="Critical Gaps & Weaknesses" emoji="⚠️" defaultOpen={true} variant="warning">
                    <div className="space-y-6">
                        {feedback.weaknessesAnalysis.criticalGaps && feedback.weaknessesAnalysis.criticalGaps.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-lg text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                                    <span>🚨</span> What's Holding You Back
                                </h4>
                                {renderInfoCards(feedback.weaknessesAnalysis.criticalGaps, '❌', 'danger')}
                            </div>
                        )}
                        
                        {feedback.weaknessesAnalysis.marketImpact && (
                            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
                                <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">💼 Market Impact</p>
                                <p className="text-gray-700 dark:text-gray-300">{feedback.weaknessesAnalysis.marketImpact}</p>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
            ) : null}

            {/* JD ALIGNMENT (if job description was provided) */}
            {hasJdAlignment && feedback.jdAlignment && (
                <CollapsibleSection title="Job Description Alignment" emoji="🎯" defaultOpen={true}>
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {feedback.jdAlignment.matchedRequirements && feedback.jdAlignment.matchedRequirements.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                                        <span>✅</span> Requirements You Match
                                    </h4>
                                    {renderInfoCards(feedback.jdAlignment.matchedRequirements, '✓', 'success')}
                                </div>
                            )}
                            
                            {feedback.jdAlignment.missingRequirements && feedback.jdAlignment.missingRequirements.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                                        <span>❌</span> Missing Requirements
                                    </h4>
                                    {renderInfoCards(feedback.jdAlignment.missingRequirements, '✗', 'danger')}
                                </div>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>
            )}

            {/* ATS OPTIMIZATION */}
            {feedback.atsOptimization && (feedback.atsOptimization.keywordGaps?.length || feedback.atsOptimization.keywordMatches?.length) ? (
                <CollapsibleSection title="ATS Optimization" emoji="🤖" defaultOpen={false}>
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {feedback.atsOptimization.keywordMatches && feedback.atsOptimization.keywordMatches.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">✅ Keywords Found</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {feedback.atsOptimization.keywordMatches.map((keyword, i) => (
                                            <span key={i} className="bg-green-100 text-green-800 text-sm px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {feedback.atsOptimization.keywordGaps && feedback.atsOptimization.keywordGaps.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">❌ Missing Keywords</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {feedback.atsOptimization.keywordGaps.map((keyword, i) => (
                                            <span key={i} className="bg-red-100 text-red-800 text-sm px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>
            ) : null}

            {/* SECTION FEEDBACK */}
            {feedback.sectionFeedback && (
                <CollapsibleSection title="Section-by-Section Feedback" emoji="📝" defaultOpen={false}>
                    <div className="space-y-6">
                        {feedback.sectionFeedback.summary?.feedback && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <span>📄</span> Professional Summary
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        feedback.sectionFeedback.summary.status === 'complete' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                    }`}>
                                        {feedback.sectionFeedback.summary.status}
                                    </span>
                                </h4>
                                <InfoCard text={feedback.sectionFeedback.summary.feedback} icon="⚠️" variant="warning" />
                            </div>
                        )}
                        {feedback.sectionFeedback.experience?.feedback && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <span>💼</span> Work Experience
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        feedback.sectionFeedback.experience.status === 'complete' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                    }`}>
                                        {feedback.sectionFeedback.experience.status}
                                    </span>
                                </h4>
                                <InfoCard text={feedback.sectionFeedback.experience.feedback} icon="⚠️" variant="warning" />
                            </div>
                        )}
                        {feedback.sectionFeedback.skills?.feedback && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <span>💡</span> Skills
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        feedback.sectionFeedback.skills.status === 'complete' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                    }`}>
                                        {feedback.sectionFeedback.skills.status}
                                    </span>
                                </h4>
                                <InfoCard text={feedback.sectionFeedback.skills.feedback} icon="⚠️" variant="warning" />
                            </div>
                        )}
                        {feedback.sectionFeedback.education?.feedback && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <span>🎓</span> Education
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        feedback.sectionFeedback.education.status === 'complete' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                    }`}>
                                        {feedback.sectionFeedback.education.status}
                                    </span>
                                </h4>
                                <InfoCard text={feedback.sectionFeedback.education.feedback} icon="⚠️" variant="warning" />
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
            )}

            {/* FINAL RECOMMENDATION */}
            {feedback.finalRecommendation && (
                <CollapsibleSection title="Final Verdict" emoji="🏁" defaultOpen={true}>
                    <div className="space-y-4">
                        {/* Ready Status */}
                        <div className={`p-4 rounded-lg border ${feedback.finalRecommendation.isReadyForApplying 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{feedback.finalRecommendation.isReadyForApplying ? '✅' : '⚠️'}</span>
                                <div>
                                    <p className={`font-bold text-lg ${feedback.finalRecommendation.isReadyForApplying 
                                        ? 'text-green-800 dark:text-green-200' 
                                        : 'text-amber-800 dark:text-amber-200'}`}>
                                        {feedback.finalRecommendation.isReadyForApplying 
                                            ? 'Ready to Apply!' 
                                            : 'Needs Improvement Before Applying'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Next Steps */}
                        {feedback.finalRecommendation.nextSteps && feedback.finalRecommendation.nextSteps.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">📌 Your Next Steps</h4>
                                {renderInfoCards(feedback.finalRecommendation.nextSteps, '➡️', 'default')}
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
            )}

            {/* Suggested Action Verbs */}
            {feedback.suggestedActionVerbs && feedback.suggestedActionVerbs.length > 0 && (
                <CollapsibleSection title="Suggested Action Verbs" emoji="✨" defaultOpen={false}>
                    <div className="flex flex-wrap gap-2">
                       {feedback.suggestedActionVerbs.map((verb, i) => (
                           <span key={`verb-${i}`} className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">{verb}</span>
                       ))}
                    </div>
                </CollapsibleSection>
            )}

            {providerInfo && <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">{providerInfo}</p>}
        </div>
    );
};

export default FeedbackCard;