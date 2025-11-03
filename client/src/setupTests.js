import '@testing-library/jest-dom';

// Polyfill window.matchMedia for jsdom tests (used by components that
// check responsive breakpoints). jsdom doesn't implement matchMedia by
// default, so provide a minimal implementation with the APIs used in the
// app (matches, addEventListener/removeEventListener, addListener/removeListener).
if (typeof window !== 'undefined' && !window.matchMedia) {
		window.matchMedia = (query) => {
			let listeners = [];
			// Default to `matches: true` to emulate a mobile viewport in tests
			// (many tests expect the mobile UI flow). If a test needs desktop,
			// it can override window.matchMedia manually.
			const mql = {
				matches: true,
			media: query,
			onchange: null,
			addListener: (cb) => {
				// legacy API
				listeners.push(cb);
			},
			removeListener: (cb) => {
				listeners = listeners.filter((l) => l !== cb);
			},
			addEventListener: (evt, cb) => {
				// matchMedia only uses 'change' events — keep simple
				if (evt === 'change') listeners.push(cb);
			},
			removeEventListener: (evt, cb) => {
				if (evt === 'change') listeners = listeners.filter((l) => l !== cb);
			},
			dispatchEvent: (event) => {
				listeners.forEach((l) => {
					try {
						l.call(mql, event);
					} catch (e) {
						// swallow
					}
				});
				return true;
			}
		};

		return mql;
	};
}

// PointerEvent is not provided by the jsdom environment used in Vitest.
// Some dependencies (e.g. motion, gesture libs) expect it to exist. Provide
// a lightweight shim so keyboard/mouse interactions that create PointerEvents
// don't crash the tests.
if (typeof global !== 'undefined' && typeof global.PointerEvent === 'undefined') {
	// Lightweight PointerEvent shim. We call the Event constructor with the
	// event init and avoid blindly assigning `init` onto the instance because
	// many Event properties are getters in jsdom and cannot be overwritten.
	global.PointerEvent = class PointerEvent extends Event {
		constructor(type, init = {}) {
			super(type, init);
			// Copy only properties that don't already exist on the instance
			// (this avoids trying to overwrite getters like `bubbles`).
			Object.keys(init).forEach((k) => {
				if (!(k in this)) this[k] = init[k];
			});
		}
	};
}
