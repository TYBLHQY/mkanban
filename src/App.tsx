import { getInfo, getPreferences } from "@/database/api";
import MainLayout from "@/layouts/MainLayout";
import { useStore } from "@/stores/store";
import { defineComponent, watch } from "vue";

export default defineComponent(() => {
  const store = useStore();

  getPreferences().then(preference => {
    store.theme = preference.theme!;
    store.openedBoardId = preference.opened_board_id!;
  });

  watch(
    () => store.theme,
    newTheme => (store.themeClass = newTheme),
    { immediate: true },
  );

  watch(
    () => store.openedBoardId,
    newId => newId && getInfo(newId).then(data => (store.board = data)),
    { immediate: true },
  );

  return () => <MainLayout class={store.themeClass} />;
});
