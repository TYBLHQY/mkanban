import SettingBoardButton from "@/components/SettingBoardButton";
import { getListByType, insert, setPreferences } from "@/database/api";
import { useStore } from "@/stores/store";
import type { BoardData, Theme } from "@/types";
import { defineComponent, ref, watch } from "vue";
import IconBoxVariantClosedAdd from "~icons/mdi/box-variant-closed-add";
import IconEditOutline from "~icons/mdi/edit-outline";
import IconPalette from "~icons/mdi/palette-outline";

export default defineComponent(
  (props, { emit }) => {
    const store = useStore();
    const setTheme = () => {
      const themes: Theme[] = ["latte", "mocha", "frappe", "macchiato"];
      store.theme = themes[(themes.indexOf(store.theme) + 1) % themes.length] || "mocha";
      setPreferences({ theme: store.theme });
    };

    const boardList = ref<BoardData[]>([]);
    const getBoards = () => getListByType("board").then(boards => (boardList.value = boards));
    const addNewBoard = async () => {
      const id = await insert("board", { doc: { title: "New Board" } });
      store.openedBoardId = id;
      setPreferences({ opened_board_id: id });
      getBoards();
    };
    watch(() => store.openedBoardId, getBoards, { immediate: true });

    const setGlobalEditing = () => {
      store.globalEditing = !store.globalEditing;
      emit("update:opening");
    };

    return () => (
      <div class="bg-ctp-surface0 flex flex-row gap-3 rounded-2xl rounded-br-none p-2">
        <div class="flex flex-col-reverse gap-3">
          <div
            class="bg-ctp-mantle border-ctp-mantle hover:border-ctp-mauve flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2 pr-7 pl-6 whitespace-nowrap select-none"
            onClick={setTheme}>
            <IconPalette />
            {store.theme}
          </div>
          <div
            class={["border-ctp-surface2 flex cursor-pointer justify-center rounded-lg border-2 p-2", { "border-ctp-yellow animate-pulse": store.globalEditing }]}
            onClick={setGlobalEditing}>
            <IconEditOutline class={["text-ctp-surface2", { "text-ctp-yellow animate-pulse": store.globalEditing }]} />
          </div>
        </div>
        <div class="flex flex-col-reverse gap-3">
          {boardList.value.map(board => (
            <SettingBoardButton
              board={board}
              onUpdate:update={getBoards}
            />
          ))}
          <div
            class="border-ctp-surface2 hover:border-ctp-mauve flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-2 px-6 select-none"
            onClick={addNewBoard}>
            <IconBoxVariantClosedAdd />
          </div>
        </div>
      </div>
    );
  },
  {
    emits: ["update:opening"],
  },
);
