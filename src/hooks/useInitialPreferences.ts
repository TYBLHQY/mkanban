import { getInfo, getPreferences } from "@/database/api";
import { useStore } from "@/stores/store";
import { watch } from "vue";

export function useInitialPreferences() {
  const store = useStore();

  const initPreferences = async () => {
    await getPreferences().then(preference => {
      store.theme = preference.theme!;
      store.openedBoardId = preference.opened_board_id!;
    });
  };

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

  return {
    initPreferences,
  };
}
