import CardPanel from "@/components/CardPanel";
import ColumnPanel from "@/components/ColumnPanel";
import { getListByParentId } from "@/database/api";
import { useStore } from "@/stores/store";
import type { BoardData } from "@/types";
import { defineComponent, ref, watch, type PropType } from "vue";
import IconDeleteEmptyOutline from "~icons/mdi/delete-empty-outline";
import IconDeleteOutline from "~icons/mdi/delete-outline";

export default defineComponent(
  (props, { emit }) => {
    const store = useStore();
    const cards = ref<BoardData[]>([]);

    const getData = () => getListByParentId(props.col.id).then(data => (cards.value = data));

    watch(() => props.col.id, getData, { immediate: true });
    watch(
      () => store.updatedCols,
      newVal => newVal && newVal.has(props.col.position) && getData(),
    );

    return () => (
      <div class="bg-ctp-mantle border-ctp-base shadow-ctp-crust relative flex max-h-full w-xs max-w-xs shrink-0 flex-col overflow-hidden rounded border-2 shadow-2xl">
        <div class="sticky top-0 z-10">
          <ColumnPanel
            col={props.col}
            colsLen={props.colsLen}
            cardsLen={cards.value.length}
            onUpdate:addCard={getData}
            onUpdate:removeCol={() => emit("update:removeCol")}
          />
        </div>
        {cards.value.length > 0 && (
          <div class="scrollbar-none flex flex-1 flex-col gap-3 overflow-auto p-3 pt-0">
            {cards.value.map(card => (
              <div class="group relative flex">
                <CardPanel
                  class="group-hover:border-ctp-surface1 flex-1 transition-colors"
                  key={card.id}
                  col={props.col}
                  card={card}
                  colsLen={props.colsLen}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
  {
    props: {
      col: Object as PropType<BoardData>,
      colsLen: Number as PropType<number>,
    },
    emits: ["update:removeCol"],
  },
);
