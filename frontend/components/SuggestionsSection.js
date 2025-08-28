/**
 * SuggestionsSection Component - Minimal Test Version
 * Displays helpful suggestions, tips, and recommendations
 * for users to improve their workflow
 */

const SuggestionsSection = ({
  suggestions = [],
  title = "Suggestions & Tips",
  subtitle = "Discover ways to work smarter with MindOne",
  className = "",
  showViewAll = true
}) => {
  return (
    <section className={`py-8 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="group relative"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 h-full">
                {/* Simple Icon */}
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>

                {/* Type Badge */}
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mb-3 capitalize">
                  {suggestion.type}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                  {suggestion.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {suggestion.description}
                </p>

                {/* Difficulty/Time */}
                {suggestion.difficulty && (
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <span>Difficulty:</span>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < suggestion.difficulty ? 'bg-indigo-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {suggestion.action && (
                  <button
                    onClick={suggestion.action}
                    className="w-full mt-auto text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center justify-center gap-2 py-2 px-4 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all duration-200 group-hover:gap-3"
                  >
                    {suggestion.actionText || 'Learn More'}
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {showViewAll && suggestions.length > 6 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105">
              View All Suggestions
            </button>
          </div>
        )}

        {/* Empty State */}
        {suggestions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions yet</h3>
            <p className="text-gray-500">Start using the platform to get personalized suggestions</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SuggestionsSection;
