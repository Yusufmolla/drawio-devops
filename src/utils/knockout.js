import * as ko from "knockout";

/**
 * Registers the input Model as knockout component.
 *
 * @param {string} name Component name.
 * @param {function} model Component constructor.
 * @param {string} template Template name.
 */
export function registerComponent(name, model, template) {
    if (registerComponent._registry.has(name)) {
        return;
    }

    registerComponent._registry.add(name);
    ko.components.register(name, {
        template,
        viewModel: { 
            createViewModel: (params, componentInfo) => {
                params = params || {};

                if (typeof(model) === "function") {
                    params.element = componentInfo.element.querySelector ? componentInfo.element : componentInfo.element.parentElement || componentInfo.element.parentNode;
                    
                    return new model(params);
                }

                Object.entries(params).forEach(([key, value]) => {
                    if (!(key in model)) {
                        return;
                    }
        
                    if (ko.isObservable(model[key])) {
                        model[key](ko.unwrap(value));
                    }
                });

                return model;
            }
        }
    });
}

registerComponent._registry = new Set();


/**
 * Registers the input Model as knockout component.
 *
 * @param {string} name Component name.
 * @param {object} handler Handler implementation.
 */
export function registerBinding(name, handler) {
    if (registerBinding._registry.has(name)) {
        return;
    }

    registerBinding._registry.add(name);
    ko.bindingHandlers[name] = handler;
}

registerBinding._registry = new Set();