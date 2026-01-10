import EditableInput from "@/components/EditableInput";
import { getNeighborByParentId, removeById, updateById } from "@/database/api";
import { useStore } from "@/stores/store";
import type { BoardData, Direction } from "@/types";
import { defineComponent, ref, watch, type PropType } from "vue";
import IconArrowLeft from "~icons/mdi/arrow-left-bold-circle-outline";
import IconArrowRight from "~icons/mdi/arrow-right-bold-circle-outline";
import IconDeleteEmptyOutline from "~icons/mdi/delete-empty-outline";
import IconDeleteOutline from "~icons/mdi/delete-outline";

export default defineComponent(
  (props, { emit }) => {
    const store = useStore();
    const editing = ref<boolean>(false);

    const moveCard = async (id: string, dir: Direction) => {
      const newParent: BoardData = await getNeighborByParentId(store.openedBoardId, props.col.position, dir);
      await updateById(id, { parent_id: newParent?.id });
      store.updatedCols = new Set([props.col.position, newParent.position]);
    };

    const updateCard = () => updateById(props.card.id, { doc: props.card.doc });

    watch(
      () => store.globalEditing,
      newVal => (editing.value = newVal),
      { immediate: true },
    );

    const removeCard = async () => {
      await removeById(props.card.id);
      emit("update:remove");
    };

    return () => (
      <div class="group bg-ctp-base border-ctp-surface0 hover:border-ctp-mauve relative rounded border-2 transition-colors">
        <div class="flex flex-col gap-3 p-3">
          <div class="flex">
            <EditableInput
              class="flex-1 font-semibold"
              editing={editing.value}
              content={props.card.doc.title}
              onUpdate:editing={val => (editing.value = val)}
              onUpdate:content={val => (props.card.doc.title = val)}
              onUpdate:update={updateCard}
              placeholder="Card Title"
            />
            <div
              class="group flex cursor-pointer items-center pl-3"
              v-show={store.globalEditing || editing.value}
              onClick={removeCard}>
              <IconDeleteOutline class="text-ctp-red group-hover:hidden" />
              <IconDeleteEmptyOutline class="text-ctp-red hidden group-hover:block" />
            </div>
          </div>

          <EditableInput
            class={{ "text-xs": !editing.value }}
            v-show={editing.value || props.card.doc.description}
            editing={editing.value}
            content={props.card.doc.description || ""}
            onUpdate:editing={val => (editing.value = val)}
            onUpdate:content={val => (props.card.doc.description = val)}
            onUpdate:update={updateCard}
            placeholder="Card Description"
          />
        </div>

        <IconArrowLeft
          class="text-ctp-lavender hover:text-ctp-yellow absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0 transition-[opacity,colors] group-hover:opacity-100"
          v-show={props.col.position > 0}
          onClick={() => moveCard(props.card.id, "prev")}
        />
        <IconArrowRight
          class="text-ctp-lavender hover:text-ctp-yellow absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0 transition-[opacity,colors] group-hover:opacity-100"
          v-show={props.col.position < props.colsLen - 1}
          onClick={() => moveCard(props.card.id, "next")}
        />
      </div>
    );
  },
  {
    props: {
      col: Object as PropType<BoardData>,
      card: Object as PropType<BoardData>,
      colsLen: Number as PropType<number>,
    },
    emits: ["update:remove"],
  },
);
