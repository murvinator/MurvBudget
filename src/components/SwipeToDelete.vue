<template>
  <div
    ref="rowEl"
    class="swipe-row"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @click.capture="onContentClick"
  >
    <!-- Left side: never moves -->
    <div class="swipe-fixed">
      <slot name="fixed" />
    </div>

    <!-- Right side: slides left to make room -->
    <div
      class="swipe-sliding"
      :style="{
        transform: `translateX(${-offset}px)`,
        transition: dragging ? 'none' : 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }"
    >
      <slot />
    </div>

    <!-- Delete button: slides in from the right -->
    <div
      class="swipe-actions"
      :style="{
        transform: `translateX(${ACTION_WIDTH - offset}px)`,
        transition: dragging ? 'none' : 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }"
    >
      <button class="swipe-delete-btn" @click.stop="onDelete">Ta bort</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['delete'])

const ACTION_WIDTH = 90
const OPEN_THRESHOLD = 40

const rowEl = ref(null)
const offset = ref(0)
const isOpen = ref(false)
const dragging = ref(false)

let touchStartX = 0
let touchStartY = 0
let scrolling = false

const uid = Symbol()

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  dragging.value = false
  scrolling = false
}

function onTouchMove(e) {
  const dx = e.touches[0].clientX - touchStartX
  const dy = e.touches[0].clientY - touchStartY

  if (!dragging.value && !scrolling) {
    if (Math.abs(dy) > Math.abs(dx)) { scrolling = true; return }
    if (Math.abs(dx) > 8) dragging.value = true
  }

  if (scrolling) return
  if (dragging.value) e.preventDefault()

  const base = isOpen.value ? ACTION_WIDTH : 0
  offset.value = Math.max(0, Math.min(ACTION_WIDTH, base - dx))
}

function onTouchEnd() {
  if (scrolling || !dragging.value) { dragging.value = false; return }
  dragging.value = false
  if (!isOpen.value) {
    if (offset.value >= OPEN_THRESHOLD) open()
    else close()
  } else {
    if (offset.value < ACTION_WIDTH - OPEN_THRESHOLD) close()
    else open()
  }
}

function open() {
  isOpen.value = true
  offset.value = ACTION_WIDTH
  document.dispatchEvent(new CustomEvent('swipe-open', { detail: uid }))
}

function close() {
  isOpen.value = false
  offset.value = 0
}

function onDelete() {
  close()
  emit('delete')
}

function onContentClick(e) {
  if (isOpen.value) {
    e.stopPropagation()
    close()
  }
}

function onOtherOpen(e) {
  if (e.detail !== uid) close()
}

function onDocumentTouch(e) {
  if (isOpen.value && rowEl.value && !rowEl.value.contains(e.target)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('swipe-open', onOtherOpen)
  document.addEventListener('touchstart', onDocumentTouch, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('swipe-open', onOtherOpen)
  document.removeEventListener('touchstart', onDocumentTouch)
})
</script>

<style scoped>
.swipe-row {
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  padding: 14px 16px;
  border-bottom: 0.5px solid var(--separator);
  background: var(--card-bg);
  touch-action: pan-y;
}

/* Name column: takes all available width, never moves */
.swipe-fixed {
  flex: 1;
  min-width: 0;
}

/* Amount column: slides left when swiped */
.swipe-sliding {
  flex-shrink: 0;
}

/* Delete button container: slides in from off-screen right */
.swipe-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.swipe-delete-btn {
  background: var(--system-red);
  color: #ffffff;
  border: none;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  min-height: unset;
}
</style>
