import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-700"></div>
    </div>
  );
};

export default Loader;
