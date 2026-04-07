'use client';

import React, { useEffect, useMemo, useState } from 'react';

type TypingWordRotatorProps = {
  initialWord?: string;
};

export default function TypingWordRotator({ initialWord = 'Potential' }: TypingWordRotatorProps) {
  const skills = useMemo(
    () => [
      'Potential',
      'Creativity',
      'Skills',
      'Talents',
      'Future',
      'Public Speaking',
      'Excel',
      'PowerBI',
      'Data Analysis',
      'Project Management',
      'Digital Marketing',
      'Financial Modeling',
      'Leadership',
      'Business Strategy',
    ],
    [],
  );

  const initialIndex = Math.max(skills.indexOf(initialWord), 0);
  const [skillIndex, setSkillIndex] = useState(initialIndex);
  const [displayedText, setDisplayedText] = useState(initialWord);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    const currentSkill = skills[skillIndex] ?? skills[0];
    const isWordComplete = displayedText === currentSkill;
    const isWordCleared = displayedText.length === 0;

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting && isWordComplete) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && isWordCleared) {
          setIsDeleting(false);
          setSkillIndex((prev) => (prev + 1) % skills.length);
          return;
        }

        const nextLength = displayedText.length + (isDeleting ? -1 : 1);
        setDisplayedText(currentSkill.slice(0, Math.max(nextLength, 0)));
      },
      !isDeleting && isWordComplete ? 1400 : isDeleting ? 55 : 110,
    );

    return () => window.clearTimeout(timeout);
  }, [displayedText, hasMounted, isDeleting, skillIndex, skills]);

  return (
    <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-bold">
      {displayedText}
      <span className="opacity-75 animate-pulse">|</span>
    </span>
  );
}
