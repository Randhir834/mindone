/**
 * MentionList component renders a dropdown list of user suggestions for @ mentions.
 * Handles keyboard navigation and selection of users.
 * Used by the TipTap editor's mention plugin.
 */
import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
  } from 'react';
  
  const MentionList = forwardRef((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
  
    // Select a user from the list and trigger the mention command
    const selectItem = (index) => {
      const item = props.items[index];
      if (item) {
        props.command({ id: item._id, label: item.name });
      }
    };
  
    // Handle up arrow key navigation
    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };
  
    // Handle down arrow key navigation
    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };
  
    // Handle enter key selection
    const enterHandler = () => {
      selectItem(selectedIndex);
    };
  
    // Reset selection when items list changes
    useEffect(() => setSelectedIndex(0), [props.items]);
  
    // Expose keyboard event handlers to parent component
    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          upHandler();
          return true;
        }
        if (event.key === 'ArrowDown') {
          downHandler();
          return true;
        }
        if (event.key === 'Enter') {
          enterHandler();
          return true;
        }
        return false;
      },
    }));
  
    return (
      <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden text-sm w-64">
        {props.items.length ? (
          props.items.map((item, index) => (
            // Render each user suggestion with avatar and details
            <button
              className={`flex items-center w-full px-4 py-2 text-left transition-colors duration-150 ${
                index === selectedIndex ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100'
              }`}
              key={item._id || index}
              onClick={() => selectItem(index)}
            >
              {/* User avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium mr-3 flex-shrink-0">
                {(item.name[0] || '?').toUpperCase()}
              </div>
              {/* User details */}
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className={`text-xs ${index === selectedIndex ? 'text-indigo-200' : 'text-gray-500'}`}>{item.email}</div>
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-2 text-gray-500">No results</div>
        )}
      </div>
    );
  });
  
  MentionList.displayName = 'MentionList';
  export default MentionList;