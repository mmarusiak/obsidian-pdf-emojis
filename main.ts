import { Plugin } from 'obsidian';
import emojiRegex from 'emoji-regex';

export default class PDFEmoji extends Plugin {
	async onload() {
		console.log('Loading PDF Emoji plugin!'); 

		this.registerMarkdownPostProcessor((element: HTMLElement) => {
			// Skip certain elements to prevent modifying headings, code blocks, etc.
			const ignoredSelectors = "h1, h2, h3, h4, h5, h6, pre, code, .cm-content";
			if (element.closest(ignoredSelectors)) return;

			// Create a TreeWalker to visit all text nodes
			const walker = document.createTreeWalker(
				element,
				NodeFilter.SHOW_TEXT,
				null
			);

			const nodesToReplace: { node: Node; newNodes: Node[] }[] = [];
			const regex = emojiRegex();

			let node: Node | null;
			while ((node = walker.nextNode())) {
				if (node.nodeValue) {
					regex.lastIndex = 0;
					if (regex.test(node.nodeValue)) {
						const text = node.nodeValue;
						const newNodes: Node[] = [];
						let lastIndex = 0;
						let match;

						regex.lastIndex = 0;
						while ((match = regex.exec(text)) !== null) {
							const emoji = match[0];
							const matchIndex = match.index;

							if (matchIndex > lastIndex) {
								newNodes.push(document.createTextNode(text.slice(lastIndex, matchIndex)));
							}

							// Ensure we are not replacing numbers
							if (!/\d/.test(emoji)) {
								const span = document.createElement("span");
								span.className = "emoji";
								span.textContent = emoji;
								newNodes.push(span);
							} else {
								newNodes.push(document.createTextNode(emoji)); // Keep numbers unchanged
							}

							lastIndex = matchIndex + emoji.length;
						}

						if (lastIndex < text.length) {
							newNodes.push(document.createTextNode(text.slice(lastIndex)));
						}

						nodesToReplace.push({ node, newNodes });
					}
				}
			}

			nodesToReplace.forEach(({ node, newNodes }) => {
				const parent = node.parentNode;
				if (parent) {
					newNodes.forEach(newNode => parent.insertBefore(newNode, node));
					parent.removeChild(node);
				}
			});
		});
	}

	onunload() {
		console.log('Unloading PDF Emoji plugin!');
	}
}