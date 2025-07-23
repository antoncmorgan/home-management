<template>
  <n-modal :show="show" preset="dialog" :title="modalTitle" @mask-click="close" @close="close">
    <n-form @submit.prevent="submit" class="add-family-member-form">
      <n-form-item label="Name" required>
        <n-input v-model:value="name" required placeholder="Enter name" />
      </n-form-item>
      <n-form-item label="Email (optional)">
        <n-input v-model:value="email" placeholder="Enter email" />
      </n-form-item>
      <n-form-item label="Avatar">
        <div class="avatar-options">
          <button
            v-for="option in avatarOptions"
            :key="option.value"
            type="button"
            class="avatar-btn"
            :class="{ selected: avatar === option.value }"
            @click="avatar = option.value"
            :aria-label="option.label"
          >
            <span class="avatar-emoji">{{ option.emoji }}</span>
          </button>
        </div>
      </n-form-item>
      <n-form-item label="Color (optional)">
        <div class="color-options">
          <button
            v-for="preset in presetColors"
            :key="preset"
            type="button"
            class="color-btn"
            :style="{ backgroundColor: preset }"
            :class="{ selected: color === preset }"
            @click="color = preset"
            :aria-label="'Select color ' + preset"
          />
          <div class="color-picker-wrapper" style="position: relative;">
            <input v-model="color" type="color" class="color-picker" :aria-label="'Custom color'" />
            <span class="palette-icon">
              <svg class="palette-svg-bg" width="30" height="30" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" :fill="color" />
              </svg>
              <Palette class="palette-svg" width="20" height="20" :style="{ color: paletteIconColor }" />
            </span>
          </div>
        </div>
      </n-form-item>
      <div class="actions">
        <n-button v-if="mode === 'edit'" @click="handleDelete" type="error">Delete</n-button>
        <n-button type="primary" attr-type="submit">{{ actionButtonText }}</n-button>
        <n-button @click="close" type="default">Cancel</n-button>
      </div>
    </n-form>
  </n-modal>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { NModal, NForm, NFormItem, NInput, NButton } from 'naive-ui';
import { Palette } from '@iconoir/vue';
import { useHomeStore } from '../store/homeStore';

export default defineComponent({
  name: 'FamilyMemberModal',
  components: { NModal, NForm, NFormItem, NInput, NButton, Palette },
  props: {
    show: Boolean,
    mode: {
      type: String,
      default: 'add',
      validator: (v: string) => ['add', 'edit'].includes(v)
    },
    member: {
      type: Object,
      default: null
    }
  },
  emits: ['add', 'update', 'delete', 'close'],
  setup(props, { emit }) {
    const name = ref('');
    const email = ref('');
    const avatar = ref('🧑');
    const color = ref('#cccccc');
    const { home } = useHomeStore();
    const presetColors = [
      '#cccccc', // default gray
      '#f87171', // red
      '#fbbf24', // yellow
      '#34d399', // green
      '#60a5fa', // blue
      '#a78bfa', // purple
      '#f472b6', // pink
      '#f59e42', // orange
    ];

    const avatarOptions = [
      { label: 'Generic Person', value: '🧑', emoji: '🧑' },
      { label: 'Adult Male', value: '👨', emoji: '👨' },
      { label: 'Adult Female', value: '👩', emoji: '👩' },
      { label: 'Kid Male', value: '👦', emoji: '👦' },
      { label: 'Kid Female', value: '👧', emoji: '👧' },
      { label: 'Baby', value: '👶', emoji: '👶' },
      { label: 'Cat', value: '🐱', emoji: '🐱' },
      { label: 'Dog', value: '🐶', emoji: '🐶' },
    ];

    // Watch for modal open and member prop changes
    watch(
      [() => props.show, () => props.member, () => props.mode],
      ([show, member, mode]) => {
        if (show) {
          if (mode === 'edit' && member) {
            name.value = member.name || '';
            email.value = member.email || '';
            avatar.value = member.avatar || '🧑';
            color.value = member.color || '#cccccc';
          } else {
            name.value = '';
            email.value = '';
            avatar.value = '🧑';
            color.value = '#cccccc';
          }
        }
      },
      { immediate: true }
    );

    const modalTitle = computed(() => props.mode === 'edit' ? 'Edit Family Member' : 'Add Family Member');
    const actionButtonText = computed(() => props.mode === 'edit' ? 'Update' : 'Add');

    function submit() {
      if (props.mode === 'edit' && props.member) {
        emit('update', {
          ...props.member,
          name: name.value,
          email: email.value,
          avatar: avatar.value,
          color: color.value,
          familyId: props.member.familyId || home.value?.id || ''
        });
      } else {
        emit('add', {
          name: name.value,
          email: email.value,
          avatar: avatar.value,
          color: color.value,
          familyId: home.value?.id || ''
        });
      }
    }
    function close() {
      emit('close');
    }
    function handleDelete() {
      if (props.mode === 'edit' && props.member) {
        emit('delete', props.member);
      }
    }
    function hexToRgb(hex: string) {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
      const num = parseInt(c, 16);
      return [
        (num >> 16) & 255,
        (num >> 8) & 255,
        num & 255
      ];
    }

    function getLuminance(hex: string) {
      const [r, g, b] = hexToRgb(hex);
      // sRGB luminance(Y) values
      const [rs, gs, bs] = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    const paletteIconColor = computed(() => {
      // Use dark icon for light backgrounds, light icon for dark backgrounds
      return getLuminance(color.value) > 0.5 ? '#222' : '#fff';
    });

    const mode = computed(() => props.mode);
    return { name, email, avatar, color, avatarOptions, presetColors, submit, close, paletteIconColor, modalTitle, actionButtonText, mode, handleDelete };
  },
});
</script>

<style scoped>
.actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.add-family-member-form {
  display: flex;
  flex-direction: column;
  gap: 0rem;
}

.avatar-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.avatar-btn {
  background: none;
  border: 2px solid transparent;
  border-radius: 50%;
  padding: 0.25rem;
  cursor: pointer;
  font-size: 2rem;
  transition: border 0.2s;
}
.avatar-btn.selected {
  border-color: #18a058;
  background: #e6f7ec;
}

.avatar-emoji {
  display: inline-block;
  line-height: 1;
}

.color-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.color-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  outline: none;
  transition: border 0.2s;
}
.color-btn.selected {
  border-color: #18a058;
  box-shadow: 0 0 0 2px #e6f7ec;
}
.color-picker-wrapper {
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
}

.color-picker {
  width: 2.5rem;
  height: 2.5rem;
  background: #fff;
  padding: 0;
  cursor: pointer;
  position: relative;
  z-index: 1;
  border: none;
}

.palette-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.palette-svg-bg {
  top: 0;
  left: 0;
  width: 30px;
  height: 30px;
  z-index: 1;
  pointer-events: none;
}
.palette-svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 2;
}
</style>
