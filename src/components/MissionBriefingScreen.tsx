import React from 'react';
import { InteractiveTutorial } from './InteractiveTutorial';

interface MissionBriefingScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

export const MissionBriefingScreen: React.FC<MissionBriefingScreenProps> = ({
  onBack,
  onContinue
}) => {
  return (
    <InteractiveTutorial
      mode="onboarding"
      onBack={onBack}
      onComplete={onContinue}
      onSkip={onContinue}
    />
  );
};
