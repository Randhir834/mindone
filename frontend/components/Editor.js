/**
 * Rich text editor component built with TipTap.
 * Supports text formatting, mentions, images, and YouTube embeds.
 * @param {string} content - Initial content of the editor
 * @param {Function} onUpdate - Callback when content changes
 * @param {boolean} readOnly - Whether the editor is in read-only mode
 * @param {string} documentId - ID of the current document
 */
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { useEffect, useRef } from 'react';
import 'tippy.js/dist/tippy.css';

import MentionList from './MentionList';
import { userService } from '../services/userService';

/**
 * Reusable toolbar button component
 * @param {Function} onClick - Click handler
 * @param {boolean} active - Whether the button is in active state
 * @param {string} icon - Optional icon to display
 * @param {string} label - Button tooltip text
 */
const ToolbarButton = ({ onClick, active, icon, label, children, ...props }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2 py-1 rounded hover:bg-indigo-100 transition border border-transparent ${active ? 'bg-indigo-200 text-indigo-700 font-bold' : 'text-gray-700'}`}
    title={label}
    {...props}
  >
    {icon ? <span className="mr-1">{icon}</span> : null}
    {children}
  </button>
);

const TiptapEditor = ({ content, onUpdate, readOnly = false, documentId }) => {
  const fileInputRef = useRef();

  // Initialize TipTap editor with extensions and configuration
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Image,
      Youtube,
      // Configure mention functionality with user search and suggestions
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
          'data-mention': ({ node }) => node.attrs.id,
        },
        renderLabel({ node }) {
          return `@${node.attrs.label ?? node.attrs.id}`;
        },
        suggestion: {
          // Search users as user types @ mentions
          items: async (query) => {
            if (query.length === 0) return [];
            const users = await userService.searchUsers(query);
            return users;
          },
          // Render mention suggestions using MentionList component
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
          // Format selected mention data
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
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  // Handle image upload from file input
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor.chain().focus().setImage({ src: e.target.result }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle YouTube video embed via URL prompt
  const handleYouTubeEmbed = () => {
    const url = prompt('Enter YouTube video URL:');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 tiptap-wrapper">
      {/* Toolbar */}
      {editor && (
        <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50 rounded-t-lg">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            label="Bold"
          >
            <b>B</b>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            label="Italic"
          >
            <i>I</i>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            label="Underline"
          >
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            label="Strike"
          >
            <s>S</s>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            label="Heading 1"
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            label="Heading 2"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            label="Bullet List"
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            label="Ordered List"
          >
            1. List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setColor('#F43F5E').run()}
            label="Red Text"
            style={{ color: '#F43F5E' }}
          >
            A
          </ToolbarButton>
          <select
            className="border rounded px-1 py-0.5 text-sm"
            onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()}
            value={editor.getAttributes('fontFamily').fontFamily || ''}
          >
            <option value="">Font</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
          </select>
          <input
            type="color"
            className="w-6 h-6 p-0 border rounded"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
            title="Text Color"
          />
          <ToolbarButton
            onClick={() => fileInputRef.current.click()}
            label="Insert Image"
          >
            🖼️
          </ToolbarButton>
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
          >
            ▶️
          </ToolbarButton>
        </div>
      )}
      <EditorContent editor={editor} />
      <style jsx global>{`
        .tiptap-wrapper .ProseMirror {
          min-height: 450px;
          padding: 1.5rem;
          outline: none;
          line-height: 1.6;
          font-size: 16px;
        }
        .tiptap-wrapper .ProseMirror:focus {
          border-color: #4f46e5;
        }
        .tiptap-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .mention {
          background-color: #e0e7ff;
          color: #4f46e5;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
        }
        .tippy-box {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;