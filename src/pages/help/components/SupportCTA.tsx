import React from 'react';

const SupportCTA: React.FC = () => {
  return (
    <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-center text-white">
      <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
      <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
        Our dedicated support team is here to assist you with any questions or issues you might have.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="bg-white text-blue-600 py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors font-medium">
          Contact Support
        </button>
        <button className="border border-white text-white py-3 px-8 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors font-medium">
          Schedule a Call
        </button>
      </div>
    </div>
  );
};

export default SupportCTA;