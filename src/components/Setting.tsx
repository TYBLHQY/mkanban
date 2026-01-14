import SettingPanel from "@/components/SettingPanel";
import { useStore } from "@/stores/store";
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import IconEditOutline from "~icons/mdi/edit-outline";
import IconSettings from "~icons/mdi/settings";

export default defineComponent(() => {
  const store = useStore();
  const opening = ref(false);

  const keydown = (e: KeyboardEvent) => {
    e.key === "Escape" && (opening.value = false);
    e.key === "Alt" && (opening.value = !opening.value);
  };
  onMounted(() => window.addEventListener("keydown", keydown));
  onBeforeUnmount(() => window.removeEventListener("keydown", keydown));

  const setting = () => {
    !store.globalEditing && (opening.value = !opening.value);
    store.globalEditing && (store.globalEditing = false);
  };

  return () => (
    <div class="fixed right-0 bottom-0 z-999">
      <div
        onClick={() => (opening.value = !opening.value)}
        class={["bg-ctp-crust fixed right-0 bottom-0 -z-1 h-full w-full transition-opacity", { "opacity-50": opening.value, "opacity-0": !opening.value }, { "pointer-events-none": !opening.value }]}
      />

      <div
        onClick={setting}
        class={["bg-ctp-surface0 hover:bg-ctp-surface2 cursor-pointer rounded-tr-2xl rounded-bl-2xl p-2 transition-[border-radius]", { "rounded-br-2xl": opening.value, "rounded-tl-2xl": !opening.value }]}>
        <IconSettings v-show={!store.globalEditing} />
        <IconEditOutline
          class={["text-ctp-surface2", { "text-ctp-yellow animate-pulse": store.globalEditing }]}
          v-show={store.globalEditing}
        />
      </div>

      <div class={["transition-opacity", { "opacity-100": opening.value, "opacity-0": !opening.value }, { "pointer-events-none": !opening.value }]}>
        <div class="text-ctp-surface0 absolute top-0 left-0 -translate-y-full bg-[radial-gradient(circle_at_100%_0%,transparent_0,transparent_1rem,currentColor_1rem)] p-2" />
        <div class="text-ctp-surface0 absolute top-0 left-0 -translate-x-full bg-[radial-gradient(circle_at_0%_100%,transparent_0,transparent_1rem,currentColor_1rem)] p-2" />
        <SettingPanel
          class="absolute top-[0.01rem] left-[0.01rem] -translate-x-full -translate-y-full"
          onUpdate:opening={() => (opening.value = false)}
        />
      </div>
    </div>
  );
});
