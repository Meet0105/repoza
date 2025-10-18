# Implementation Plan - StackBlitz Live Preview

- [ ] 1. Install dependencies and setup StackBlitz SDK
  - Install @stackblitz/sdk package via npm
  - Add StackBlitz types to TypeScript configuration
  - Verify SDK installation and imports work correctly
  - _Requirements: 1.1, 4.1_

- [ ] 2. Create Framework Detector backend service
  - [ ] 2.1 Implement framework detection logic in backend/frameworkDetector.ts
    - Create detectFramework function that analyzes package.json
    - Implement detection for Next.js, React, Vue, Angular, Svelte, Node.js, and static HTML
    - Add confidence scoring based on detection method
    - Return framework info including template, commands, and support status
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 2.2 Define supported frameworks configuration
    - Create SUPPORTED_FRAMEWORKS constant with all framework templates
    - Define install, build, start, and dev commands for each framework
    - Map framework names to StackBlitz template IDs
    - _Requirements: 2.2, 2.3_

- [ ] 3. Create StackBlitz Fetcher backend service
  - [ ] 3.1 Implement repository file fetching in backend/stackblitzFetcher.ts
    - Create fetchRepoForStackBlitz function to get files from GitHub API
    - Implement file filtering logic to exclude node_modules, .git, build artifacts
    - Add file type inclusion rules for code files only
    - Limit to 50 files and 10MB total size
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  
  - [ ] 3.2 Add support for private repository access
    - Accept optional GitHub access token parameter
    - Use authenticated requests when token is provided
    - Handle authentication errors gracefully
    - _Requirements: 3.4, 10.1, 10.2, 10.3_
  
  - [ ] 3.3 Implement parallel file content fetching
    - Fetch file contents in batches of 10 for performance
    - Format files into StackBlitz-compatible structure
    - Return file map with paths as keys and content as values
    - _Requirements: 3.5, 9.2_

- [ ] 4. Create StackBlitz Project Generator backend service
  - [ ] 4.1 Implement project configuration generator in backend/stackblitzGenerator.ts
    - Create generateStackBlitzProject function
    - Build StackBlitz project object with title, description, template, and files
    - Extract dependencies from package.json
    - Configure project settings for auto-compilation and HMR
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 5. Create API endpoint for StackBlitz project creation
  - [ ] 5.1 Implement POST /api/stackblitz/create-project endpoint
    - Accept owner, repo, and optional branch parameters
    - Validate request parameters
    - Check user authentication for private repos
    - Call Framework Detector to analyze repository
    - _Requirements: 1.1, 2.1, 10.1_
  
  - [ ] 5.2 Integrate file fetching and project generation
    - Call StackBlitz Fetcher to get repository files
    - Handle unsupported frameworks with clear error messages
    - Call Project Generator to create StackBlitz configuration
    - Return project ID and embed URL to frontend
    - _Requirements: 2.5, 3.1, 4.1, 6.1_
  
  - [ ] 5.3 Add preview tracking to MongoDB
    - Create preview record in stackblitz_previews collection
    - Log creation timestamp, repo info, framework, and user ID
    - Track success/error status and load time
    - _Requirements: 7.1, 7.4_

- [ ] 6. Create LivePreviewButton component
  - [ ] 6.1 Implement button component in components/LivePreviewButton.tsx
    - Create component with owner and repo props
    - Add gradient button styling (green-to-blue)
    - Implement loading state with spinner
    - Add disabled state during preview creation
    - _Requirements: 1.1, 1.2_
  
  - [ ] 6.2 Add click handler to trigger preview creation
    - Call /api/stackblitz/create-project on button click
    - Handle loading states and errors
    - Emit events for preview start, ready, and error
    - Show authentication prompt for private repos
    - _Requirements: 1.2, 1.3, 10.1_

