import Setting from "@/components/Setting";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export default defineComponent(() => () => (
  <div class={"bg-ctp-base text-ctp-text h-screen w-screen"}>
    <Setting />
    <RouterView />
  </div>
));
