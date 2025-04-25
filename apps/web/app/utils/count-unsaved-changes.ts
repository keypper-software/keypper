export const countUnsavedChanges = () => {
  console.log("---------");

  // Find the secrets-list container
  const secretsList = document.querySelector(".secrets-list");
  if (!secretsList) return 0;

  // Count unique secret-list-items that contain at least one yellow-bordered element
  const secretListItems = document.querySelectorAll(".secrets-list-item");
  let count = 0;

  secretListItems.forEach((item) => {
    // Only count if the item has a yellow border (indicating a change)
    const hasYellowBorder = item.querySelector(".border-yellow-500");

    if (hasYellowBorder) {
      count++;
    }
  });
  return count;
};
