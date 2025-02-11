import { Plugin } from 'obsidian';
import emojiRegex from 'emoji-regex';

export default class EmoteSpanPlugin extends Plugin {
	async onload() {
		console.log('Loading EmoteSpanPlugin');

		// Register a Markdown post processor that will traverse the rendered HTML
		this.registerMarkdownPostProcessor((element: HTMLElement) => {
			// Create a TreeWalker to visit all text nodes
			const walker = document.createTreeWalker(
				element,
				NodeFilter.SHOW_TEXT,
				null
			);

			const nodesToReplace: { node: Node; newNodes: Node[] }[] = [];
			// Create a single emoji regex instance.
			const regex = emojiRegex();

			let node: Node | null;
			while ((node = walker.nextNode())) {
				if (node.nodeValue) {
					// Reset lastIndex (important because regex is global)
					regex.lastIndex = 0;
					// Check if this text node contains any emoji
					if (regex.test(node.nodeValue)) {
						const text = node.nodeValue;
						const newNodes: Node[] = [];
						let lastIndex = 0;
						let match;

						// Reset lastIndex before iterating over matches
						regex.lastIndex = 0;
						// Loop through each emoji match in the text
						while ((match = regex.exec(text)) !== null) {
							const emoji = match[0];
							const matchIndex = match.index;
							// Add any plain text before the emoji
							if (matchIndex > lastIndex) {
								newNodes.push(document.createTextNode(text.slice(lastIndex, matchIndex)));
							}
							// Create a span element for the emoji
							const span = document.createElement("span");
							// Apply your desired styling here
							span.style.fontWeight = "normal";
							span.textContent = emoji;
							newNodes.push(span);
							lastIndex = matchIndex + emoji.length;
						}
						// Append any text remaining after the last emoji
						if (lastIndex < text.length) {
							newNodes.push(document.createTextNode(text.slice(lastIndex)));
						}

						nodesToReplace.push({ node, newNodes });
					}
				}
			}

			// Replace all collected text nodes with our newly built node arrays
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
		console.log('Unloading EmoteSpanPlugin');
	}
}
