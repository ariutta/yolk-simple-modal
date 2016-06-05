/// <reference path="typings/main/ambient/es6-shim/index.d.ts" />
/// <reference path="typings/main/ambient/rx/index.d.ts" />
/// <reference path="typings/main/definitions/lodash/index.d.ts" />
/// <reference path="typings/main/definitions/spin.js/index.d.ts" />
/// <reference path="typings/main/definitions/simple-modal/index.d.ts" />
/// <reference path="typings/main/definitions/yolk/index.d.ts" />

/******************************
 * Yolk SimpleModal
 *****************************/


// TODO why does the TypeScript compiler die at the following import?
// I just created my own function below to get this, but it would
// be nice not to have to do that.
//import { default as isComponent } from 'yolk/src/isComponent';
function isComponent(x) {
	var componentTypes = [
		'Widget',
		'VirtualNode',
		'VirtualText',
	];
	return x && componentTypes.indexOf(x.type) > -1;
}
import {isArray, isElement, isFunction, isString} from 'lodash';
import createSimpleModal = require('simple-modal');
import Spinner = require('spin.js');
import {CustomComponent, h, render, Rx} from 'yolk';

interface propsInitial {
	title?: string | Rx.Observable<string>;
	content: string | HTMLElement | Rx.Observable<string | HTMLElement>;
	buttons?: any | Rx.Observable<any>;
	// TODO can we get rid of this?
	//className?: string | Rx.Observable<string>;
}

interface propsResolved {
	title?: string;
	content: string | HTMLElement;
	buttons?: any;
	//className?: string;
}

let setDefaultStyle = function() {
	// TODO: this will override the style of the *first* overlay;
	// What if there are multiple overlays? Should refactor to just select this one.
	var overlay = <HTMLElement>document.querySelector('.simple-modal-overlay');
	overlay.style.opacity = '0.4';
	overlay.style.backgroundColor = '#fff';
};

/* How this works
 * A) Create and open modal with loading indicator (spinner),
 * 		including all params that are immediately available
 * B) Once all params are loaded
 *    1) Destroy initial spinner modal
 *    2) Create and open new modal with all params provided
 */

/* Statuses (not currently working)
 * - closed
 * - loading
 * - open
 */
export default class SimpleModalWrapper extends CustomComponent {
  _modalInstance: any;
  _spinner: any;
  constructor(props: propsInitial) {
		super(props);

    let spinnerOptions = {
      lines: 13, // The number of lines to draw
      length: 20, // The length of each line
      width: 10, // The line thickness
      radius: 30, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    };

    let spinnerHeight: number = spinnerOptions.length + spinnerOptions.radius;
		let spinnerContainerHeight: string = (spinnerHeight + 200) + 'px';

    let {
			title = '',
      content = '',
			buttons = [],
			//status: 'closed'
		} = props;

		//    TODO do we need a status option?
//    if (status === 'closed') {
//      // just a placeholder
//      content = m('span');
//    } else if (status === 'loading') {
//      content = h('div', {
//        style: {
//          // We specify this height in order to make room for the spinner
//          height: spinnerContainerHeight
//        }
//      });
//    } else if (status === 'open') {
//      if (typeof content === 'string') {
//        content = m.trust(content);
//      }
//    } else {
//      throw new Error('Unrecognized status.');
//    }

    let modalInstance;
		modalInstance	= createSimpleModal({
			title: isString(title) ? title : '',
			content: (isString(content) || isElement(content)) ? <string | HTMLElement>content : '',
			attachToBody: true,
			removeOnClose: true,
			buttons: isArray(buttons) ? buttons : []
		});
    this._modalInstance = modalInstance;
    let modalContentContainer = <HTMLElement>modalInstance.m.querySelector('.simple-modal-content');
		modalContentContainer.style.minHeight = spinnerContainerHeight;

		setDefaultStyle();

    let spinner = new Spinner(spinnerOptions);
    this._spinner = spinner;
    spinner.spin(modalContentContainer);
  }
  onMount(props: propsResolved, node) {
		var that = this;
    let {
			title = '',
      content,
			buttons = [],
			//className = ''
		} = props;

		that._spinner.stop();
		that._modalInstance.deconstruct();

		//node.setAttribute('class', className);

		let modalInstance = createSimpleModal({
			title: title,
			content: (isString(content) || isElement(content)) ? <string | HTMLElement>content : '',
			buttons: buttons,
			attachToBody: false,
			removeOnClose: true
		});
		that._modalInstance = modalInstance;
		let modalContainer = modalInstance.m;
		node.appendChild(modalContainer);

		if (isComponent(content)) {
			render(content, <HTMLElement>modalContainer.querySelector('.simple-modal-content'));
		}

		setDefaultStyle();
  }

  onUpdate(props: propsResolved, node) {
    let {
      content,
			//className = ''
		} = props;
		this._modalInstance.updateContent(content);
    //node.setAttribute('class', className);
  }

  onUnmount() {
		this._modalInstance.deconstruct();
  }
}
