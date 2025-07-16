export function focusScannerInput() {
  const input = document.getElementById("for_scan");
  if (input) {
    console.log("element trouve")
    input.focus();
  } else {
    console.log("element non trouver")
  }
}
