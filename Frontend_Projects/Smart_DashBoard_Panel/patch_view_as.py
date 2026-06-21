import os
import re

files_to_patch = [
    "src/context/CustomerContext.jsx",
    "src/context/OrderContext.jsx",
    "src/context/VisitContext.jsx",
    "src/context/BeatContext.jsx",
    "src/context/BillingContext.jsx"
]

for file_path in files_to_patch:
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}")
        continue
        
    with open(file_path, "r") as f:
        content = f.read()
        
    # Remove the explicit query filter
    content = re.sub(
        r"(\s*// Strict Role-Based Frontend Firewall)?\s*if\s*\(viewAsUserId\)\s*\{\s*query\s*=\s*query\.eq\('owner_id',\s*viewAsUserId\);\s*\}",
        "",
        content
    )
    
    # Replace the frontend firewall logic
    replacement = """// Unified Role-Based Hierarchy Firewall
      if (viewAsUserId) {
        const allowedIds = users
            .filter(u => u.id === viewAsUserId || u.parent_id === viewAsUserId || (u.ancestor_ids && Array.isArray(u.ancestor_ids) && u.ancestor_ids.includes(viewAsUserId)))
            .map(u => u.id);
        filteredData = filteredData.filter(item => allowedIds.includes(item.owner_id));
      } else if (currentUser.role !== 'ADMIN') {"""
    
    # Fix indentation for the replacement
    def replacer(match):
        indent = match.group(1)
        return match.group(0).replace(
            match.group(2), 
            replacement.replace('\n', '\n' + indent)
        )
    
    content = re.sub(
        r"( *)((// Unified Role-Based Hierarchy Firewall)?\s*if\s*\(!viewAsUserId\s*&&\s*currentUser\.role\s*!==\s*'ADMIN'\)\s*\{)",
        replacer,
        content
    )
    
    with open(file_path, "w") as f:
        f.write(content)
        
    print(f"Patched {file_path}")
