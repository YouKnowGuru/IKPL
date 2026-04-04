'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { 
  Bold, Italic, List, ListOrdered, Quote, 
  Heading1, Heading2, Undo, Redo, ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const buttons = [
    {
      icon: Bold,
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      icon: Italic,
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      icon: Heading1,
      title: 'H1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
    },
    {
      icon: Heading2,
      title: 'H2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: List,
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      title: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    {
      icon: Quote,
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 sticky top-0 z-20">
      {buttons.map((btn, i) => (
        <Button
          key={i}
          type="button"
          size="icon"
          variant="ghost"
          onClick={btn.action}
          className={cn(
            'h-8 w-8 rounded-lg transition-all',
            btn.isActive ? 'bg-agro-green text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-white/10'
          )}
          title={btn.title}
        >
          <btn.icon className="h-4 w-4" />
        </Button>
      ))}
      <div className="w-[1px] h-4 bg-zinc-200 dark:bg-white/10 self-center mx-1" />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={addImage}
        className="h-8 w-8 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-white/10"
        title="Add Image URL"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <div className="flex-1" />
      <div className="flex gap-1">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          className="h-8 w-8 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-white/10"
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          className="h-8 w-8 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-white/10"
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function BlogEditor({ content, onChange }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full h-auto my-8 shadow-lg border border-zinc-100 dark:border-white/5',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6 text-sm leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-agro-green/20 transition-all shadow-sm">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
