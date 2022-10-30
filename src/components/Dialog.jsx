/* eslint-disable vue/multi-word-component-names */
import { createVNode, reactive, defineComponent, render } from 'vue';
import { ElDialog, ElButton, ElInput } from 'element-plus';
const DialogComponent = defineComponent({
  props: {
    options: {
      type: Object,
    },
  },
  setup(props, ctx) {
    const state = reactive({
      options: props.options,
      isShow: false,
    });

    ctx.expose({
      showDialog(options) {
        state.options = options;
        state.isShow = true;
      },
    });

    const cancel = () => {
      state.isShow = false;
    };

    const confirm = () => {
      state.isShow = false;
      state.options.onConfirm && state.options.onConfirm(state.options.content);
    };

    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.options.title}>
          {{
            default: () => (
              <ElInput
                type="textarea"
                v-model={state.options.content}
                rows={10}
              />
            ),
            footer: () =>
              state.options.footer && (
                <div>
                  <ElButton onClick={cancel}>Cancel</ElButton>
                  <ElButton onClick={confirm}>Confirm</ElButton>
                </div>
              ),
          }}
        </ElDialog>
      );
    };
  },
});

let vm;
export function $dialog(options) {
  if (!vm) {
    let el = document.createElement('div');
    vm = createVNode(DialogComponent, { options });
    render(vm, el);
    document.body.appendChild(el);
  }
  vm.component.exposed.showDialog(options);
}
