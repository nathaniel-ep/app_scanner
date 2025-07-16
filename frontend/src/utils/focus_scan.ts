export function focusScannerInput() {
  const input = document.getElementById("for_scan");
  if (input) {
    input.focus();
    input.blur();
  }
}
