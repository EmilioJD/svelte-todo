<script>
    //PROPS, this is binded to the todoItems list in App.Svelte
    export let todoItems;

    //CONTROL FLOW
    //toggle done just changes the boolean of the todoitem
    //deleteTodo pops one off list 
    function toggleDone(id) {
        const index = todoItems.findIndex(item => item.id === Number(id));
        todoItems[index].checked = !todoItems[index].checked;
    }

    function deleteTodo(id) {
    todoItems = todoItems.filter(item => item.id !== Number(id));
    }
</script>

<ul class="todo-list">
    <!-- CONTROL FLOW with the "each" block, first time I've seen this ability -->

    <!-- REACTIVITY additionally, the todoItems element is a prime example of reactivity, as the list
    is updated, the DOM will refresh to show the new version of the list -->
    {#each todoItems as todo (todo.id)}
      <li class="todo-item {todo.checked ? 'done' : ''}">
        
        <input id={todo.id} type="checkbox" />
        <label for={todo.id} class="tick" on:click={() => toggleDone(todo.id)}></label>
        <!-- REACTIVITY -->
        <span>{todo.text}</span>
        <button class="delete-todo" on:click={() => deleteTodo(todo.id)}>
          <svg><use href="#delete-icon"></use></svg>
        </button>

      </li>
    {/each}
</ul>