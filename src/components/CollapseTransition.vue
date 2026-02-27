<template>
  <Transition
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <slot />
  </Transition>
</template>

<script setup>
function beforeEnter(el) {
  el.style.height = '0'
  el.style.overflow = 'hidden'
}

function enter(el, done) {
  el.style.transition = 'height 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  el.style.height = el.scrollHeight + 'px'
  el.addEventListener('transitionend', done, { once: true })
}

function afterEnter(el) {
  el.style.height = ''
  el.style.overflow = ''
  el.style.transition = ''
}

function beforeLeave(el) {
  el.style.height = el.scrollHeight + 'px'
  el.style.overflow = 'hidden'
}

function leave(el, done) {
  el.style.transition = 'height 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  el.style.height = '0'
  el.addEventListener('transitionend', done, { once: true })
}

function afterLeave(el) {
  el.style.height = ''
  el.style.overflow = ''
  el.style.transition = ''
}
</script>
