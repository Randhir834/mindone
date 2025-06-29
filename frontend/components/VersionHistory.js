import { useState, useEffect } from 'react';
import { 
  getVersionHistory, 
  getVersion, 
  compareVersions as compareVersionsAPI, 
  restoreVersion,
  formatDate,
  getChangeTypeText,
  getChangeTypeColor
} from '../services/versionService';

const VersionHistory = ({ documentId, onVersionRestored }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ v1: null, v2: null });
  const [diffResult, setDiffResult] = useState(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    loadVersionHistory();
  }, [documentId]);

  const loadVersionHistory = async () => {
    try {
      setLoading(true);
      const versionHistory = await getVersionHistory(documentId);
      setVersions(versionHistory);
    } catch (err) {
      setError('Failed to load version history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = async (version) => {
    try {
      const versionData = await getVersion(documentId, version.version);
      setSelectedVersion(versionData);
      setCompareMode(false);
      setShowDiff(false);
    } catch (err) {
      setError('Failed to load version details');
    }
  };

  const handleCompareSelect = (version, side) => {
    setCompareVersions(prev => ({
      ...prev,
      [side]: version
    }));
  };

  const handleCompare = async () => {
    if (!compareVersions.v1 || !compareVersions.v2) {
      setError('Please select two versions to compare');
      return;
    }

    try {
      const diff = await compareVersionsAPI(
        documentId, 
        compareVersions.v1.version, 
        compareVersions.v2.version
      );
      setDiffResult(diff);
      setShowDiff(true);
    } catch (err) {
      setError('Failed to compare versions');
    }
  };

  const handleRestore = async (versionNumber) => {
    if (!confirm('Are you sure you want to restore this version? This will create a new version with the restored content.')) {
      return;
    }

    try {
      await restoreVersion(documentId, versionNumber);
      setError(null);
      if (onVersionRestored) {
        onVersionRestored();
      }
      // Reload version history
      await loadVersionHistory();
    } catch (err) {
      setError('Failed to restore version');
    }
  };

  const renderDiff = () => {
    if (!diffResult) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-3">Version Comparison</h4>
        
        {/* Title Diff */}
        {diffResult.title.changed && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-700 mb-2">Title Changes:</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <span className="text-sm text-red-600 font-medium">Old:</span>
                <p className="text-sm">{diffResult.title.old}</p>
              </div>
              <div className="p-2 bg-green-50 border border-green-200 rounded">
                <span className="text-sm text-green-600 font-medium">New:</span>
                <p className="text-sm">{diffResult.title.new}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Stats */}
        {diffResult.content.changed && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-700 mb-2">Content Changes:</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <span className="font-medium">Word Count:</span>
                <span className={`ml-2 ${diffResult.content.wordCountDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {diffResult.content.wordCountDiff > 0 ? '+' : ''}{diffResult.content.wordCountDiff}
                </span>
              </div>
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <span className="font-medium">Character Count:</span>
                <span className={`ml-2 ${diffResult.content.characterCountDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {diffResult.content.characterCountDiff > 0 ? '+' : ''}{diffResult.content.characterCountDiff}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Visibility Diff */}
        {diffResult.visibility.changed && (
          <div className="mb-4">
            <h5 className="font-medium text-gray-700 mb-2">Visibility Changes:</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <span className="text-sm text-red-600 font-medium">Old:</span>
                <p className="text-sm capitalize">{diffResult.visibility.old}</p>
              </div>
              <div className="p-2 bg-green-50 border border-green-200 rounded">
                <span className="text-sm text-green-600 font-medium">New:</span>
                <p className="text-sm capitalize">{diffResult.visibility.new}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setShowDiff(false);
              setCompareVersions({ v1: null, v2: null });
            }}
            className={`px-3 py-1 text-sm rounded ${
              compareMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {compareMode ? 'Cancel Compare' : 'Compare Versions'}
          </button>
        </div>
      </div>

      {compareMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-900 mb-2">Select versions to compare:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">Version 1:</label>
              <select
                onChange={(e) => {
                  const version = versions.find(v => v.version === parseInt(e.target.value));
                  handleCompareSelect(version, 'v1');
                }}
                className="w-full p-2 border border-blue-300 rounded text-sm"
              >
                <option value="">Select version...</option>
                {versions.map(version => (
                  <option key={version.version} value={version.version}>
                    v{version.version} - {formatDate(version.createdAt)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">Version 2:</label>
              <select
                onChange={(e) => {
                  const version = versions.find(v => v.version === parseInt(e.target.value));
                  handleCompareSelect(version, 'v2');
                }}
                className="w-full p-2 border border-blue-300 rounded text-sm"
              >
                <option value="">Select version...</option>
                {versions.map(version => (
                  <option key={version.version} value={version.version}>
                    v{version.version} - {formatDate(version.createdAt)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleCompare}
            disabled={!compareVersions.v1 || !compareVersions.v2}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Compare
          </button>
        </div>
      )}

      {showDiff && renderDiff()}

      <div className="space-y-3">
        {versions.map(version => (
          <div
            key={version.version}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedVersion?.version === version.version
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleVersionSelect(version)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">v{version.version}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getChangeTypeColor(version.changeType)}`}>
                    {getChangeTypeText(version.changeType)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {version.changeSummary || 'No description'}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>By {version.changedBy?.name || 'Unknown'}</span>
                  <span>{formatDate(version.createdAt)}</span>
                  <span>{version.wordCount} words</span>
                  <span>{version.characterCount} characters</span>
                </div>
              </div>
              <div className="flex gap-2">
                {compareMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!compareVersions.v1) {
                        handleCompareSelect(version, 'v1');
                      } else if (!compareVersions.v2) {
                        handleCompareSelect(version, 'v2');
                      }
                    }}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Select
                  </button>
                )}
                {version.version > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(version.version);
                    }}
                    className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedVersion && !compareMode && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">Version {selectedVersion.version} Details</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Title:</span> {selectedVersion.title}
            </div>
            <div>
              <span className="font-medium">Visibility:</span> {selectedVersion.visibility}
            </div>
            <div>
              <span className="font-medium">Content Preview:</span>
              <div className="mt-1 p-2 bg-white border rounded text-xs text-gray-600 max-h-32 overflow-y-auto">
                {selectedVersion.content ? selectedVersion.content.substring(0, 200) + '...' : 'No content'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory; 