import { useInitialPreferences } from "@/hooks/useInitialPreferences";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export default defineComponent(() => {
  useInitialPreferences().initPreferences();
  return () => <RouterView />;
});
