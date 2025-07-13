"use client";
import React, { useState } from 'react';
import UserDetails from './UserDetails';
import RoomDetails from './RoomDetails';
import MapGuestToRoom from './MapGuestToRoom';
import CheckinAudit from './CheckinAudit';
import Completion from './Completion';

const steps = [
  { id: 1, name: 'User Details', component: <UserDetails /> },
  { id: 2, name: 'Room Details', component: <RoomDetails /> },
  { id: 3, name: 'Map Guest to Room', component: <MapGuestToRoom /> },
  { id: 4, name: 'Check-in Audit', component: <CheckinAudit /> },
  { id: 5, name: 'Complete', component: <Completion /> },
];

const MultiStepOnboard = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep > index ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}
            >
              {currentStep > index ? '✔' : step.id}
            </div>
            <p className="ml-4">{step.name}</p>
          </div>
        ))}
      </div>

      {steps[currentStep - 1].component}

      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Back
          </button>
        )}
        {currentStep < steps.length && (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Next
          </button>
        )}
        {currentStep === steps.length && (
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
            Complete
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiStepOnboard;