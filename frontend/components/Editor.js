import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { useEffect } from 'react';
import 'tippy.js/dist/tippy.css';

import MentionList from './MentionList';
import { userService } from '../services/userService';

const TiptapEditor = ({ content, onUpdate, readOnly = false, documentId }) => {
  // CORRECTED: The handleNewMention and related API calls have been removed.
  // The backend's `createDocument` and `updateDocument` endpoints will now process 
  // any new mentions from the updated content, making this frontend logic redundant.

  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
          'data-mention': ({ node }) => node.attrs.id,
        },
        renderLabel({ node }) {
          return `@${node.attrs.label ?? node.attrs.id}`
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
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== content) {
        editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 tiptap-wrapper">
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