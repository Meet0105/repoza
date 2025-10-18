# Requirements Document - StackBlitz Live Preview

## Introduction

The StackBlitz Live Preview feature enables users to instantly view and interact with any GitHub repository in a live, running environment directly within Repoza. This feature eliminates the need for users to clone repositories, install dependencies, or manually deploy projects. By integrating StackBlitz's WebContainers API, users can click a single button to see any supported project running in real-time, edit code on the fly, and understand how the project works before deciding to deploy or convert it.

This feature positions Repoza as a comprehensive code exploration platform, combining repository discovery, AI-powered Q&A, code conversion, deployment, and now live interactive previews all in one place.

## Requirements

### Requirement 1: One-Click Live Preview Access

**User Story:** As a developer exploring repositories on Repoza, I want to click a "Live Preview" button on any repository page, so that I can instantly see the project running without any manual setup.

#### Acceptance Criteria

1. WHEN a user views a repository detail page THEN the system SHALL display a "Live Preview" button prominently alongside other action buttons (Deploy, Convert Code, AI Q&A)
2. WHEN a user clicks the "Live Preview" button THEN the system SHALL open a modal with a loading state indicating preview preparation
3. WHEN the preview is being prepared THEN the system SHALL display progress indicators showing the current step (analyzing, fetching files, building, starting)
4. WHEN the preview is ready THEN the system SHALL display the running project in an embedded StackBlitz iframe within the modal
5. WHEN the preview fails to load THEN the system SHALL display clear error messages with troubleshooting suggestions

### Requirement 2: Automatic Framework Detection

**User Story:** As a user initiating a live preview, I want the system to automatically detect the project's framework and configuration, so that the preview runs correctly without requiring manual setup.

#### Acceptance Criteria

1. WHEN a preview is requested THEN the system SHALL analyze the repository's package.json file to identify the framework
2. WHEN package.json is present THEN the system SHALL detect frameworks including Next.js, React, Vue.js, Angular, Svelte, Node.js, Express, and vanilla JavaScript
3. WHEN the framework is detected THEN the system SHALL determine the appropriate build and start commands automatically
4. WHEN no package.json exists THEN the system SHALL check for HTML files and treat the project as a static website
5. WHEN the framework is unsupported THEN the system SHALL display a message listing supported frameworks and suggest alternatives

### Requirement 3: Repository File Fetching and Preparation

**User Story:** As a system preparing a live preview, I want to fetch all necessary files from the GitHub repository and format them for StackBlitz, so that the project can run in the browser environment.

#### Acceptance Criteria

1. WHEN fetching repository files THEN the system SHALL retrieve all source code files, configuration files, and package.json
2. WHEN fetching files THEN the system SHALL exclude unnecessary files including node_modules, .git, build artifacts, and large binary files
3. WHEN the repository is public THEN the system SHALL fetch files using the GitHub API without authentication
4. WHEN the repository is private AND the user is authenticated THEN the system SHALL use the user's GitHub access token to fetch files
5. WHEN files are fetched THEN the system SHALL format them into the StackBlitz project structure with proper file paths and content

### Requirement 4: StackBlitz Project Creation and Embedding

**User Story:** As a user waiting for a preview, I want the system to create a StackBlitz project and embed it seamlessly, so that I can interact with the running application immediately.

#### Acceptance Criteria

1. WHEN files are prepared THEN the system SHALL create a StackBlitz project using the StackBlitz SDK with the correct template for the detected framework
2. WHEN the StackBlitz project is created THEN the system SHALL embed the project in an iframe within the preview modal
3. WHEN the project is embedded THEN the system SHALL configure StackBlitz to show the preview pane by default
4. WHEN the project starts building THEN the system SHALL display build logs and progress in real-time
5. WHEN the project is running THEN the system SHALL allow users to interact with the live application including clicking, navigating, and testing functionality

### Requirement 5: Interactive Code Editing

**User Story:** As a user viewing a live preview, I want to edit the code and see changes reflected immediately, so that I can experiment with the project and understand how it works.

