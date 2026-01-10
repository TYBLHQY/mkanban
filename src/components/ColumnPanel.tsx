import EditableInput from "@/components/EditableInput";
import { getNeighborByParentId, insert, removeById, removeByParentId, updateById } from "@/database/api";
import { useStore } from "@/stores/store";
import type { BoardData, Direction } from "@/types";
import { defineComponent, ref, watch, type PropType } from "vue";
import IconAdd from "~icons/mdi/add-circle-outline";
import IconArrowLeftBoldBoxOutline from "~icons/mdi/arrow-left-bold-box-outline";
import IconArrowRightBoldBoxOutline from "~icons/mdi/arrow-right-bold-box-outline";
import IconDeleteEmptyOutline from "~icons/mdi/delete-empty-outline";
import IconDeleteOutline from "~icons/mdi/delete-outline";

export default defineComponent(
  (props, { emit }) => {
    const store = useStore();
    const editing = ref<boolean>(false);
    const updateCol = () => updateById(props.col.id, { doc: props.col.doc });

    const addCard = () => {
      insert("card", {
        parentId: props.col.id,
        doc: { title: "New Card" },
      }).then(id => emit("update:addCard", id));
    };
    const removeCol = async () => {
      await removeByParentId(props.col.id);
      await removeById(props.col.id);
      emit("update:removeCol");
    };
    const moveCol = async (direction: Direction) => {
      const neighbor: BoardData = await getNeighborByParentId(store.openedBoardId, props.col.position, direction);
      await updateById(props.col.id, { position: neighbor.position });
      await updateById(neighbor.id, { position: props.col.position });
      store.updatedCols = new Set([props.col.position, neighbor.position]);
    };

    watch(
      () => store.globalEditing,
      newVal => (editing.value = newVal),
      { immediate: true },
    );

    return () => (
      <div class="flex flex-col gap-3 p-3">
        <div class="flex items-center justify-between">
          <EditableInput
            class="flex-1 font-semibold text-shadow-lg"
            editing={editing.value}
            content={props.col.doc.title}
            placeholder="Column Title"
            onUpdate:editing={val => (editing.value = val)}
            onUpdate:content={val => (props.col.doc.title = val)}
            onUpdate:update={updateCol}
          />
          <IconAdd
            class="text-ctp-lavender hover:text-ctp-yellow ml-2 cursor-pointer transition-colors"
            v-show={!editing.value && !store.globalEditing}
            onClick={addCard}
          />
          <div
            class="group"
            v-show={store.globalEditing}>
            <IconDeleteOutline class="text-ctp-red ml-2 cursor-pointer group-hover:hidden" />
            <IconDeleteEmptyOutline
              class="text-ctp-red ml-2 hidden cursor-pointer group-hover:block"
              onClick={removeCol}
            />
          </div>
        </div>
        <div
          class="flex items-center gap-2"
          v-show={editing.value || props.col.doc.description}>
          <IconArrowLeftBoldBoxOutline
            class="text-ctp-yellow cursor-pointer"
            v-show={store.globalEditing && props.col.position > 0}
            onClick={() => moveCol("prev")}
          />
          <EditableInput
            class="flex-1"
            editing={editing.value}
            content={props.col.doc.description || ""}
            placeholder="Column Description"
            onUpdate:editing={val => (editing.value = val)}
            onUpdate:content={val => (props.col.doc.description = val)}
            onUpdate:update={updateCol}
          />
          <IconArrowRightBoldBoxOutline
            class="text-ctp-yellow cursor-pointer"
            v-show={store.globalEditing && props.col.position < props.colsLen - 1}
            onClick={() => moveCol("next")}
          />
        </div>
      </div>
    );
  },
  {
    props: {
      col: Object as PropType<BoardData>,
      colsLen: Number as PropType<number>,
      cardsLen: Number as PropType<number>,
    },
    emits: ["update:addCard", "update:removeCol"],
  },
);
