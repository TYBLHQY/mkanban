import EditableInput from "@/components/EditableInput";
import { getNeighborByParentId, updateById } from "@/database/api";
import { useStore } from "@/stores/store";
import type { BoardData, Direction } from "@/types";
import { defineComponent, ref, watch, type PropType } from "vue";
import IconArrowLeft from "~icons/mdi/arrow-left-bold-circle-outline";
import IconArrowRight from "~icons/mdi/arrow-right-bold-circle-outline";
import IconDeleteEmptyOutline from "~icons/mdi/delete-empty-outline";
import IconDeleteOutline from "~icons/mdi/delete-outline";

export default defineComponent(
  props => {
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

    const removeCard = () => {};

    return () => (
      <div>
        <div class="bg-ctp-base border-ctp-surface0 hover:border-ctp-mauve relative flex flex-col gap-3 rounded border-2 p-3 transition-colors">
          <EditableInput
            editing={editing.value}
            content={props.card.doc.title}
            onUpdate:editing={val => (editing.value = val)}
            onUpdate:content={val => (props.card.doc.title = val)}
            onUpdate:update={updateCard}
            placeholder="Card Title"
            class="font-semibold"
          />

          {(editing.value || props.card.doc.description) && (
            <EditableInput
              editing={editing.value}
              content={props.card.doc.description || ""}
              onUpdate:editing={val => (editing.value = val)}
              onUpdate:content={val => (props.card.doc.description = val)}
              onUpdate:update={updateCard}
              placeholder="Card Description"
              class="text-xs"
            />
          )}
        </div>

        {store.globalEditing && (
          <div class="group absolute right-1/2 bottom-0 flex translate-x-1/2 translate-y-1/2 items-center opacity-0 transition-opacity group-hover:opacity-100">
            <IconDeleteOutline class="text-ctp-red ml-2 cursor-pointer group-hover:hidden" />
            <IconDeleteEmptyOutline
              class="text-ctp-red ml-2 hidden cursor-pointer group-hover:block"
              onClick={removeCard}
            />
          </div>
        )}

        {props.col.position > 0 && (
          <IconArrowLeft
            class="text-ctp-lavender hover:text-ctp-yellow absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0 transition-[opacity,colors] group-hover:opacity-100"
            onClick={() => moveCard(props.card.id, "prev")}
          />
        )}
        {props.col.position < props.colsLen - 1 && (
          <IconArrowRight
            class="text-ctp-lavender hover:text-ctp-yellow absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0 transition-[opacity,colors] group-hover:opacity-100"
            onClick={() => moveCard(props.card.id, "next")}
          />
        )}
      </div>
    );
  },
  {
    props: {
      col: Object as PropType<BoardData>,
      card: Object as PropType<BoardData>,
      colsLen: Number as PropType<number>,
    },
  },
);
