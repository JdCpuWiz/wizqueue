import React from 'react';

interface UploadProgressProps {
  isUploading: boolean;
  isProcessing: boolean;
  filename: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  isProcessing,
  filename,
}) => {
  return (
    <div className="card">
      <div className="text-center">
        <svg
          className="animate-spin h-16 w-16 text-primary-600 mx-auto mb-6"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isUploading && 'Uploading...'}
          {isProcessing && 'Processing Invoice...'}
        </h3>

        <p className="text-sm text-gray-600 mb-6">
          {filename}
        </p>

        <div className="max-w-md mx-auto">
          <div className="space-y-3 text-left">
            {/* Upload Step */}
            <div className="flex items-center gap-3">
              {isUploading ? (
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
              ) : (
                <svg
                  className="flex-shrink-0 w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              <span className={isUploading ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                Uploading file
              </span>
            </div>

            {/* Processing Step */}
            <div className="flex items-center gap-3">
              {!isUploading && isProcessing ? (
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
              ) : !isUploading ? (
                <svg
                  className="flex-shrink-0 w-6 h-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                </svg>
              ) : (
                <svg
                  className="flex-shrink-0 w-6 h-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                </svg>
              )}
              <span className={isProcessing && !isUploading ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                Extracting product information with AI
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          This may take a minute depending on the invoice size...
        </p>
      </div>
    </div>
  );
};
