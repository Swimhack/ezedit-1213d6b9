
#!/bin/bash

# Define variables
REPO_URL="https://github.com/Swimhack/ezedit-1213d6b9.git"
BRANCH="main"

# Set Git user information (use placeholder values)
git config --global user.name "Lovable Deployment"
git config --global user.email "deploy@lovable.dev"

# Check if .git directory exists
if [ ! -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
  git remote add origin $REPO_URL
else
  echo "Git repository already exists, checking remote..."
  # Check if the remote is already set correctly
  CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
  
  if [ "$CURRENT_REMOTE" != "$REPO_URL" ]; then
    echo "Updating remote URL..."
    git remote set-url origin $REPO_URL 2>/dev/null || git remote add origin $REPO_URL
  fi
fi

# Add all files
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Deployment from Lovable $(date)"

# Push to GitHub
echo "Pushing to GitHub repository: $REPO_URL branch: $BRANCH"
git push -u origin $BRANCH --force

echo "Deployment complete!"
