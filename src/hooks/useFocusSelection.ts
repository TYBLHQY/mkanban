import { nextTick, type Ref } from "vue";

export async function focusAndSelectAll(contentRef: Ref<HTMLDivElement | undefined>) {
  await nextTick();
  contentRef.value?.focus();
  const range = document.createRange();
  range.selectNodeContents(contentRef.value!);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export async function focusAndMoveToEnd(contentRef: Ref<HTMLDivElement | undefined>) {
  await nextTick();
  contentRef.value?.focus();
  const selection = window.getSelection();
  if (selection) {
    const range = document.createRange();
    range.selectNodeContents(contentRef.value!);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function clearEmptyContent(contentRef: Ref<HTMLDivElement | undefined>) {
  if (contentRef.value?.innerHTML !== "<br>" && contentRef.value?.innerHTML !== "") return;
  contentRef.value.innerHTML = "";
}
