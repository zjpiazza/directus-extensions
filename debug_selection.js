// Debug the selected decision node structure
const selectedNode = document.querySelector('.vue-flow__node.selected');
if (selectedNode) {
  console.log('=== SELECTED NODE STRUCTURE ===');
  console.log('Selected node:', selectedNode);
  console.log('Selected node HTML:', selectedNode.outerHTML);
  
  // Check for decision-node class
  const decisionNodeEl = selectedNode.querySelector('.decision-node');
  console.log('Decision node element:', decisionNodeEl);
  
  // Check for diamond-shape
  const diamondEl = selectedNode.querySelector('.diamond-shape');
  console.log('Diamond shape element:', diamondEl);
  
  // Check computed styles
  if (diamondEl) {
    const afterStyles = window.getComputedStyle(diamondEl, '::after');
    console.log('Diamond ::after styles:', {
      content: afterStyles.content,
      position: afterStyles.position,
      border: afterStyles.border,
      clipPath: afterStyles.clipPath
    });
  }
}
