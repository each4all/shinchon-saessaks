"use client";

import "@toast-ui/editor/dist/toastui-editor.css";

import { Editor } from "@toast-ui/react-editor";
import { useEffect, useRef, useState } from "react";

const toolbarItems: [string, string][] = [
	["heading", "bold"],
	["italic", "strike"],
	["hr", "quote"],
	["ul", "ol"],
	["task", "indent"],
	["table", "link"],
	["code", "codeblock"],
];

type RichTextEditorProps = {
	name: string;
	initialValue?: string;
	resetKey?: number;
	disabled?: boolean;
};

type EditorCoreInstance = ReturnType<InstanceType<typeof Editor>["getInstance"]>;

export function RichTextEditor({ name, initialValue = "", resetKey, disabled = false }: RichTextEditorProps) {
	const editorRef = useRef<EditorCoreInstance | null>(null);
	const [value, setValue] = useState(initialValue);

	useEffect(() => {
		setValue(initialValue);
		if (editorRef.current) {
			editorRef.current.setMarkdown(initialValue || "");
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resetKey]);

	return (
		<div className="grid gap-2 min-w-0">
			<div className="relative min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-white">
				{disabled ? <div className="absolute inset-0 z-10 cursor-not-allowed bg-white/70 backdrop-blur-sm" /> : null}
				<Editor
					ref={(instance) => {
						editorRef.current = instance?.getInstance() ?? null;
					}}
					initialValue={initialValue}
					initialEditType="wysiwyg"
					hideModeSwitch
					height="380px"
					usageStatistics={false}
					onChange={() => {
						const markdown = editorRef.current?.getMarkdown() ?? "";
						setValue(markdown);
					}}
					toolbarItems={toolbarItems}
				/>
			</div>
			<input type="hidden" name={name} value={value} />
		</div>
	);
}
