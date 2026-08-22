<script lang="ts" setup>
import type { DetailedUser } from "@halo-dev/api-client";
import ky from "ky";
import { computed, onMounted, ref, onUnmounted } from "vue";


const user = ref<DetailedUser | null>(null);
const isLoading = ref(true);
const isMenuOpen = ref(false);

let closeTimer: ReturnType<typeof setTimeout> | undefined;

function openMenu(){
  if (closeTimer){
    clearTimeout(closeTimer);
    closeTimer = undefined;
  }
  isMenuOpen.value=true;
}

function closeMenuSchedule(){
  closeTimer = setTimeout(()=>{
      isMenuOpen.value=false;
      closeTimer = undefined;
    },200
  );
}

function closeMenuNow(){
  if(closeTimer){
    clearTimeout(closeTimer);
    closeTimer = undefined;
  }
  isMenuOpen.value = false;
}

const isAnonymous = computed(() => {
  return user.value?.user.metadata.name === "anonymousUser";
});

const displayName = computed(() => {
  return (
    user.value?.user.spec.displayName ||
    user.value?.user.metadata.name ||
    "Account"
  );
});

const avatarSrc = computed(() => {
  return user.value?.user.spec.avatar || "";
});

const avatarLabel = computed(() => {
  if (isAnonymous.value) {
    return "?";
  }

  return displayName.value.charAt(0).toUpperCase();
});

function closeMenu(event: FocusEvent){
  const nextElement = event.relatedTarget as Node | null;

  if (!event.currentTarget.contains(nextElement)){
    closeMenuSchedule();
  }
}

onMounted(async () => {
  try {
    user.value = await ky
      .get<DetailedUser>(`/apis/api.console.halo.run/v1alpha1/users/-`)
      .json();
  } catch {
    user.value = null;
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(()=>{
  if(closeTimer){
    clearTimeout(closeTimer);
  }
});
</script>

<template>
  <div
    v-if="isLoading"
    class="user-avatar user-avatar--skeleton"
    aria-busy="true"
    aria-live="polite"
  >  
  </div>
  
  <div
      v-else-if="user && !isAnonymous"
      class="user-menu"
      @mouseenter="openMenu"
      @mouseleave="closeMenuSchedule"
      @focusin="openMenu"
      @focusout="closeMenu"
      @keydown.escape="closeMenuNow"
    >
      <button
        class="user-avatar user-avatar--trigger"
        type="button"
        :aria-expanded="isMenuOpen"
        aria-haspopup="menu"
        :aria-label="`${displayName}`"
        @click="isMenuOpen ? closeMenuNow() : openMenu()"
      >
        <img
          v-if="avatarSrc"
          class="user-avatar--image"
          :src="avatarSrc"
          alt=""
        />
        <span v-else>{{ avatarLabel }}</span>
      </button>

      <div
        class="user-menu--dropdown"
        :class="{'is-open':isMenuOpen}"
        role="menu">
        <p class="user-menu--name">{{ displayName }}</p>

        <a href="/console" role="menuitem">控制台</a>
        <a href="/uc" role="menuitem">用户信息</a>
        <a class="user-menu--logout" href="/logout" role="menuitem">登出</a>
      </div>
    </div>

  <a 
    v-else class="user-avatar user-avatar--login"
    href="/login"
    aria-label="login"
    title="login"
  >
    {{ avatarLabel }}
  </a>
</template>

<style scoped>

.user-menu {
  position: relative;
  display: inline-flex;
}


.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--bg-raised);
  color: var(--ink);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
}

.user-avatar--trigger {
  cursor: pointer;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.user-avatar--trigger:hover,
.user-avatar--trigger:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-soft);
  transform: translateY(-1px);
}

.user-avatar--login {
  text-decoration: none;
}

.user-avatar--image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar--skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-raised) 0%,
    color-mix(in srgb, var(--bg-raised) 78%, var(--ink) 22%) 50%,
    var(--bg-raised) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
}

.user-menu--dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 120;
  display: grid;
  min-width: 11rem;
  padding: 0.45rem;
  border: 1px solid var(--rule);
  border-radius: 0.9rem;
  background: var(--surface);
  box-shadow: var(--shadow);
  backdrop-filter: blur(14px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-0.35rem);
  transition:
    opacity 0.16s ease,
    transform 0.16s ease,
    visibility 0.16s;
}

.user-menu--dropdown.is-open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0);
}

.user-menu--name {
  margin: 0;
  padding: 0.45rem 0.6rem 0.6rem;
  border-bottom: 1px solid var(--rule);
  color: var(--ink);
  font-size: 0.88rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.user-menu--dropdown a {
  padding: 0.5rem 0.6rem;
  border-radius: 0.55rem;
  color: var(--ink-2);
  font-size: 0.88rem;
  text-decoration: none;
}

.user-menu--dropdown a:hover,
.user-menu--dropdown a:focus-visible
{
  outline: none;
  background: var(--bg-raised);
  color: var(--ink);
}

.user-menu--logout {
  margin-top: 0.25rem;
  border-top: 1px solid var(--rule);
}

.user-menu--logout:hover{
  outline: none;
  background: var(--bg-raised);
  color: var(--ink);
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

</style>
