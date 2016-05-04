declare function addProperties(): any;

declare class CompositePropSubject {

}

declare class Component {

}

export function h(component: string|Function, props?: Object, ...children: Array<any>): Component;

export class DOM {
}

export function registerElement(name: string, fn: Function): void

export class CustomComponent {
	constructor(props: Object);
	type: string;
	onMount(props: Object, node: HTMLElement): void;
	onUpdate(props: Object, node: HTMLElement): void;
	onUnmount (node: HTMLElement): void;
}


export function wrapObject(): any;

export function render(instance: any, node: HTMLElement): Component;

export class Rx {
}
