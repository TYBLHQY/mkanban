import { getListByParentId, removeById, removeByParentId, setPreferences, updateById } from "@/database/api";
import { clearEmptyContent, focusAndMoveToEnd, focusAndSelectAll } from "@/hooks/useFocusSelection";
import { useStore } from "@/stores/store";
import type { BoardData } from "@/types";
import { defineComponent, ref, watch, type PropType } from "vue";
import IconVariant from "~icons/mdi/box-variant";
import IconVariantClosed from "~icons/mdi/box-variant-closed";
import IconBoxVariantClosedRemove from "~icons/mdi/box-variant-closed-remove";
import IconBoxVariantRemove from "~icons/mdi/box-variant-remove";

export default defineComponent(
  (props, { emit }) => {
    const store = useStore();
    const contentRef = ref<HTMLDivElement>();

    const openBoard = (id: string) => {
      store.openedBoardId = id;
      setPreferences({ opened_board_id: id });
      emit("update:update");
    };

    const removeBoard = (event: MouseEvent, id: string) => {
      event.stopPropagation();
      getListByParentId(id).then(cols => cols.forEach(col => removeByParentId(col.id)));
      removeByParentId(id);
      removeById(id).then(() => emit("update:update"));
      if (id === store.openedBoardId) {
        store.openedBoardId = "";
        setPreferences({ opened_board_id: "" });
      }
    };

    const editing = ref<boolean>(false);
    const editBoard = async () => {
      if (editing.value) return;
      editing.value = true;
      await focusAndSelectAll(contentRef);
      emit("update:update");
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        contentRef.value?.blur();
        updateById(props.board.id, { doc: { title: contentRef.value?.textContent } });
      }
      if (e.key === "Escape") {
        contentRef.value && (contentRef.value.textContent = props.board.doc.title);
        contentRef.value?.blur();
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const handleBlur = () => {
      editing.value = false;
      contentRef.value?.blur();
    };

    const localContent = ref<string>(props.board.doc.title);
    watch(
      () => contentRef.value,
      _ => contentRef.value && (contentRef.value.textContent = props.board.doc.title),
      { immediate: true },
    );
    const handleInput = async () => {
      clearEmptyContent(contentRef);
      localContent.value = contentRef.value?.textContent!;
      await focusAndMoveToEnd(contentRef);
    };

    return () => (
      <div
        class={[
          "bg-ctp-mantle border-ctp-mantle flex cursor-pointer gap-2 rounded-lg border-2 p-2 pr-7 pl-6 whitespace-nowrap select-none",
          { "border-ctp-peach": store.openedBoardId === props.board.id },
          { "hover:border-ctp-mauve": store.openedBoardId !== props.board.id },
        ]}
        onClick={() => (store.openedBoardId !== props.board.id ? openBoard(props.board.id) : editBoard())}>
        <div
          class="group relative"
          onClick={e => removeBoard(e, props.board.id)}>
          <div class="translate-y-0 opacity-100 transition-[opacity,translate] duration-300 ease-in-out group-hover:-translate-y-2 group-hover:opacity-0">
            {store.openedBoardId === props.board.id && <IconVariant class="text-ctp-peach" />}
            {store.openedBoardId !== props.board.id && <IconVariantClosed class="text-ctp-mauve" />}
          </div>
          <div class="absolute inset-0 translate-y-2 opacity-0 transition-[opacity,translate] duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100">
            {store.openedBoardId === props.board.id && <IconBoxVariantRemove class="text-ctp-red" />}
            {store.openedBoardId !== props.board.id && <IconBoxVariantClosedRemove class="text-ctp-red" />}
          </div>
        </div>
        <div
          class={["empty:before:text-ctp-overlay0 leading-none underline-offset-5 outline-0 empty:before:content-[attr(placeholder)]", { underline: editing.value }]}
          ref={contentRef}
          contenteditable={editing.value ? "plaintext-only" : false}
          onKeydown={handleKeyDown}
          onInput={handleInput}
          onBlur={handleBlur}
          placeholder="Board Title"
        />
      </div>
    );
  },
  {
    props: {
      board: Object as PropType<BoardData>,
    },
    emits: ["update:update"],
  },
);