- [ ] 7. Create LivePreviewModal component
  - [ ] 7.1 Implement modal component in components/LivePreviewModal.tsx
    - Create full-screen modal with backdrop
    - Add close button and keyboard escape handler
    - Implement modal state management (idle, analyzing, fetching, building, ready, error)
    - Add progress tracking with percentage and messages
    - _Requirements: 1.2, 1.3, 1.4, 9.3_
  
  - [ ] 7.2 Integrate StackBlitz SDK for iframe embedding
    - Import StackBlitz SDK
    - Call sdk.embedProject with project configuration
    - Configure iframe to show preview pane by default
    - Handle StackBlitz loading and ready events
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [ ] 7.3 Add progress indicators and status messages
    - Display step-by-step progress (analyzing, fetching, building)
    - Show progress bar with percentage
    - Update messages based on current status
    - Display estimated time remaining
    - _Requirements: 1.3, 1.4_
  
  - [ ] 7.4 Implement error display and retry functionality
    - Show error messages with clear explanations
    - Display build logs when build fails
    - Add retry button for recoverable errors
    - Show troubleshooting suggestions
    - _Requirements: 1.5, 6.1, 6.2, 6.3_
  
  - [ ] 7.5 Add quick action buttons
    - Add "Deploy to Vercel" button in modal
    - Add "Convert Code" button for quick access
    - Add "Full Screen" toggle button
    - Add "Open in StackBlitz" external link
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 8. Create PreviewLogsPanel component
  - [ ] 8.1 Implement logs panel in components/PreviewLogsPanel.tsx
    - Create collapsible panel for displaying logs
    - Add syntax highlighting for log messages
    - Implement auto-scroll to latest log entry
    - Add copy logs to clipboard functionality
    - _Requirements: 6.2, 6.3_
  
  - [ ] 8.2 Add log filtering and categorization
    - Filter logs by type (error, warning, info)
    - Highlight error messages in red
    - Show warning messages in yellow
    - Display info messages in gray
    - _Requirements: 6.2_

- [ ] 9. Integrate Live Preview into Repository Detail Page
  - [ ] 9.1 Add LivePreviewButton to repo detail page
    - Import LivePreviewButton component in pages/repo/[owner]/[repo].tsx
    - Place button next to "Deploy to Vercel" and "Convert Code" buttons
    - Pass owner and repo props from router query
    - Add consistent styling with existing buttons
    - _Requirements: 1.1, 8.1_
  
  - [ ] 9.2 Add state management for preview modal
    - Create state for showing/hiding preview modal
    - Handle preview button click to open modal
    - Pass close handler to modal component
    - _Requirements: 1.2, 1.4_
  
  - [ ] 9.3 Render LivePreviewModal conditionally
    - Show modal when preview is triggered
    - Pass owner, repo, and branch to modal
    - Handle modal close and cleanup
    - _Requirements: 1.4, 4.2_

- [ ] 10. Implement error handling for all scenarios
  - [ ] 10.1 Add unsupported framework error handling
    - Detect when framework is not supported
    - Display list of supported frameworks
    - Suggest closest matching framework
    - Provide "Open on StackBlitz" fallback link
    - _Requirements: 2.5, 6.1_
  
  - [ ] 10.2 Add repository size limit error handling
    - Check file count and total size before processing
    - Display clear error when limits exceeded
    - Show current repo stats vs limits
    - Suggest alternatives (view on GitHub, select specific files)
    - _Requirements: 6.2_
  
  - [ ] 10.3 Add build error handling
    - Capture build errors from StackBlitz
    - Display error messages with line numbers
    - Show full build logs in expandable panel
    - Suggest common fixes based on error type
    - _Requirements: 6.3_
  
  - [ ] 10.4 Add authentication error handling
    - Detect private repository access errors
    - Prompt user to sign in with GitHub
    - Request necessary OAuth permissions
    - Retry preview creation with access token
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 10.5 Add network error handling
    - Handle GitHub API failures gracefully
    - Show retry button for network errors
    - Display helpful error messages
    - Log errors for monitoring
    - _Requirements: 6.2_

