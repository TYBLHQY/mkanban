import { clearEmptyContent, focusAndMoveToEnd, focusAndSelectAll } from "@/hooks/useFocusSelection";
import { useStore } from "@/stores/store";
import { defineComponent, ref, watch, type PropType } from "vue";

export default defineComponent(
  (props, { emit }) => {
    const store = useStore();
    const contentRef = ref<HTMLDivElement>();

    const handleClick = async () => {
      if (props.editing) return;
      emit("update:editing", true);
      await focusAndSelectAll(contentRef);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        contentRef.value?.blur();
        !store.globalEditing && emit("update:editing", false);
        emit("update:content", contentRef.value?.textContent?.trim());
        emit("update:update");
      }
      if (e.key === "Escape") {
        contentRef.value?.blur();
        contentRef.value && (contentRef.value.textContent = props.content);
        !store.globalEditing && emit("update:editing", false);
      }
    };

    const localContent = ref<string>(props.content);
    watch(
      () => contentRef.value,
      _ => contentRef.value && (contentRef.value.textContent = props.content),
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
          "empty:before:text-ctp-overlay0 wrap-break-word transition-all empty:before:content-[attr(placeholder)]",
          props.editing ? "rounded border p-1" : "cursor-pointer",
          props.editing && (localContent.value === props.content ? "border-ctp-surface0" : "border-ctp-peach"),
        ]}
        ref={contentRef}
        contenteditable={props.editing ? "plaintext-only" : false}
        onClick={handleClick}
        onKeydown={handleKeyDown}
        onInput={handleInput}
        placeholder={props.placeholder}
      />
    );
  },
  {
    props: {
      content: String as PropType<string>,
      editing: Boolean as PropType<boolean>,
      placeholder: String as PropType<string>,
    },
    emits: ["update:content", "update:editing", "update:update"],
  },
);
