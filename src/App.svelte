<!-- Adapted from https://freshman.tech/svelte-todo/ tutorial-->

<!-- annotated are examples of reusable components, props, reactivity, lifecycle, and control flow -->

<script>
  // REUSABLE COMPONENT, lifecycle from svelte and one from my custom ./TODO
  import { afterUpdate } from 'svelte';
  import Todo from './Todo.svelte';

  //LIFECYCLE
  afterUpdate(() => {
    document.querySelector('.js-todo-input').focus();
  });

  let todoItems = [];
  let newTodo = '';

  //addTodo will write a newTodo to the overall list which is binded to the nested component
  //example of REACTIVITY and CONTROL FLOW
  function addTodo() {
    newTodo = newTodo.trim();

    //CONTROL FLOW, if statement, array manipulation!
    if (!newTodo) return;
    const todo = {
      text: newTodo,
      checked: false,
      urgent: false,
      id: Date.now(),
    };
    todoItems = [...todoItems, todo];
    newTodo = '';
  }
  

</script>

<main>
  <div class="container">
    <h1 class="app-title">emilio's todos</h1>
    <!-- PROPS pass in todo.text as a prop -->
    <Todo bind:todoItems={todoItems}/>

    <div class="empty-state">
      <p class="empty-state__description">What do you want to get done today?</p>
    </div>

    <!-- CONTROL FLOW AND REACTVITY with on:submit, calls the addTodo function-->
    <form on:submit|preventDefault={addTodo}>
      <!-- CONTROL FLOW here is an example of binding, which is also control flow, this allows you to make the app more reactive -->
      <input class="js-todo-input" type="text" aria-label="Enter a new todo item" placeholder="eg. Finish my pset" bind:value={newTodo}>
    </form>

  </div>
</main>