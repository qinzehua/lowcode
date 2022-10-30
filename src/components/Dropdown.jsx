/* eslint-disable vue/multi-word-component-names */
import {
  createVNode,
  reactive,
  computed,
  defineComponent,
  render,
  onMounted,
  onBeforeMount,
  ref,
  provide,
} from 'vue';

export const DropdownItem = defineComponent({
  props: {
    label: String,
  },
  setup(props) {
    const state = reactive({
      label: props.label,
    });
    return () => {
      return <div className="drop-item">{state.label}</div>;
    };
  },
});

const Dropdown = defineComponent({
  props: {
    options: {
      type: Object,
    },
  },
  setup(props, ctx) {
    const state = reactive({
      options: props.options,
      isShow: false,
      top: 0,
      left: 0,
    });

    const el = ref(null);

    ctx.expose({
      showDropdown(options) {
        state.options = options;
        state.isShow = true;
        let { top, left, height } = options.el.getBoundingClientRect();
        state.top = top + height;
        state.left = left;
      },
    });

    const classes = computed(() => [
      'dropdown',
      {
        'dropdown-isShow': state.isShow,
      },
    ]);

    const styles = computed(() => ({
      left: state.left + 'px',
      top: state.top + 'px',
    }));

    const onMousedownDocument = (event) => {
      if (!el.value.contains(event.target)) {
        state.isShow = false;
      }
    };

    const clickHandler = () => {
      state.isShow = false;
    };

    onMounted(() => {
      document.addEventListener('mousedown', onMousedownDocument, true);
    });

    onBeforeMount(() => {
      document.removeEventListener('mousedown', onMousedownDocument, true);
    });

    return () => {
      return (
        <div
          class={classes.value}
          style={styles.value}
          ref={el}
          onClick={clickHandler}
        >
          {state.options.content}
        </div>
      );
    };
  },
});

let vm;
export function $dropdown(options) {
  if (!vm) {
    let el = document.createElement('div');
    vm = createVNode(Dropdown, { options });
    render(vm, el);
    document.body.appendChild(el);
  }
  vm.component.exposed.showDropdown(options);
}
