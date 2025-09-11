// Test script to help with node selection
console.log('=== TESTING NODE SELECTION ===');

// Wait for Vue Flow to be ready
setTimeout(() => {
  // Find the Vue Flow canvas
  const canvas = document.querySelector('.vue-flow');
  console.log('Vue Flow canvas:', canvas);
  
  // Find all nodes
  const nodes = document.querySelectorAll('.vue-flow__node');
  console.log('Found nodes:', nodes.length);
  
  nodes.forEach((node, i) => {
    const id = node.dataset.id;
    const type = node.classList.contains('selected') ? 'SELECTED' : 'unselected';
    console.log(`Node ${i}: ID=${id}, Type=${type}, Classes=${node.className}`);
    
    // Add click listener to log when nodes are clicked
    node.addEventListener('click', () => {
      console.log(`CLICKED Node: ID=${id}`);
      // Check if selection border appears
      setTimeout(() => {
        const isSelected = node.classList.contains('selected');
        console.log(`Node ${id} selected: ${isSelected}`);
        if (isSelected && id.includes('decision')) {
          console.log('DECISION NODE SELECTED - Check for selection border!');
        }
      }, 100);
    });
  });
  
  // Specifically find decision node
  const decisionNode = Array.from(nodes).find(node => node.dataset.id && node.dataset.id.includes('decision'));
  if (decisionNode) {
    console.log('FOUND DECISION NODE:', decisionNode.dataset.id);
    console.log('Decision node classes:', decisionNode.className);
    
    // Create a function to select it manually
    window.selectDecisionNode = () => {
      console.log('MANUALLY SELECTING DECISION NODE');
      decisionNode.click();
      return decisionNode;
    };
    
    console.log('Run selectDecisionNode() to test selection border');
  }
  
}, 1000);