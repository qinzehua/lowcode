import deepcopy from 'deepcopy';
import { onUnmounted, onMounted } from 'vue';
import { events } from './events';

export function useCommand(data, focusData) {
  const state = {
    current: -1,
    queue: [],
    commands: {},
    commandArray: [],
    destroyArray: [],
  };

  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...args) => {
      const { redo, undo } = command.execute(...args);
      redo();

      if (!command.pushQueue) {
        return;
      }

      let { queue, current } = state;

      //新增的时候，有可能当前处于撤销状态,需要删除无用的命令
      if (queue.length) {
        queue = queue.slice(0, current + 1);
        state.queue = queue;
      }

      queue.push({ redo, undo });
      state.current = current + 1;
    };
  };

  registry({
    name: 'undo',
    keyboard: 'ctrl+y',
    execute() {
      return {
        redo() {
          let item = state.queue[state.current + 1];
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        },
      };
    },
  });

  registry({
    name: 'revoke',
    keyboard: 'ctrl+z',
    execute() {
      return {
        redo() {
          if (state.current == -1) return;
          let item = state.queue[state.current];
          if (item) {
            item.undo && item.undo();
            state.current--;
          }
        },
      };
    },
  });

  registry({
    name: 'drag',
    pushQueue: true,
    init() {
      this.before = null;
      const start = () => {
        this.before = deepcopy(data.value.blocks);
      };
      const end = () => {
        state.commands.drag();
      };

      events.on('start', start);
      events.on('end', end);

      return () => {
        events.off('start', start);
        events.off('end', end);
      };
    },
    execute() {
      let before = this.before;
      let after = data.value.blocks;
      return {
        redo() {
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });

  registry({
    name: 'updateContainer',
    pushQueue: true,
    execute(newValue) {
      const before = deepcopy(data.value.container);
      const after = deepcopy(newValue.container);
      return {
        redo() {
          data.value = { ...data.value, container: after };
        },
        undo() {
          data.value = { ...data.value, container: before };
        },
      };
    },
  });

  registry({
    name: 'placeTop',
    pushQueue: true,
    execute() {
      let before = deepcopy(data.value.blocks);
      let after = (() => {
        let { focus, unfocused } = focusData.value;
        let maxZindex = unfocused.reduce((prev, block) => {
          return Math.max(prev, block.zIndex);
        }, -Infinity);

        focus.forEach((block) => (block.zIndex = maxZindex + 1));
        return data.value.blocks;
      })();

      return {
        undo() {
          data.value = { ...data.value, blocks: before };
        },
        redo() {
          data.value = { ...data.value, blocks: after };
        },
      };
    },
  });

  registry({
    name: 'placeBottom',
    pushQueue: true,
    execute() {
      let before = deepcopy(data.value.blocks);
      let after = (() => {
        let { focus, unfocused } = focusData.value;
        let minZindex = unfocused.reduce((prev, block) => {
          return Math.min(prev, block.zIndex);
        }, Infinity);

        if (minZindex < 0) {
          const dur = Math.abs(minZindex);
          minZindex = 0;
          unfocused.forEach((block) => (block.zIndex += dur));
        }

        focus.forEach((block) => (block.zIndex = minZindex - 1));
        return deepcopy(data.value.blocks);
      })();

      return {
        undo() {
          data.value = { ...data.value, blocks: before };
        },
        redo() {
          data.value = { ...data.value, blocks: after };
        },
      };
    },
  });

  registry({
    name: 'delete',
    pushQueue: true,
    execute() {
      let before = deepcopy(data.value.blocks);
      let after = deepcopy(focusData.value.unfocused);

      return {
        undo() {
          data.value = { ...data.value, blocks: before };
        },
        redo() {
          data.value = { ...data.value, blocks: after };
        },
      };
    },
  });

  registry({
    name: 'updateBlock',
    pushQueue: true,
    execute(newBlock, oldBlock) {
      let state = {
        before: data.value.blocks,
        after: (() => {
          let blocks = [...data.value.blocks];
          const index = data.value.blocks.findIndex(
            (block) => block.id === oldBlock.id,
          );
          if (index > -1) {
            blocks.splice(index, 1, newBlock);
          }
          return blocks;
        })(),
      };

      return {
        undo() {
          data.value = { ...data.value, blocks: state.before };
        },
        redo() {
          data.value = { ...data.value, blocks: state.after };
        },
      };
    },
  });

  registry({
    name: 'keyboard',
    init() {
      const keyCodes = {
        90: 'z',
        89: 'y',
      };
      const keydown = (e) => {
        const { ctrlKey, keyCode } = e;
        let keyString = [];
        if (ctrlKey) keyString.push('ctrl');
        keyString.push(keyCodes[keyCode]);
        keyString = keyString.join('+');

        state.commandArray.forEach(({ keyboard, name }) => {
          if (!keyboard) return;
          if (keyboard === keyString) {
            state.commands[name]();
            e.preventDefault();
          }
        });
      };

      window.addEventListener('keydown', keydown);

      return () => {
        window.removeEventListener('keydown', keydown);
      };
    },
  });

  onMounted(() => {
    state.commandArray.forEach((command) => {
      if (command.init) {
        const destroy = command.init();
        state.destroyArray.push(destroy);
      }
    });
  });

  onUnmounted(() => {
    state.destroyArray.forEach((destroy) => {
      destroy();
    });
  });

  return state;
}
