
#!/bin/bash

# Backup the original README if it exists
if [ -f "README.md" ]; then
  cp README.md README.lovable.md
fi

# Replace with GitHub specific README
cp README.github.md README.md

echo "Prepared files for GitHub deployment"
