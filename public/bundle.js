
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.callbacks.push(() => {
                outroing.delete(block);
                if (callback) {
                    block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Todo.svelte generated by Svelte v3.6.5 */

    const file = "src/Todo.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.todo = list[i];
    	return child_ctx;
    }

    // (23:4) {#each todoItems as todo (todo.id)}
    function create_each_block(key_1, ctx) {
    	var li, input, input_id_value, t0, label, label_for_value, t1, span, t2_value = ctx.todo.text, t2, t3, button, svg, use, t4, li_class_value, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	function click_handler_1() {
    		return ctx.click_handler_1(ctx);
    	}

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			li = element("li");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			button = element("button");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t4 = space();
    			attr(input, "id", input_id_value = ctx.todo.id);
    			attr(input, "type", "checkbox");
    			add_location(input, file, 25, 8, 902);
    			attr(label, "for", label_for_value = ctx.todo.id);
    			attr(label, "class", "tick");
    			add_location(label, file, 26, 8, 949);
    			add_location(span, file, 28, 8, 1065);
    			attr(use, "href", "#delete-icon");
    			add_location(use, file, 30, 15, 1179);
    			add_location(svg, file, 30, 10, 1174);
    			attr(button, "class", "delete-todo");
    			add_location(button, file, 29, 8, 1098);
    			attr(li, "class", li_class_value = "todo-item " + (ctx.todo.checked ? 'done' : ''));
    			add_location(li, file, 23, 6, 833);

    			dispose = [
    				listen(label, "click", click_handler),
    				listen(button, "click", click_handler_1)
    			];

    			this.first = li;
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, input);
    			append(li, t0);
    			append(li, label);
    			append(li, t1);
    			append(li, span);
    			append(span, t2);
    			append(li, t3);
    			append(li, button);
    			append(button, svg);
    			append(svg, use);
    			append(li, t4);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.todoItems) && input_id_value !== (input_id_value = ctx.todo.id)) {
    				attr(input, "id", input_id_value);
    			}

    			if ((changed.todoItems) && label_for_value !== (label_for_value = ctx.todo.id)) {
    				attr(label, "for", label_for_value);
    			}

    			if ((changed.todoItems) && t2_value !== (t2_value = ctx.todo.text)) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.todoItems) && li_class_value !== (li_class_value = "todo-item " + (ctx.todo.checked ? 'done' : ''))) {
    				attr(li, "class", li_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment(ctx) {
    	var ul, each_blocks = [], each_1_lookup = new Map();

    	var each_value = ctx.todoItems;

    	const get_key = ctx => ctx.todo.id;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			ul = element("ul");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			attr(ul, "class", "todo-list");
    			add_location(ul, file, 17, 0, 501);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, ul, anchor);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(ul, null);
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.todoItems;
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block, null, get_each_context);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(ul);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	//PROPS, this is binded to the todoItems list in App.Svelte
        let { todoItems } = $$props;

        //CONTROL FLOW
        //toggle done just changes the boolean of the todoitem
        //deleteTodo pops one off list 
        function toggleDone(id) {
            const index = todoItems.findIndex(item => item.id === Number(id));
            todoItems[index].checked = !todoItems[index].checked; $$invalidate('todoItems', todoItems);
        }

        function deleteTodo(id) {
        $$invalidate('todoItems', todoItems = todoItems.filter(item => item.id !== Number(id)));
        }

    	const writable_props = ['todoItems'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Todo> was created with unknown prop '${key}'`);
    	});

    	function click_handler({ todo }) {
    		return toggleDone(todo.id);
    	}

    	function click_handler_1({ todo }) {
    		return deleteTodo(todo.id);
    	}

    	$$self.$set = $$props => {
    		if ('todoItems' in $$props) $$invalidate('todoItems', todoItems = $$props.todoItems);
    	};

    	return {
    		todoItems,
    		toggleDone,
    		deleteTodo,
    		click_handler,
    		click_handler_1
    	};
    }

    class Todo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["todoItems"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.todoItems === undefined && !('todoItems' in props)) {
    			console.warn("<Todo> was created without expected prop 'todoItems'");
    		}
    	}

    	get todoItems() {
    		throw new Error("<Todo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todoItems(value) {
    		throw new Error("<Todo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.6.5 */

    const file$1 = "src/App.svelte";

    function create_fragment$1(ctx) {
    	var main, div1, h1, t1, updating_todoItems, t2, div0, p, t4, form, input, current, dispose;

    	function todo_todoItems_binding(value) {
    		ctx.todo_todoItems_binding.call(null, value);
    		updating_todoItems = true;
    		add_flush_callback(() => updating_todoItems = false);
    	}

    	let todo_props = {};
    	if (ctx.todoItems !== void 0) {
    		todo_props.todoItems = ctx.todoItems;
    	}
    	var todo = new Todo({ props: todo_props, $$inline: true });

    	binding_callbacks.push(() => bind(todo, 'todoItems', todo_todoItems_binding));

    	return {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "emilio's todos";
    			t1 = space();
    			todo.$$.fragment.c();
    			t2 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "What do you want to get done today?";
    			t4 = space();
    			form = element("form");
    			input = element("input");
    			attr(h1, "class", "app-title");
    			add_location(h1, file$1, 39, 4, 967);
    			attr(p, "class", "empty-state__description");
    			add_location(p, file$1, 44, 6, 1132);
    			attr(div0, "class", "empty-state");
    			add_location(div0, file$1, 43, 4, 1100);
    			attr(input, "class", "js-todo-input");
    			attr(input, "type", "text");
    			attr(input, "aria-label", "Enter a new todo item");
    			attr(input, "placeholder", "eg. Finish my pset");
    			add_location(input, file$1, 50, 6, 1487);
    			add_location(form, file$1, 48, 4, 1306);
    			attr(div1, "class", "container");
    			add_location(div1, file$1, 38, 2, 939);
    			add_location(main, file$1, 37, 0, 930);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(form, "submit", prevent_default(ctx.addTodo))
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, main, anchor);
    			append(main, div1);
    			append(div1, h1);
    			append(div1, t1);
    			mount_component(todo, div1, null);
    			append(div1, t2);
    			append(div1, div0);
    			append(div0, p);
    			append(div1, t4);
    			append(div1, form);
    			append(form, input);

    			input.value = ctx.newTodo;

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var todo_changes = {};
    			if (!updating_todoItems && changed.todoItems) {
    				todo_changes.todoItems = ctx.todoItems;
    			}
    			todo.$set(todo_changes);

    			if (changed.newTodo && (input.value !== ctx.newTodo)) input.value = ctx.newTodo;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(todo.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(todo.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(main);
    			}

    			destroy_component(todo, );

    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

      //LIFECYCLE
      afterUpdate(() => {
        document.querySelector('.js-todo-input').focus();
      });

      let todoItems = [];
      let newTodo = '';

      //addTodo will write a newTodo to the overall list which is binded to the nested component
      //example of REACTIVITY and CONTROL FLOW
      function addTodo() {
        $$invalidate('newTodo', newTodo = newTodo.trim());

        //CONTROL FLOW, if statement, array manipulation!
        if (!newTodo) return;
        const todo = {
          text: newTodo,
          checked: false,
          urgent: false,
          id: Date.now(),
        };
        $$invalidate('todoItems', todoItems = [...todoItems, todo]);
        $$invalidate('newTodo', newTodo = '');
      }

    	function todo_todoItems_binding(value) {
    		todoItems = value;
    		$$invalidate('todoItems', todoItems);
    	}

    	function input_input_handler() {
    		newTodo = this.value;
    		$$invalidate('newTodo', newTodo);
    	}

    	return {
    		todoItems,
    		newTodo,
    		addTodo,
    		todo_todoItems_binding,
    		input_input_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
