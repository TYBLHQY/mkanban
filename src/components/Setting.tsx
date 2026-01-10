import SettingBoardButton from "@/components/SettingBoardButton";
import { getListByType, insert, setPreferences } from "@/database/api";
import { useStore } from "@/stores/store";
import type { BoardData, Theme } from "@/types";
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import IconBoxVariantClosedAdd from "~icons/mdi/box-variant-closed-add";
import IconEditOutline from "~icons/mdi/edit-outline";
import IconPalette from "~icons/mdi/palette-outline";
import IconSettings from "~icons/mdi/settings";

export default defineComponent(() => {
  const store = useStore();
  const editing = ref(false);

  const setTheme = () => {
    const themes: Theme[] = ["latte", "mocha", "frappe", "macchiato"];
    store.theme = themes[(themes.indexOf(store.theme) + 1) % themes.length] || "mocha";
    setPreferences({ theme: store.theme });
  };

  const keydown = (e: KeyboardEvent) => {
    e.key === "Escape" && (editing.value = false);
    e.key === "Alt" && (editing.value = !editing.value);
  };
  onMounted(() => window.addEventListener("keydown", keydown));
  onBeforeUnmount(() => window.removeEventListener("keydown", keydown));

  const boardList = ref<BoardData[]>([]);
  const getBoards = () => getListByType("board").then(boards => (boardList.value = boards));
  const addNewBoard = async () => {
    const id = await insert("board", { doc: { title: "New Board" } });
    store.openedBoardId = id;
    setPreferences({ opened_board_id: id });
    getBoards();
  };

  getBoards();

  return () => (
    <div class="fixed right-0 bottom-0 z-999">
      <div
        onClick={() => (editing.value = !editing.value)}
        class={["bg-ctp-crust fixed right-0 bottom-0 -z-1 h-full w-full transition-opacity", { "opacity-50": editing.value, "opacity-0": !editing.value }, { "pointer-events-none": !editing.value }]}
      />

      <div
        onClick={() => {
          !store.globalEditing && (editing.value = !editing.value);
          store.globalEditing && (store.globalEditing = false);
        }}
        class={["bg-ctp-surface0 hover:bg-ctp-surface2 cursor-pointer rounded-tr-2xl rounded-bl-2xl p-2 transition-[border-radius]", { "rounded-br-2xl": editing.value, "rounded-tl-2xl": !editing.value }]}>
        {!store.globalEditing && <IconSettings />}
        {store.globalEditing && <IconEditOutline class={["text-ctp-surface2", { "text-ctp-yellow animate-pulse": store.globalEditing }]} />}
      </div>

      <div class={["transition-opacity", { "opacity-100": editing.value, "opacity-0": !editing.value }, { "pointer-events-none": !editing.value }]}>
        <div class="text-ctp-surface0 absolute top-0 left-0 -translate-y-full bg-[radial-gradient(circle_at_100%_0%,transparent_0,transparent_1rem,currentColor_1rem)] p-2" />
        <div class="text-ctp-surface0 absolute top-0 left-0 -translate-x-full bg-[radial-gradient(circle_at_0%_100%,transparent_0,transparent_1rem,currentColor_1rem)] p-2" />
        <div class="shadow-ctp-crust bg-ctp-surface0 absolute top-[0.01rem] left-[0.01rem] flex -translate-x-full -translate-y-full flex-row gap-3 rounded-2xl rounded-br-none p-2">
          <div class="flex flex-col-reverse gap-3">
            <div
              class="bg-ctp-mantle border-ctp-mantle hover:border-ctp-mauve flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2 pr-7 pl-6 whitespace-nowrap select-none"
              onClick={setTheme}>
              <IconPalette />
              <div>{store.theme}</div>
            </div>
            <div
              class={["border-ctp-surface2 flex cursor-pointer justify-center rounded-lg border-2 p-2", { "border-ctp-yellow animate-pulse": store.globalEditing }]}
              onClick={() => {
                store.globalEditing = !store.globalEditing;
                editing.value = false;
              }}>
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
      </div>
    </div>
  );
});
