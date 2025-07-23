import React from 'react';

export const Loader = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
};