#### Acceptance Criteria

1. WHEN the preview is running THEN the system SHALL display the StackBlitz editor alongside the preview pane
2. WHEN a user edits code in the StackBlitz editor THEN the system SHALL automatically rebuild and refresh the preview
3. WHEN changes are made THEN the system SHALL preserve the changes during the current session
4. WHEN the modal is closed THEN the system SHALL not persist changes to the original repository
5. WHEN the user wants to save changes THEN the system SHALL provide an option to fork the project on StackBlitz

### Requirement 6: Error Handling and Logging

**User Story:** As a user experiencing a preview failure, I want to see clear error messages and build logs, so that I can understand what went wrong and potentially fix the issue.

#### Acceptance Criteria

1. WHEN a build error occurs THEN the system SHALL display the error message prominently in the preview modal
2. WHEN errors occur THEN the system SHALL show the full build logs with syntax highlighting
3. WHEN a framework is unsupported THEN the system SHALL display a list of supported frameworks and suggest the closest match
4. WHEN a repository is too large THEN the system SHALL display a warning about file size limits and suggest viewing on StackBlitz directly
5. WHEN network errors occur THEN the system SHALL provide retry options and troubleshooting steps

### Requirement 7: Preview Management and Cleanup

**User Story:** As a system administrator, I want to track active previews and manage resources efficiently, so that the platform remains performant and cost-effective.

#### Acceptance Criteria

1. WHEN a preview is created THEN the system SHALL log the preview creation in MongoDB with timestamp, repository, user, and framework
2. WHEN a preview modal is closed THEN the system SHALL mark the preview session as ended
3. WHEN previews are older than 30 minutes THEN the system SHALL automatically clean up preview records from the database
4. WHEN tracking previews THEN the system SHALL record metrics including success rate, load time, and framework distribution
5. WHEN viewing admin dashboard THEN the system SHALL display preview usage statistics and trends

### Requirement 8: Integration with Existing Features

**User Story:** As a user exploring a repository, I want the live preview feature to work seamlessly with other Repoza features, so that I can have a complete workflow from discovery to deployment.

#### Acceptance Criteria

1. WHEN viewing a live preview THEN the system SHALL provide quick access to Deploy, Convert Code, and AI Q&A features
2. WHEN a user likes the preview THEN the system SHALL offer a one-click option to deploy the repository to Vercel
3. WHEN using the Code Converter THEN the system SHALL offer to preview both the original and converted code
4. WHEN viewing search results THEN the system SHALL display a quick preview icon on repository cards for instant access
5. WHEN a preview is successful THEN the system SHALL suggest related actions like deploying or asking AI questions about the code

### Requirement 9: Performance and User Experience

**User Story:** As a user initiating a live preview, I want the preview to load quickly and provide smooth interactions, so that I can efficiently explore repositories.

#### Acceptance Criteria

1. WHEN a preview is requested THEN the system SHALL begin displaying progress within 2 seconds
2. WHEN fetching files THEN the system SHALL implement caching to speed up repeated previews of the same repository
3. WHEN the preview loads THEN the system SHALL provide a full-screen toggle option for better viewing
4. WHEN multiple previews are requested THEN the system SHALL handle concurrent requests without performance degradation
5. WHEN on mobile devices THEN the system SHALL adapt the preview modal layout for smaller screens

### Requirement 10: Security and Access Control

**User Story:** As a platform owner, I want to ensure that live previews are secure and respect repository access permissions, so that private code remains protected.

#### Acceptance Criteria

1. WHEN accessing private repositories THEN the system SHALL require user authentication via GitHub OAuth
2. WHEN fetching private repository files THEN the system SHALL use the authenticated user's access token
3. WHEN a user lacks repository access THEN the system SHALL display an appropriate error message
4. WHEN running code in StackBlitz THEN the system SHALL ensure code runs in a sandboxed browser environment
5. WHEN handling user tokens THEN the system SHALL never expose tokens in client-side code or logs
