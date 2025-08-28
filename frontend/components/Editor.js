/**
 * Professional rich text editor component built with TipTap.
 * Supports text formatting, mentions, images, YouTube embeds, and more.
 * @param {string} content - Initial content of the editor
 * @param {Function} onUpdate - Callback when content changes
 * @param {boolean} readOnly - Whether the editor is in read-only mode
 * @param {string} documentId - ID of the current document
 */
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { useEffect, useRef, useState } from 'react';
import 'tippy.js/dist/tippy.css';
import toast from 'react-hot-toast';

import MentionList from './MentionList';
import { userService } from '../services/userService';

/**
 * Enhanced toolbar button component with better styling
 */
const ToolbarButton = ({ onClick, active, icon, label, children, className = '', ...props }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent ${
      active 
        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm' 
        : 'text-gray-600 hover:text-gray-800'
    } ${className}`}
    title={label}
    {...props}
  >
    {icon ? <span className="text-lg">{icon}</span> : children}
  </button>
);

/**
 * Toolbar separator component
 */
const ToolbarSeparator = () => (
  <div className="w-px h-6 bg-gray-300 mx-2" />
);

/**
 * Enhanced color picker component
 */
const ColorPicker = ({ editor, label, type = 'text' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState('#000000');
  
  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#f5222d', '#fa8c16', '#fadb14', '#52c41a', '#13c2c2', '#1890ff', '#722ed1', '#eb2f96',
    '#ff4d4f', '#ff7a45', '#ffa940', '#73d13d', '#36cfc9', '#40a9ff', '#9254de', '#f759ab'
  ];

  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (type === 'text') {
      editor.chain().focus().setColor(newColor).run();
    } else {
      editor.chain().focus().setHighlight({ color: newColor }).run();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <ToolbarButton
        onClick={() => setIsOpen(!isOpen)}
        label={label}
        className="relative"
      >
        <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: color }} />
        <span className="ml-2 text-xs">▼</span>
      </ToolbarButton>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="grid grid-cols-8 gap-2">
            {colors.map((c) => (
              <button
                key={c}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                onClick={() => handleColorChange(c)}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Floating toolbar for quick formatting
 */
const FloatingToolbar = ({ editor }) => {
  if (!editor) return null;

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 100 }}
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1"
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        label="Bold (Ctrl+B)"
        icon="B"
        className="font-bold"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        label="Italic (Ctrl+I)"
        icon="I"
        className="italic"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        label="Underline (Ctrl+U)"
        icon="U"
        className="underline"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        label="Strikethrough"
        icon="S"
        className="line-through"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive('highlight')}
        label="Highlight"
        icon="✨"
      />
      <ToolbarSeparator />
      <ToolbarButton
        onClick={() => editor.chain().focus().setLink({ href: prompt('Enter URL:') }).run()}
        active={editor.isActive('link')}
        label="Link (Ctrl+L)"
        icon="🔗"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        label="Inline Code"
        icon="💻"
      />
      <ToolbarSeparator />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        label="Align Left"
        icon="⬅️"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        label="Align Center (Ctrl+E)"
        icon="↔️"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        label="Align Right (Ctrl+R)"
        icon="➡️"
      />
    </BubbleMenu>
  );
};

/**
 * Status bar component showing current formatting and document stats
 */
const StatusBar = ({ editor }) => {
  const [stats, setStats] = useState({ words: 0, characters: 0, paragraphs: 0, readingTime: 0 });

  useEffect(() => {
    if (!editor) return;

    const updateStats = () => {
      const content = editor.getHTML();
      const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = textContent.split(' ').filter(word => word.length > 0).length;
      const characters = textContent.length;
      const paragraphs = (content.match(/<p[^>]*>/g) || []).length;
      const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words per minute
      
      setStats({ words, characters, paragraphs, readingTime });
    };

    updateStats();
    editor.on('update', updateStats);
    
    return () => {
      editor.off('update', updateStats);
    };
  }, [editor]);

  if (!editor) return null;

  const currentFormat = [];
  if (editor.isActive('bold')) currentFormat.push('Bold');
  if (editor.isActive('italic')) currentFormat.push('Italic');
  if (editor.isActive('underline')) currentFormat.push('Underline');
  if (editor.isActive('strike')) currentFormat.push('Strike');
  if (editor.isActive('highlight')) currentFormat.push('Highlight');
  
  const heading = editor.isActive('heading', { level: 1 }) ? 'H1' :
                  editor.isActive('heading', { level: 2 }) ? 'H2' :
                  editor.isActive('heading', { level: 3 }) ? 'H3' : null;
  if (heading) currentFormat.push(heading);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
      <div className="flex items-center gap-4">
        <span className="font-medium">Format:</span>
        <span className="text-gray-500">
          {currentFormat.length > 0 ? currentFormat.join(', ') : 'Normal'}
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500">
          {stats.readingTime > 0 ? `${stats.readingTime} min read` : 'Less than 1 min read'}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{stats.words} words</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span>{stats.characters} chars</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span>{stats.paragraphs} paragraphs</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Context Menu Component
 */
const ContextMenu = ({ editor, isVisible, position, onClose }) => {
  if (!isVisible || !editor) return null;

  const handleAction = (action) => {
    action();
    onClose();
  };

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 min-w-[200px]"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="space-y-1">
        <button
          onClick={() => handleAction(() => editor.chain().focus().toggleBold().run())}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
        >
          <span className="font-bold">B</span>
          Bold
        </button>
        <button
          onClick={() => handleAction(() => editor.chain().focus().toggleItalic().run())}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
        >
          <span className="italic">I</span>
          Italic
        </button>
        <button
          onClick={() => handleAction(() => editor.chain().focus().toggleUnderline().run())}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
        >
          <span className="underline">U</span>
          Underline
        </button>
        <hr className="my-1" />
        <button
          onClick={() => handleAction(() => editor.chain().focus().toggleBulletList().run())}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
        >
          • Bullet List
        </button>
        <button
          onClick={() => handleAction(() => editor.chain().focus().toggleOrderedList().run())}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
        >
          1. Numbered List
        </button>
        <hr className="my-1" />
        <button
          onClick={() => handleAction(() => setShowFindReplace(true))}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
        >
          🔍 Find & Replace
        </button>
        <button
          onClick={() => handleAction(() => handleSpellCheck())}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
        >
          ✅ Spell Check
        </button>
      </div>
    </div>
  );
};

const TiptapEditor = ({ content, onUpdate, readOnly = false, documentId }) => {
  const fileInputRef = useRef();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showDocumentOutline, setShowDocumentOutline] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [currentFindIndex, setCurrentFindIndex] = useState(0);
  const [findResults, setFindResults] = useState([]);
  const [showSpellCheck, setShowSpellCheck] = useState(false);
  const [spellCheckResults, setSpellCheckResults] = useState([]);
  const [currentSpellCheckIndex, setCurrentSpellCheckIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 }
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showAdvancedFormatting, setShowAdvancedFormatting] = useState(false);
  const [showDocumentHistory, setShowDocumentHistory] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [currentComment, setCurrentComment] = useState('');
  const [showTrackChanges, setShowTrackChanges] = useState(false);
  const [trackChangesEnabled, setTrackChangesEnabled] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [documentImages, setDocumentImages] = useState([]);

  // Initialize TipTap editor with enhanced extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use our custom code block
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize.configure({
        types: ['textStyle'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm',
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'w-full max-w-2xl mx-auto rounded-lg shadow-lg',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded-lg p-4 font-mono text-sm',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-gray-50 font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document...',
        emptyEditorClass: 'is-editor-empty',
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none p-0',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2 p-1',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-700',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'border-t border-gray-300 my-6',
        },
      }),
      // Configure mention functionality
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
          'data-mention': ({ node }) => node.attrs.id,
        },
        renderLabel({ node }) {
          return `@${node.attrs.label ?? node.attrs.id}`;
        },
        suggestion: {
          items: async (query) => {
            if (query.length === 0) return [];
            const users = await userService.searchUsers(query);
            return users;
          },
          render: () => {
            let component;
            let popup;
            return {
              onStart: (props) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });
                if (!props.clientRect) return;
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },
              onUpdate(props) {
                component.updateProps(props);
                if (!props.clientRect) return;
                popup[0].setProps({ getReferenceClientRect: props.clientRect });
              },
              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup[0].hide();
                  return true;
                }
                return component.ref?.onKeyDown(props);
              },
              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
          onSelect: ({ item }) => {
            return {
              id: item._id,
              label: item.name,
            };
          },
        },
      }),
    ],
    content: content || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
      handleKeyDown: (view, event) => {
        // Custom keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case 'b':
              event.preventDefault();
              editor.chain().focus().toggleBold().run();
              return true;
            case 'i':
              event.preventDefault();
              editor.chain().focus().toggleItalic().run();
              return true;
            case 'u':
              event.preventDefault();
              editor.chain().focus().toggleUnderline().run();
              return true;
            case 'k':
              event.preventDefault();
              const url = prompt('Enter URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
              return true;
            case 'z':
              if (event.shiftKey) {
                event.preventDefault();
                editor.chain().focus().redo().run();
                return true;
              } else {
                event.preventDefault();
                editor.chain().focus().undo().run();
                return true;
              }
            case 'y':
              event.preventDefault();
              editor.chain().focus().redo().run();
              return true;
            case 's':
              event.preventDefault();
              // Trigger save (you can implement auto-save here)
              toast.success('Document saved!');
              return true;
          }
        }
        
        // Heading shortcuts
        if (event.ctrlKey && event.shiftKey) {
          switch (event.key) {
            case '1':
              event.preventDefault();
              editor.chain().focus().toggleHeading({ level: 1 }).run();
              return true;
            case '2':
              event.preventDefault();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              return true;
            case '3':
              event.preventDefault();
              editor.chain().focus().toggleHeading({ level: 3 }).run();
              return true;
            case '7':
              event.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
              return true;
            case '8':
              event.preventDefault();
              editor.chain().focus().toggleBulletList().run();
              return true;
            case 'c':
              event.preventDefault();
              editor.chain().focus().toggleCodeBlock().run();
              return true;
            case 'q':
              event.preventDefault();
              editor.chain().focus().toggleBlockquote().run();
              return true;
            case 'h':
              event.preventDefault();
              editor.chain().focus().setHorizontalRule().run();
              return true;
          }
        }
        
        // Additional shortcuts
        if (event.ctrlKey) {
          switch (event.key) {
            case 'k':
              event.preventDefault();
              const url = prompt('Enter URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
              return true;
            case 'e':
              event.preventDefault();
              editor.chain().focus().setTextAlign('center').run();
              return true;
            case 'j':
              event.preventDefault();
              editor.chain().focus().setTextAlign('justify').run();
              return true;
            case 'r':
              event.preventDefault();
              editor.chain().focus().setTextAlign('right').run();
              return true;
            case 'l':
              event.preventDefault();
              editor.chain().focus().setTextAlign('left').run();
              return true;
            case 'f':
              event.preventDefault();
              setShowFindReplace(true);
              return true;
            case 'd':
              event.preventDefault();
              insertDateTime();
              return true;
          }
        }
        
        // F-key shortcuts
        if (event.key === 'F3') {
          event.preventDefault();
          setShowFindReplace(true);
          return true;
        }
        
        if (event.key === 'F7') {
          event.preventDefault();
          handleSpellCheck();
          return true;
        }
        
        if (event.key === 'F12') {
          event.preventDefault();
          setShowStatistics(true);
          return true;
        }
        
        // Additional shortcuts for new features
        if (event.ctrlKey && event.shiftKey) {
          switch (event.key) {
            case 'T':
              event.preventDefault();
              setShowTemplates(true);
              return true;
            case 'C':
              event.preventDefault();
              setShowComments(true);
              return true;
            case 'H':
              event.preventDefault();
              setShowDocumentHistory(true);
              return true;
            case 'V':
              event.preventDefault();
              saveVersion();
              return true;
            case 'P':
              event.preventDefault();
              generatePrintPreview();
              return true;
          }
        }
        
        // Tab handling for lists
        if (event.key === 'Tab') {
          if (editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')) {
            event.preventDefault();
            if (event.shiftKey) {
              editor.chain().focus().outdent().run();
            } else {
              editor.chain().focus().indent().run();
            }
            return true;
          }
        }
        
        return false;
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  // Update document images when content changes
  useEffect(() => {
    if (editor) {
      updateDocumentImages();
    }
  }, [editor, content]);

  // Handle image upload with proper saving
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && editor) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Convert to base64 and save to editor
          const base64Image = e.target.result;
          
          // Create a unique image ID
          const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Insert image with proper attributes
          editor.chain().focus().setImage({ 
            src: base64Image,
            alt: file.name,
            title: file.name,
            'data-image-id': imageId,
            'data-filename': file.name,
            'data-filesize': file.size,
            'data-upload-time': new Date().toISOString()
          }).run();
          
          // Update the content to trigger save
          const currentContent = editor.getHTML();
          onUpdate(currentContent);
          
          toast.success(`Image "${file.name}" uploaded successfully`);
          
          // Reset file input
          event.target.value = '';
        } catch (error) {
          console.error('Image upload error:', error);
          toast.error('Failed to upload image. Please try again.');
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Handle YouTube video embed
  const handleYouTubeEmbed = () => {
    const url = prompt('Enter YouTube video URL:');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  // Handle link insertion
  const handleLinkInsert = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  // Handle table insertion
  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  // Handle task list insertion
  const insertTaskList = () => {
    editor.chain().focus().toggleTaskList().run();
  };

  // Find and Replace functionality
  const handleFind = () => {
    if (!findText.trim()) return;
    
    const content = editor.getHTML();
    const regex = new RegExp(findText, 'gi');
    const matches = [...content.matchAll(regex)];
    
    if (matches.length > 0) {
      setFindResults(matches);
      setCurrentFindIndex(0);
      // Highlight first match
      editor.commands.setTextSelection(0);
      toast.success(`Found ${matches.length} matches`);
    } else {
      toast.error('No matches found');
    }
  };

  const handleReplace = () => {
    if (!findText.trim() || !replaceText.trim()) return;
    
    const content = editor.getHTML();
    const newContent = content.replace(new RegExp(findText, 'gi'), replaceText);
    editor.commands.setContent(newContent);
    
    toast.success('Replace completed');
    setShowFindReplace(false);
    setFindText('');
    setReplaceText('');
  };

  const handleReplaceAll = () => {
    if (!findText.trim() || !replaceText.trim()) return;
    
    const content = editor.getHTML();
    const newContent = content.replace(new RegExp(findText, 'gi'), replaceText);
    editor.commands.setContent(newContent);
    
    toast.success('Replace all completed');
    setShowFindReplace(false);
    setFindText('');
    setReplaceText('');
  };

  // Spell check functionality (basic implementation)
  const handleSpellCheck = () => {
    const content = editor.getText();
    const words = content.split(/\s+/);
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const misspelled = words.filter(word => 
      word.length > 2 && 
      !commonWords.includes(word.toLowerCase()) &&
      !/^[0-9.,!?;:'"()]+$/.test(word)
    );
    
    setSpellCheckResults(misspelled);
    setCurrentSpellCheckIndex(0);
    setShowSpellCheck(true);
    
    if (misspelled.length > 0) {
      toast.success(`Found ${misspelled.length} potential spelling issues`);
    } else {
      toast.success('No spelling issues found');
    }
  };

  // Generate document outline
  const generateDocumentOutline = () => {
    const content = editor.getHTML();
    const headings = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [];
    const outline = headings.map((heading, index) => {
      const level = heading.match(/<h([1-6])/i)[1];
      const text = heading.replace(/<[^>]*>/g, '');
      return { level: parseInt(level), text, index };
    });
    
    return outline;
  };

  // Insert special characters
  const insertSpecialChar = (char) => {
    editor.chain().focus().insertContent(char).run();
  };

  // Insert current date/time
  const insertDateTime = () => {
    const now = new Date();
    const dateTime = now.toLocaleString();
    editor.chain().focus().insertContent(dateTime).run();
  };

  // Insert page break
  const insertPageBreak = () => {
    editor.chain().focus().insertContent('<hr style="page-break-after: always;">').run();
  };

  // Toggle fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!editor || !content) return;
    
    const autoSaveInterval = setInterval(() => {
      const currentContent = editor.getHTML();
      if (currentContent !== content) {
        onUpdate(currentContent);
        toast.success('Auto-saved', { duration: 1000 });
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [editor, content, onUpdate]);

  // Context menu handlers
  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu({
      isVisible: true,
      position: { x: event.clientX, y: event.clientY }
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ isVisible: false, position: { x: 0, y: 0 } });
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Document templates
  const documentTemplates = [
    {
      name: 'Business Letter',
      content: `<h1>Business Letter</h1>
<p>[Your Name]</p>
<p>[Your Address]</p>
<p>[City, State ZIP]</p>
<p>[Date]</p>
<br>
<p>[Recipient Name]</p>
<p>[Recipient Title]</p>
<p>[Company Name]</p>
<p>[Company Address]</p>
<p>[City, State ZIP]</p>
<br>
<p>Dear [Recipient Name],</p>
<p>[Your letter content here...]</p>
<br>
<p>Sincerely,</p>
<p>[Your Name]</p>`
    },
    {
      name: 'Meeting Minutes',
      content: `<h1>Meeting Minutes</h1>
<h2>Meeting: [Meeting Title]</h2>
<p><strong>Date:</strong> [Date]</p>
<p><strong>Time:</strong> [Start Time] - [End Time]</p>
<p><strong>Location:</strong> [Location]</p>
<p><strong>Attendees:</strong> [List of attendees]</p>
<br>
<h3>Agenda Items:</h3>
<ul>
<li>[Agenda item 1]</li>
<li>[Agenda item 2]</li>
<li>[Agenda item 3]</li>
</ul>
<br>
<h3>Action Items:</h3>
<ul>
<li>[Action item 1] - [Assigned to] - [Due date]</li>
<li>[Action item 2] - [Assigned to] - [Due date]</li>
</ul>`
    },
    {
      name: 'Project Proposal',
      content: `<h1>Project Proposal</h1>
<h2>Executive Summary</h2>
<p>[Brief overview of the project]</p>
<br>
<h2>Project Objectives</h2>
<ul>
<li>[Objective 1]</li>
<li>[Objective 2]</li>
<li>[Objective 3]</li>
</ul>
<br>
<h2>Project Scope</h2>
<p>[Detailed description of what the project will and won't include]</p>
<br>
<h2>Timeline</h2>
<p>[Project timeline with key milestones]</p>
<br>
<h2>Budget</h2>
<p>[Estimated project costs]</p>`
    },
    {
      name: 'Resume Template',
      content: `<h1>[Your Name]</h1>
<p>[Email] | [Phone] | [Address]</p>
<br>
<h2>Professional Summary</h2>
<p>[Brief professional summary]</p>
<br>
<h2>Work Experience</h2>
<h3>[Job Title] - [Company Name]</h3>
<p><em>[Start Date] - [End Date]</em></p>
<ul>
<li>[Achievement 1]</li>
<li>[Achievement 2]</li>
<li>[Achievement 3]</li>
</ul>
<br>
<h2>Education</h2>
<p><strong>[Degree]</strong> - [University Name]</p>
<p><em>[Graduation Year]</em></p>`
    }
  ];

  const applyTemplate = (template) => {
    editor.commands.setContent(template.content);
    setShowTemplates(false);
    toast.success(`Applied ${template.name} template`);
  };

  // Collaboration features
  const addComment = () => {
    if (!currentComment.trim()) return;
    
    const newComment = {
      id: Date.now(),
      text: currentComment,
      author: 'You',
      timestamp: new Date().toLocaleString(),
      selection: editor.state.selection.content().content.size > 0 ? editor.state.selection.content().toJSON() : null
    };
    
    setComments([...comments, newComment]);
    setCurrentComment('');
    toast.success('Comment added');
  };

  const removeComment = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId));
    toast.success('Comment removed');
  };

  // Advanced formatting
  const insertTableOfContents = () => {
    const outline = generateDocumentOutline();
    if (outline.length === 0) {
      toast.error('No headings found to create table of contents');
      return;
    }
    
    let tocContent = '<h2>Table of Contents</h2><ul>';
    outline.forEach(heading => {
      const indent = '&nbsp;'.repeat((heading.level - 1) * 4);
      tocContent += `<li>${indent}<a href="#heading-${heading.index}">${heading.text}</a></li>`;
    });
    tocContent += '</ul>';
    
    editor.chain().focus().insertContent(tocContent).run();
    toast.success('Table of contents inserted');
  };

  const insertFootnote = () => {
    const footnoteNumber = (editor.getHTML().match(/<sup class="footnote">/g) || []).length + 1;
    const footnoteText = prompt(`Enter footnote ${footnoteNumber} text:`);
    
    if (footnoteText) {
      const footnoteContent = `<sup class="footnote" id="fn-${footnoteNumber}">${footnoteNumber}</sup>`;
      const footnoteReference = `<div class="footnote-ref" id="fn-ref-${footnoteNumber}"><sup>${footnoteNumber}</sup> ${footnoteText}</div>`;
      
      editor.chain().focus().insertContent(footnoteContent).run();
      // Insert footnote reference at the end
      const content = editor.getHTML();
      const newContent = content.replace('</body>', `${footnoteReference}</body>`);
      editor.commands.setContent(newContent);
      
      toast.success('Footnote inserted');
    }
  };

  const insertEquation = () => {
    const equation = prompt('Enter mathematical equation (LaTeX format):');
    if (equation) {
      const equationContent = `<div class="equation" style="text-align: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; font-family: 'Times New Roman', serif;">$${equation}$</div>`;
      editor.chain().focus().insertContent(equationContent).run();
      toast.success('Equation inserted');
    }
  };

  // Document history and versioning
  const [documentHistory, setDocumentHistory] = useState([]);
  
  const saveVersion = () => {
    const version = {
      id: Date.now(),
      content: editor.getHTML(),
      timestamp: new Date().toLocaleString(),
      description: prompt('Enter version description:') || 'Auto-saved version'
    };
    
    setDocumentHistory([...documentHistory, version]);
    toast.success('Version saved');
  };

  const restoreVersion = (version) => {
    if (confirm('Are you sure you want to restore this version? Current changes will be lost.')) {
      editor.commands.setContent(version.content);
      setShowDocumentHistory(false);
      toast.success('Version restored');
    }
  };

  // Print preview
  const generatePrintPreview = () => {
    const content = editor.getHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Preview</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
            h1, h2, h3 { color: #333; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
  };

  // Track changes functionality
  const toggleTrackChanges = () => {
    setTrackChangesEnabled(!trackChangesEnabled);
    if (!trackChangesEnabled) {
      toast.success('Track changes enabled');
    } else {
      toast.success('Track changes disabled');
    }
  };

  // Document export to different formats
  const exportToPDF = () => {
    toast.info('PDF export feature coming soon!');
  };

  const exportToWord = () => {
    const content = editor.getHTML();
    const wordContent = content
      .replace(/<h1>/g, '<h1 style="font-size: 24pt; font-weight: bold;">')
      .replace(/<h2>/g, '<h2 style="font-size: 18pt; font-weight: bold;">')
      .replace(/<h3>/g, '<h3 style="font-size: 14pt; font-weight: bold;">')
      .replace(/<p>/g, '<p style="font-size: 12pt; margin-bottom: 10pt;">');
    
    const blob = new Blob([wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.doc';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as Word document');
  };

  // Image management functions
  const extractImagesFromContent = () => {
    const content = editor.getHTML();
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
    const images = [];
    let match;
    
    while ((match = imgRegex.exec(content)) !== null) {
      const imgTag = match[0];
      const src = match[1];
      const alt = imgTag.match(/alt="([^"]*)"/i)?.[1] || '';
      const title = imgTag.match(/title="([^"]*)"/i)?.[1] || '';
      const filename = imgTag.match(/data-filename="([^"]*)"/i)?.[1] || 'Unknown';
      const filesize = imgTag.match(/data-filesize="([^"]*)"/i)?.[1] || '0';
      const uploadTime = imgTag.match(/data-upload-time="([^"]*)"/i)?.[1] || '';
      
      images.push({
        src,
        alt,
        title,
        filename,
        filesize: parseInt(filesize),
        uploadTime,
        imgTag
      });
    }
    
    return images;
  };

  const updateDocumentImages = () => {
    const images = extractImagesFromContent();
    setDocumentImages(images);
  };

  const resizeImage = (imageSrc, width, height) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
      
      // Replace the image in the editor
      const content = editor.getHTML();
      const newContent = content.replace(imageSrc, resizedImage);
      editor.commands.setContent(newContent);
      
      toast.success('Image resized successfully');
      updateDocumentImages();
    };
    
    img.src = imageSrc;
  };

  const removeImage = (imageSrc) => {
    if (confirm('Are you sure you want to remove this image?')) {
      const content = editor.getHTML();
      const newContent = content.replace(/<img[^>]+src="[^"]*"[^>]*>/gi, (match) => {
        if (match.includes(imageSrc)) {
          return '';
        }
        return match;
      });
      
      editor.commands.setContent(newContent);
      toast.success('Image removed successfully');
      updateDocumentImages();
    }
  };

  const downloadImage = (imageSrc, filename) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename || 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded successfully');
  };

  if (!editor) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Enhanced Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b bg-gray-50">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            label="Undo (Ctrl+Z)"
            icon="↶"
            className={!editor.can().undo() ? 'opacity-50 cursor-not-allowed' : ''}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            label="Redo (Ctrl+Y)"
            icon="↷"
            className={!editor.can().redo() ? 'opacity-50 cursor-not-allowed' : ''}
          />
        </div>

        <ToolbarSeparator />

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            label="Bold (Ctrl+B)"
            icon="B"
            className="font-bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            label="Italic (Ctrl+I)"
            icon="I"
            className="italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            label="Underline (Ctrl+U)"
            icon="U"
            className="underline"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            label="Strikethrough"
            icon="S"
            className="line-through"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive('highlight')}
            label="Highlight"
            icon="✨"
          />
        </div>

        <ToolbarSeparator />

        {/* Headings */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            label="Heading 1 (Ctrl+Shift+1)"
            className="font-bold text-lg"
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            label="Heading 2 (Ctrl+Shift+2)"
            className="font-bold text-base"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            label="Heading 3 (Ctrl+Shift+3)"
            className="font-bold text-sm"
          >
            H3
          </ToolbarButton>
        </div>

        <ToolbarSeparator />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            label="Bullet List (Ctrl+Shift+8)"
            icon="•"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            label="Numbered List (Ctrl+Shift+7)"
            icon="1."
          />
          <ToolbarButton
            onClick={insertTaskList}
            active={editor.isActive('taskList')}
            label="Task List"
            icon="☐"
          />
        </div>

        <ToolbarSeparator />

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            label="Align Left"
            icon="⬅️"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            label="Align Center"
            icon="↔️"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            label="Align Right"
            icon="➡️"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            active={editor.isActive({ textAlign: 'justify' })}
            label="Justify"
            icon="↔️"
          />
        </div>

        <ToolbarSeparator />

        {/* Colors and Styling */}
        <div className="flex items-center gap-1">
          <ColorPicker editor={editor} label="Text Color" type="text" />
          <ColorPicker editor={editor} label="Highlight Color" type="highlight" />
          
          <select
            className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()}
            value={editor.getAttributes('fontFamily').fontFamily || ''}
          >
            <option value="">Font</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Palatino">Palatino</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Impact">Impact</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
          </select>

          <select
            className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            onChange={e => editor.chain().focus().setFontSize(e.target.value).run()}
            value={editor.getAttributes('fontSize').fontSize || '16px'}
          >
            <option value="8px">8</option>
            <option value="9px">9</option>
            <option value="10px">10</option>
            <option value="11px">11</option>
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="22px">22</option>
            <option value="24px">24</option>
            <option value="26px">26</option>
            <option value="28px">28</option>
            <option value="36px">36</option>
            <option value="48px">48</option>
            <option value="72px">72</option>
          </select>
        </div>

        <ToolbarSeparator />

        {/* Advanced Features */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            active={editor.isActive('link')}
            label="Insert Link (Ctrl+K)"
            icon="🔗"
          />
          
          {showLinkInput && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="url"
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                onKeyPress={(e) => e.key === 'Enter' && handleLinkInsert()}
              />
              <button
                onClick={handleLinkInsert}
                className="px-2 py-1 text-xs bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Add
              </button>
            </div>
          )}

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            label="Code Block (Ctrl+Shift+C)"
            icon="💻"
          />
          
          <ToolbarButton
            onClick={insertTable}
            label="Insert Table"
            icon="📊"
          />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            label="Quote"
            icon="💬"
          />

          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            label="Horizontal Line"
            icon="➖"
          />
        </div>

        <ToolbarSeparator />

        {/* Media */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => fileInputRef.current.click()}
            label="Insert Image"
            icon="🖼️"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          
          <ToolbarButton
            onClick={handleYouTubeEmbed}
            label="Embed YouTube"
            icon="▶️"
          />
        </div>

        <ToolbarSeparator />

        {/* Advanced Tools */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => setShowFindReplace(!showFindReplace)}
            label="Find & Replace"
            icon="🔍"
          />
          
          <ToolbarButton
            onClick={handleSpellCheck}
            label="Spell Check"
            icon="✅"
          />
          
          <ToolbarButton
            onClick={() => setShowDocumentOutline(!showDocumentOutline)}
            label="Document Outline"
            icon="📋"
          />
          
          <ToolbarButton
            onClick={() => setShowStatistics(!showStatistics)}
            label="Statistics"
            icon="📊"
          />
        </div>

        <ToolbarSeparator />

        {/* Insert Tools */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={insertDateTime}
            label="Insert Date/Time"
            icon="📅"
          />
          
          <ToolbarButton
            onClick={insertPageBreak}
            label="Page Break"
            icon="📄"
          />
          
          <ToolbarButton
            onClick={() => insertSpecialChar('©')}
            label="Copyright"
            icon="©"
          />
          
          <ToolbarButton
            onClick={() => insertSpecialChar('®')}
            label="Registered"
            icon="®"
          />
          
          <ToolbarButton
            onClick={() => insertSpecialChar('™')}
            label="Trademark"
            icon="™"
          />
        </div>

        <ToolbarSeparator />

        {/* Document Tools */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => setShowTemplates(true)}
            label="Document Templates"
            icon="📋"
          />
          
          <ToolbarButton
            onClick={insertTableOfContents}
            label="Table of Contents"
            icon="📑"
          />
          
          <ToolbarButton
            onClick={insertFootnote}
            label="Insert Footnote"
            icon="¹"
          />
          
          <ToolbarButton
            onClick={insertEquation}
            label="Insert Equation"
            icon="∑"
          />
        </div>

        <ToolbarSeparator />

        {/* Collaboration Tools */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => setShowComments(true)}
            label="Comments"
            icon="💬"
          />
          
          <ToolbarButton
            onClick={toggleTrackChanges}
            active={trackChangesEnabled}
            label="Track Changes"
            icon="📝"
          />
          
          <ToolbarButton
            onClick={() => setShowCollaboration(true)}
            label="Collaboration"
            icon="👥"
          />
        </div>

        <ToolbarSeparator />

        {/* Document Management */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={saveVersion}
            label="Save Version"
            icon="💾"
          />
          
          <ToolbarButton
            onClick={() => setShowDocumentHistory(true)}
            label="Document History"
            icon="🕒"
          />
          
          <ToolbarButton
            onClick={generatePrintPreview}
            label="Print Preview"
            icon="🖨️"
          />
        </div>

        <ToolbarSeparator />

        {/* View Controls */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={toggleFullscreen}
            label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            icon={isFullscreen ? "⛶" : "⛶"}
          />
        </div>

        <ToolbarSeparator />

        {/* Help and Export */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            label="Keyboard Shortcuts"
            icon="⌨️"
          />
          
          <ToolbarButton
            onClick={() => {
              const content = editor.getHTML();
              const blob = new Blob([content], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'document.html';
              a.click();
              URL.revokeObjectURL(url);
            }}
            label="Export as HTML"
            icon="💾"
          />
          
          <ToolbarButton
            onClick={() => {
              const content = editor.getText();
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'document.txt';
              a.click();
              URL.revokeObjectURL(url);
            }}
            label="Export as Text"
            icon="📄"
          />
          
          <ToolbarButton
            onClick={exportToWord}
            label="Export as Word"
            icon="📘"
          />
          
          <ToolbarButton
            onClick={exportToPDF}
            label="Export as PDF"
            icon="📕"
          />
        </div>
      </div>

      {/* Editor Content with Floating Toolbar */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="min-h-[500px] p-6" 
          onContextMenu={handleContextMenu}
        />
        <FloatingToolbar editor={editor} />
        <ContextMenu
          editor={editor}
          isVisible={contextMenu.isVisible}
          position={contextMenu.position}
          onClose={closeContextMenu}
        />
      </div>
      
      {/* Status Bar */}
      <StatusBar editor={editor} />
      
      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Text Formatting</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bold</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+B</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Italic</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+I</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Underline</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+U</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Link</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+K</kbd>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Headings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Heading 1</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+1</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Heading 2</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+2</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Heading 3</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+3</kbd>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Lists</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bullet List</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+8</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Numbered List</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+7</kbd>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Text Alignment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Align Left</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+L</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Align Center</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+E</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Align Right</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+R</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Justify</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+J</kbd>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Other</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Code Block</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+C</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Blockquote</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+Q</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Horizontal Line</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+H</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Save</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Find & Replace Modal */}
      {showFindReplace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Find & Replace</h3>
              <button
                onClick={() => setShowFindReplace(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Find</label>
                <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter text to find..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Replace with</label>
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter replacement text..."
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleFind}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Find
                </button>
                <button
                  onClick={handleReplace}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Replace
                </button>
                <button
                  onClick={handleReplaceAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Replace All
                </button>
              </div>
              
              {findResults.length > 0 && (
                <div className="text-sm text-gray-600">
                  Found {findResults.length} matches
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Spell Check Modal */}
      {showSpellCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Spell Check</h3>
              <button
                onClick={() => setShowSpellCheck(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {spellCheckResults.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Found {spellCheckResults.length} potential spelling issues:
                </p>
                <div className="space-y-2">
                  {spellCheckResults.map((word, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="font-mono text-red-600">{word}</span>
                      <button
                        onClick={() => {
                          // Navigate to word in editor
                          const content = editor.getText();
                          const wordIndex = content.indexOf(word);
                          if (wordIndex !== -1) {
                            editor.commands.setTextSelection(wordIndex);
                            setShowSpellCheck(false);
                          }
                        }}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                      >
                        Go to
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-green-600">No spelling issues found!</p>
            )}
          </div>
        </div>
      )}
      
      {/* Document Outline Modal */}
      {showDocumentOutline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Document Outline</h3>
              <button
                onClick={() => setShowDocumentOutline(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              {generateDocumentOutline().map((heading, index) => (
                <div
                  key={index}
                  className={`cursor-pointer hover:bg-gray-50 p-2 rounded ${
                    heading.level === 1 ? 'font-bold text-lg' :
                    heading.level === 2 ? 'font-semibold text-base ml-4' :
                    'text-sm ml-8'
                  }`}
                  onClick={() => {
                    // Navigate to heading in editor
                    const content = editor.getHTML();
                    const headingIndex = content.indexOf(`<h${heading.level}>${heading.text}</h${heading.level}>`);
                    if (headingIndex !== -1) {
                      editor.commands.setTextSelection(headingIndex);
                      setShowDocumentOutline(false);
                    }
                  }}
                >
                  {heading.text}
                </div>
              ))}
              {generateDocumentOutline().length === 0 && (
                <p className="text-gray-500 italic">No headings found. Add some headings to see the outline.</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Statistics Modal */}
      {showStatistics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Document Statistics</h3>
              <button
                onClick={() => setShowStatistics(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Words:</span>
                <span className="font-semibold">{editor.getText().split(/\s+/).filter(word => word.length > 0).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Characters:</span>
                <span className="font-semibold">{editor.getText().length}</span>
              </div>
              <div className="flex justify-between">
                <span>Characters (no spaces):</span>
                <span className="font-semibold">{editor.getText().replace(/\s/g, '').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Paragraphs:</span>
                <span className="font-semibold">{(editor.getHTML().match(/<p[^>]*>/g) || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Headings:</span>
                <span className="font-semibold">{(editor.getHTML().match(/<h[1-6][^>]*>/g) || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Lists:</span>
                <span className="font-semibold">{(editor.getHTML().match(/<(ul|ol)[^>]*>/g) || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Images:</span>
                <span className="font-semibold">{(editor.getHTML().match(/<img[^>]*>/g) || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Links:</span>
                <span className="font-semibold">{(editor.getHTML().match(/<a[^>]*>/g) || []).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Document Templates</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentTemplates.map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                  <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">Professional template for {template.name.toLowerCase()}</p>
                  <button
                    onClick={() => applyTemplate(template)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Comments</h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentComment}
                  onChange={(e) => setCurrentComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                />
                <button
                  onClick={addComment}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
              
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-gray-700">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-gray-800 mb-2">{comment.text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeComment(comment.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-gray-500 italic text-center py-4">No comments yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Collaboration Modal */}
      {showCollaboration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Collaboration</h3>
              <button
                onClick={() => setShowCollaboration(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Real-time Collaboration</h4>
                <p className="text-gray-600 text-sm">Share this document with your team for real-time editing</p>
              </div>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Share Document
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Invite Collaborators
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Document History Modal */}
      {showDocumentHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Document History</h3>
              <button
                onClick={() => setShowDocumentHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {documentHistory.map((version) => (
                <div key={version.id} className="border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{version.description}</span>
                    <span className="text-sm text-gray-500">{version.timestamp}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => restoreVersion(version)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => {
                        const previewWindow = window.open('', '_blank');
                        previewWindow.document.write(`
                          <html>
                            <head><title>Version Preview</title></head>
                            <body style="font-family: Arial, sans-serif; margin: 20px;">${version.content}</body>
                          </html>
                        `);
                        previewWindow.document.close();
                      }}
                      className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))}
              {documentHistory.length === 0 && (
                <p className="text-gray-500 italic text-center py-4">No saved versions yet</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Styles */}
      <style jsx global>{`
        .tiptap-wrapper .ProseMirror {
          min-height: 500px;
          outline: none;
          line-height: 1.7;
          font-size: 16px;
          color: #374151;
        }
        
        .tiptap-wrapper .ProseMirror:focus {
          outline: none;
        }
        
        .tiptap-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        
        .tiptap-wrapper .ProseMirror h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        
        .tiptap-wrapper .ProseMirror h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #374151;
        }
        
        .tiptap-wrapper .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        
        .tiptap-wrapper .ProseMirror p {
          margin-bottom: 1rem;
        }
        
        .tiptap-wrapper .ProseMirror ul, .tiptap-wrapper .ProseMirror ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .tiptap-wrapper .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        
        .tiptap-wrapper .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .tiptap-wrapper .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .tiptap-wrapper .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        .tiptap-wrapper .ProseMirror pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
        
        .tiptap-wrapper .ProseMirror table {
          border-collapse: collapse;
          margin: 1.5rem 0;
          width: 100%;
        }
        
        .tiptap-wrapper .ProseMirror th,
        .tiptap-wrapper .ProseMirror td {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          text-align: left;
        }
        
        .tiptap-wrapper .ProseMirror th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        
        .tiptap-wrapper .ProseMirror .ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
        }
        
        .tiptap-wrapper .ProseMirror .task-list-item {
          list-style: none;
          padding: 0.5rem 0;
        }
        
        .tiptap-wrapper .ProseMirror .task-list-item input[type="checkbox"] {
          margin-right: 0.5rem;
          transform: scale(1.2);
        }
        
        .mention {
          background-color: #e0e7ff;
          color: #4f46e5;
          padding: 0.125rem 0.375rem;
          border-radius: 0.375rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .mention:hover {
          background-color: #c7d2fe;
          transform: scale(1.05);
        }
        
        .tippy-box {
          background-color: transparent !important;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .tiptap-wrapper .ProseMirror {
            padding: 1rem;
            font-size: 14px;
          }
          
          .tiptap-wrapper .ProseMirror h1 {
            font-size: 1.75rem;
          }
          
          .tiptap-wrapper .ProseMirror h2 {
            font-size: 1.5rem;
          }
          
          .tiptap-wrapper .ProseMirror h3 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;