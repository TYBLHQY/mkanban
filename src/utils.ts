export function verticallyScrollable(el: HTMLElement) {
  const style = getComputedStyle(el);
  return (style.overflowY === "auto" || style.overflowY === "scroll") && el.scrollHeight - el.clientHeight > 1;
}
