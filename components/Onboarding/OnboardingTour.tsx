'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function OnboardingTour() {
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboardingStore();

  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const currentStepData = steps[currentStep];

  // Update target position
  const updateTargetPosition = useCallback(() => {
    if (!currentStepData || !isActive) return;

    if (currentStepData.position === 'center') {
      setTargetPosition(null);
      return;
    }

    const target = document.querySelector(currentStepData.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetPosition(rect);
    } else {
      setTargetPosition(null);
    }
  }, [currentStepData, isActive]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isActive || !mounted) return;

    updateTargetPosition();

    // Update on scroll/resize
    window.addEventListener('scroll', updateTargetPosition);
    window.addEventListener('resize', updateTargetPosition);

    return () => {
      window.removeEventListener('scroll', updateTargetPosition);
      window.removeEventListener('resize', updateTargetPosition);
    };
  }, [isActive, currentStep, mounted, updateTargetPosition]);

  if (!isActive || !mounted || !currentStepData) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const isCenterPosition = currentStepData.position === 'center';

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetPosition || isCenterPosition) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const offset = 20;
    const positions = {
      top: {
        top: targetPosition.top - offset,
        left: targetPosition.left + targetPosition.width / 2,
        transform: 'translate(-50%, -100%)',
      },
      bottom: {
        top: targetPosition.bottom + offset,
        left: targetPosition.left + targetPosition.width / 2,
        transform: 'translate(-50%, 0)',
      },
      left: {
        top: targetPosition.top + targetPosition.height / 2,
        left: targetPosition.left - offset,
        transform: 'translate(-100%, -50%)',
      },
      right: {
        top: targetPosition.top + targetPosition.height / 2,
        left: targetPosition.right + offset,
        transform: 'translate(0, -50%)',
      },
      center: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      },
    };

    return positions[currentStepData.position];
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
          onClick={skipOnboarding}
        />
      </AnimatePresence>

      {/* Highlight spotlight */}
      {targetPosition && !isCenterPosition && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            boxShadow: currentStepData.highlightPulse
              ? [
                  '0 0 0 0 rgba(99, 102, 241, 0.7)',
                  '0 0 0 20px rgba(99, 102, 241, 0)',
                  '0 0 0 0 rgba(99, 102, 241, 0)',
                ]
              : '0 0 0 0 rgba(99, 102, 241, 0.7)',
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className="fixed z-[9999] bg-white rounded-lg pointer-events-none"
          style={{
            top: targetPosition.top - 4,
            left: targetPosition.left - 4,
            width: targetPosition.width + 8,
            height: targetPosition.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="fixed z-[10000] max-w-md w-full mx-4"
        style={getTooltipPosition()}
      >
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header gradient */}
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Content */}
          <div className="p-6">
            {/* Close button */}
            <button
              onClick={skipOnboarding}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Icon */}
            <div className="mb-4">
              <Sparkles className="w-8 h-8 text-indigo-500" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 pr-8">
              {currentStepData.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 bg-indigo-500'
                      : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              {/* Skip/Previous */}
              {!isFirstStep ? (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-medium">Geri</span>
                </button>
              ) : (
                <button
                  onClick={skipOnboarding}
                  className="px-4 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Atla
                </button>
              )}

              {/* Next/Complete */}
              <motion.button
                onClick={isLastStep ? completeOnboarding : nextStep}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{isLastStep ? 'Tamamla' : 'Devam'}</span>
                {!isLastStep && <ChevronRight className="w-5 h-5" />}
              </motion.button>
            </div>

            {/* Step counter */}
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {currentStep + 1} / {steps.length}
            </div>
          </div>
        </div>

        {/* Arrow pointer */}
        {targetPosition && !isCenterPosition && (
          <div
            className={`absolute w-4 h-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform rotate-45 ${
              currentStepData.position === 'top'
                ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0'
                : currentStepData.position === 'bottom'
                ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0'
                : currentStepData.position === 'left'
                ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border-t-0 border-r-0'
                : 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-l-0'
            }`}
          />
        )}
      </motion.div>
    </>
  );
}
