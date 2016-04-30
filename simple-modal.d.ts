interface button {
	text?: string;
	closeOnClick?: boolean;
	className?: string;
	callback?: Function;
}
interface options {
	title?: string;
	content?: string | HTMLElement;
	clickOutsideToClose?: boolean;
	removeOnClose?: boolean;
	attachToBody?: boolean;
	buttons?: button[];
}

declare function createSimpleModal(options: options): {
	m: HTMLElement;
	updateContent(newContent: string | HTMLElement);
	deconstruct();
	close();
	show();
}

export = createSimpleModal;
