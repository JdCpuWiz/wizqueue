import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { QueueList } from './components/queue/QueueList';
import { UploadZone } from './components/upload/UploadZone';

function App() {
  const [activeTab, setActiveTab] = useState<'queue' | 'upload'>('queue');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-1 inline-flex">
          <button
            onClick={() => setActiveTab('queue')}
            className={`
              px-4 py-2 rounded-md font-medium transition-colors
              ${activeTab === 'queue'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            Queue
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`
              px-4 py-2 rounded-md font-medium transition-colors
              ${activeTab === 'upload'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            Upload Invoice
          </button>
        </div>

        {/* Content */}
        {activeTab === 'queue' ? <QueueList /> : <UploadZone />}
      </div>
    </Layout>
  );
}

export default App;
