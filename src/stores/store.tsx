import type { BoardData, Theme } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useStore = defineStore("store", () => {
  const theme = ref<Theme>("mocha");
  const themeClass = ref<Theme>("mocha");
  const openedBoardId = ref<string>("");
  const board = ref<BoardData | null>();
  const updatedCols = ref<Set<number>>();
  const globalEditing = ref<boolean>(false);

  return {
    theme,
    themeClass,
    openedBoardId,
    board,
    updatedCols,
    globalEditing,
  };
});
