import Logo from "@/assets/icon/app-icon.svg";
import Column from "@/components/Column";
import { getListByParentId, insert } from "@/database/api";
import { useStore } from "@/stores/store";
import type { BoardData } from "@/types";
import { verticallyScrollable } from "@/utils";
import { defineComponent, ref, watch } from "vue";
import IconAdd from "~icons/mdi/add-circle-outline";

export default defineComponent(() => {
  const store = useStore();
  const colList = ref<BoardData[]>([]);

  const onWheel = (e: WheelEvent) => {
    const container = e.currentTarget as HTMLElement;
    let node = e.target as HTMLElement;

    while (node && node !== container) {
      if (verticallyScrollable(node)) return;
      node = node.parentElement!;
    }

    container.scrollLeft += e.deltaY;
    e.preventDefault();
  };

  const getColList = () => getListByParentId(store.openedBoardId).then(data => (colList.value = data));
  const addCol = async () => {
    await insert("column", { parentId: store.openedBoardId, doc: { title: "New Column" } });
    getColList();
  };

  watch(
    () => store.openedBoardId,
    _ => getColList(),
    { immediate: true },
  );

  watch(
    () => store.updatedCols,
    () => getColList(),
  );

  return () => (
    <div
      class="scrollbar-none flex h-full w-full flex-row items-start gap-4 overflow-x-auto p-4"
      onWheel={onWheel}>
      {colList.value.map(col => (
        <Column
          key={col.id}
          col={col}
          colsLen={colList.value.length}
          onUpdate:removeCol={getColList}
        />
      ))}
      <div
        class="group border-ctp-surface1 hover:border-ctp-mauve flex rounded border-4 border-dashed p-3"
        v-show={store.globalEditing}
        onClick={addCol}>
        <IconAdd class="text-ctp-surface2 group-hover:text-ctp-mauve" />
      </div>
      <div
        class="pointer-events-none absolute right-1/2 bottom-1/2 translate-x-1/2 translate-y-1/2 select-none"
        v-show={colList.value.length === 0}>
        <img
          class="w-20"
          src={Logo}
          alt="facicon"
          style={{ filter: "grayscale(100%)" }}
        />
      </div>
    </div>
  );
});