- [ ] 11. Add preview tracking and analytics
  - [ ] 11.1 Create MongoDB schema for preview tracking
    - Define stackblitz_previews collection schema
    - Add indexes for projectId, repoId, createdAt, userId
    - Implement preview record creation on successful preview
    - Track status, load time, files count, and framework
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [ ] 11.2 Implement preview cleanup job
    - Create POST /api/stackblitz/cleanup-previews endpoint
    - Delete preview records older than 30 minutes
    - Update closed previews with closedAt timestamp
    - _Requirements: 7.3_
  
  - [ ] 11.3 Add preview metrics to admin dashboard
    - Display total previews created (today/week/month)
    - Show framework distribution chart
    - Display success rate percentage
    - Show average load time graph
    - List most previewed repositories
    - _Requirements: 7.4, 7.5_

- [ ] 12. Implement performance optimizations
  - [ ] 12.1 Add caching for framework detection
    - Cache framework detection results in memory or Redis
    - Use cache key format: "framework:{owner}/{repo}:{branch}"
    - Set cache expiration to 1 hour
    - Implement cache invalidation on force refresh
    - _Requirements: 9.1, 9.2_
  
  - [ ] 12.2 Add caching for repository files
    - Cache file contents for popular repositories
    - Use cache key format: "files:{owner}/{repo}:{branch}"
    - Set cache expiration to 30 minutes
    - Limit cache to repositories with high preview frequency
    - _Requirements: 9.2_
  
  - [ ] 12.3 Optimize file fetching with parallel requests
    - Fetch files in batches of 10 concurrently
    - Implement request queuing to avoid rate limits
    - Add progress tracking for file fetching
    - _Requirements: 9.2, 9.4_

- [ ] 13. Add integration with existing features
  - [ ] 13.1 Integrate with Code Converter
    - Add "Preview Original" button in Code Converter modal
    - Add "Preview Converted" button after conversion
    - Enable side-by-side preview comparison
    - _Requirements: 8.2, 8.3_
  
  - [ ] 13.2 Integrate with Deployment feature
    - Add "Deploy This Preview" button in preview modal
    - Pre-fill deployment form with preview data
    - Enable seamless preview-to-deploy flow
    - _Requirements: 8.1, 8.4_
  
  - [ ] 13.3 Add quick preview to search results
    - Add eye icon (👁️) to repository cards on search page
    - Show preview button on card hover
    - Open preview modal without navigation
    - _Requirements: 8.4_

- [ ] 14. Create comprehensive documentation
  - [ ] 14.1 Create user guide for Live Preview feature
    - Document how to use Live Preview button
    - Explain supported frameworks and limitations
    - Provide troubleshooting tips for common errors
    - Add screenshots and examples
    - _Requirements: 1.1, 2.5, 6.1_
  
  - [ ] 14.2 Create developer documentation
    - Document StackBlitz SDK integration
    - Explain framework detection logic
    - Document API endpoints and request/response formats
    - Provide code examples for extending functionality
    - _Requirements: 2.1, 4.1_

- [ ] 15. Test the complete Live Preview feature
  - [ ] 15.1 Test with various framework types
    - Test Next.js repository preview
    - Test React + Vite repository preview
    - Test Vue.js repository preview
    - Test Node.js/Express repository preview
    - Test static HTML repository preview
    - _Requirements: 2.2, 2.3, 4.1_
  
  - [ ] 15.2 Test error scenarios
    - Test unsupported framework handling
    - Test repository size limit enforcement
    - Test private repository authentication
    - Test network error handling
    - Test build failure scenarios
    - _Requirements: 6.1, 6.2, 6.3, 10.1, 10.2_
  
  - [ ] 15.3 Test performance and load times
    - Measure preview creation time for typical repos
    - Test concurrent preview requests
    - Verify caching improves performance
    - Test on different network speeds
    - _Requirements: 9.1, 9.2, 9.4_
  
  - [ ] 15.4 Test integration with existing features
    - Test Deploy button in preview modal
    - Test Convert Code button in preview modal
    - Test quick preview from search results
    - Test preview-to-deploy flow
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
