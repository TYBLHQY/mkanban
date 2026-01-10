import Board from "@/components/Board";
import { defineComponent } from "vue";

export default defineComponent(() => {
  return () => (
    <div class="scroll relative h-full w-full">
      <Board />
    </div>
  );
});
