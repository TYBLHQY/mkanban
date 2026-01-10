import Setting from "@/components/Setting";
import { useStore } from "@/stores/store";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export default defineComponent(() => {
  const store = useStore();
  return () => (
    <div class={["bg-ctp-base text-ctp-text h-screen w-screen", store.themeClass]}>
      <Setting />
      <RouterView />
    </div>
  );
});
