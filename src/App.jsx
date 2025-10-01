import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import './index.css';
import 'katex/dist/katex.min.css' // Import KaTeX CSS for formulas

const defaultText = `
# The Gemini Render OCCO Project: A Comprehensive Development Timeline

This document meticulously details the development and deployment journey of the Gemini Render OCCO application, covering challenges faced, solutions implemented, and key pivots across **33 distinct iterations**.

## Phase 1: Initial TrueNAS SCALE Deployment Attempts (Iterations 1-7)

The project began with the ambitious goal of deploying a JavaScript website on a **TrueNAS SCALE** server, accessible via Tailscale.

### Iteration 1: Initial TrueNAS CORE / SCALE Confusion
*   **Prompt:** How to run a JavaScript website on TrueNAS, accessible via Tailscale?
*   **Initial Advice:** Based on "TrueNAS," assumed **TrueNAS CORE** (FreeBSD Jails). Detailed steps provided for Jails (create, install Node/NPM, build the website, and configure Nginx/PM2, Tailscale subnet router).
*   **Correction:** User clarified they are on **TrueNAS SCALE** (Debian Linux, Docker/k3s).
*   **New Plan:** Shifted to Docker deployment on TrueNAS SCALE (Launch Docker Image, Nginx container, volumes, Tailscale).
*   **Outcome:** Initial plan established, but immediate UI/access issues.

### Iteration 2: TrueNAS SMB Access & First Deployment Attempt
*   **Problem:** User could not see/access TrueNAS SMB shares from PC to copy project files.
*   **Troubleshooting:** Verified SMB service status, share configuration, and dataset permissions in TrueNAS UI.
*   **Solution:** Ensured SMB service was running, configured SMB share on \`GEminiRenderOCCo\` dataset, and initially set broad permissions (guest access, "Open" preset ACLs).
*   **Outcome:** SMB access from PC achieved. Proceeded with Docker deployment via "Install Custom App" (correct UI term). Attempted Nginx container deployment.

### Iteration 3: Nginx Container "403 Forbidden" & ACL Editor Bug
*   **Problem:** Nginx container deployed but returned "403 Forbidden" in browser. Nginx logs showed "Permission denied" for \`index.html\`. TrueNAS UI ACL Editor failed with \`AttributeError: EVERYONE\` when trying to set ACLs to "Open" recursively. Attempts to \`chown\`/\`chmod\` via shell as \`truenas_admin\` user resulted in \`Operation not permitted\`.
*   **Troubleshooting:** Identified need to use \`sudo su\` to become \`root\` in the shell for filesystem operations. Discovered persistent typos in dataset path (\`GEMiminiRenderOCCo\` vs \`GEminiRenderOCCo\`).
*   **Solution Attempt:** Used \`sudo su\` in shell and corrected path. \`zfs get readonly\` confirmed dataset was \`readonly off\`. Still, \`chmod\` as \`root\` failed with \`Operation not permitted\`, suggesting deeper ZFS protection.
*   **Outcome:** Persistent \`chmod\` failure, indicating a severe underlying problem with direct dataset access.

### Iteration 4: Degraded ZFS Pool Discovery & \`ixVolume\` Workaround
*   **Problem:** \`chmod\` failures even as \`root\` on a \`readonly=off\` dataset (as seen in \`zfs get\` output).
*   **Root Cause:** User revealed the TrueNAS SCALE ZFS pool was **degraded**. ZFS prevents writes/metadata changes on degraded pools as a safety measure.
*   **Solution Pivot:** Abandoned direct Host Path mounts to the problematic \`GEminiRenderOCCo\` dataset for app data. Instead, decided to use TrueNAS SCALE's managed **\`ixVolume\`** for web files (as it handles permissions internally). \`default.conf\` was mounted from a *newly created, temporary* host path dataset. Also introduced **Nginx Proxy Manager (NPM)** as a more user-friendly deployment option.
*   **Outcome:** NPM app installed, but immediately got stuck in a "Starting" state.

### Iteration 5: Nginx Proxy Manager (NPM) Startup Issues
*   **Problem:** NPM app stuck in "Starting." \`kubectl\` command not found in shell.
*   **Troubleshooting:** Corrected \`kubectl\` executable path to \`/usr/local/bin/k3s kubectl\`. Attempted to get NPM pod logs via \`kubectl logs --previous\` and \`kubectl describe pod\` to diagnose startup failure.
*   **Outcome:** Continued issues with NPM's \`ixVolume\` setup and \`kubectl\` access, making NPM deployment too complex and unreliable given the underlying degraded pool.

### Iteration 6: Strategic Pivot to GitHub Pages
*   **Problem:** Persistent, complex deployment issues on TrueNAS SCALE due to the degraded pool, \`ixVolume\` intricacies, and \`kubectl\` debugging overhead.
*   **Solution:** Made a strategic decision to **completely abandon TrueNAS SCALE deployment** for this project. Opted for **GitHub Pages** as a free, robust, and simpler hosting solution for static JavaScript sites.
*   **Outcome:** Initiated GitHub Pages setup, pushed initial project code to \`main\` branch.

### Iteration 7: First GitHub Pages Roadblock - Blank Page (Local & Remote)
*   **Problem:** Website deployed to GitHub Pages (and opened locally via \`file:///\`) showed a blank page. Console errors showed 404s for \`/assets/...\` and \`/vite.svg\`.
*   **Root Cause:** Absolute paths in \`index.html\` (e.g., \`href="/vite.svg"\`) were incorrect for GitHub Pages, which hosts project sites in a sub-path (\`/YOUR_REPO_NAME/\`). The browser was looking at the domain root instead of the repository sub-path.
*   **Solution:** Configured \`base: '/gemini-redner-occo/'\` in \`vite.config.js\` to instruct Vite to prefix all asset paths with the repository name during the build.
*   **Outcome:** Confirmed \`base\` path was the fix for the path issue, but \`npm run preview\` was now broken locally.

## Phase 2: GitHub Pages Deployment Perfection & Feature Implementation (Iterations 8-25)

The focus shifted to fine-tuning the GitHub Pages workflow and adding specific user features.

### Iteration 8: \`base\` Path Breaks Local Preview
*   **Problem:** Setting \`base: '/gemini-redner-occo/'\` unconditionally in \`vite.config.js\` caused \`npm run dev\` and \`npm run preview\` to break locally (blank page, 404s).
*   **Solution:** Implemented **conditional \`base\` path** in \`vite.config.js\` using \`process.env.NODE_ENV === 'production' && process.env.VITE_APP_GH_PAGES\` to ensure \`base: '/' \`for local builds and \`base: '/repo-name/'\` only for GitHub Pages builds.
*   **Outcome:** \`npm run preview\` still had issues due to lack of \`predeploy\` script.

### Iteration 9: Windows \`cross-env\` for \`predeploy\` Script
*   **Problem:** \`npm run deploy\` failed on Windows with \`'VITE_APP_GH_PAGES' is not recognized\` error.
*   **Root Cause:** Environment variable syntax (\`VARIABLE=value command\`) is specific to Linux/macOS shells, not Windows Command Prompt/PowerShell.
*   **Solution:** Installed \`cross-env\` (\`npm install cross-env --save-dev\`) and updated \`predeploy\` script in \`package.json\` to \`cross-env VITE_APP_GH_PAGES=true npm run build\`.
*   **Outcome:** \`predeploy\` now worked correctly on Windows, allowing conditional builds.

### Iteration 10: Git Remote Consistency & Initial Push
*   **Problem:** \`git push\` failed with \`Repository not found.\` (due to typo in repo URL when adding remote) and \`Updates were rejected\` (due to un-synced local/remote \`main\` branches).
*   **Troubleshooting:** Identified precise GitHub repo name: \`gemini-redner-occo\`. Used \`git remote rm origin\` and \`git remote add origin\` with the correct URL. Resolved \`Updates were rejected\` using \`git fetch origin main\` followed by \`git reset --hard origin/main\` to force local \`main\` to match remote.
*   **Solution:** Local \`main\` branch cleaned, synced, and pushed successfully to GitHub.
*   **Outcome:** Source code successfully pushed to \`main\` branch.

### Iteration 11: Missing \`index.html\` (Build Failure)
*   **Problem:** \`npm run deploy\` failed, and \`vite build\` reported \`Could not resolve entry module "index.html"\`.
*   **Root Cause:** The \`index.html\` file was genuinely missing from the project root.
*   **Solution:** Manually re-created a standard \`index.html\` file in the project root with the correct \`<div id="root"></div>\` and \`<script type="module" src="/src/main.jsx"></script>\`.
*   **Outcome:** \`vite build\` now succeeded, and \`npm run preview\` started working correctly locally.

### Iteration 12: \`ENAMETOOLONG\` for \`gh-pages\` (Deployment Failure)
*   **Problem:** \`npm run deploy\` failed with \`Error: spawn ENAMETOOLONG\` on Windows.
*   **Root Cause:** \`gh-pages\` was trying to stage/commit too many files, specifically \`node_modules\` and/or \`dist\` (which were accidentally committed in earlier Git errors). Windows command line has length limits.
*   **Solution:** Ensured \`.gitignore\` explicitly included \`/node_modules\` and \`/dist\`. Used \`git rm -r --cached node_modules\` and \`git rm -r --cached dist\` to force Git to stop tracking these folders. Manually deleted \`node_modules\` and re-ran \`npm install\` for a clean \`gh-pages\` cache.
*   **Outcome:** \`npm run deploy\` successfully executed \`Published\`. Website was pushed to the \`gh-pages\` branch on GitHub.

### Iteration 13: Feature - Auto-Select Textarea
*   **Goal:** Clicking the source text area should automatically select all its text.
*   **Solution:** Added \`markdownInputRef = useRef(null)\` to \`App.jsx\`, attached \`ref={markdownInputRef}\` to the \`<textarea>\`, and implemented \`onClick={handleInputClick}\` which calls \`markdownInputRef.current.select()\`. Added \`e.stopPropagation()\` to \`handleInputClick\` to prevent accidental global toggles.
*   **Outcome:** Auto-select feature implemented.

### Iteration 14: Feature - Custom HR Width
*   **Goal:** Adjust the width of horizontal rule (\`<hr>\`) separators.
*   **Solution:** Modified \`.output-panel hr\` in \`index.css\`, setting \`width: 80%;\` and \`margin: 40px auto;\` to center the line.
*   **Outcome:** HR width adjusted and centered.

### Iteration 15: Feature - Responsive Layout (Initial Fixes)
*   **Goal:** Ensure website is usable on mobile devices, preventing source panel from compressing into a tall column.
*   **Solution:** Implemented **CSS Media Queries** (\`@media (min-width: 768px)\`) for a mobile-first approach. Default mobile: output only, input hidden, toggle button to show/hide input full-screen. Desktop: two-column split, toggle button collapses/expands input. Removed \`break-after\` and \`break-before\` from markdown elements for natural column flow.
*   **Outcome:** Mobile view worked flawlessly, but desktop layout broke (columns not filling space).

### Iteration 16: Desktop Layout Refinement & Column Spacing
*   **Problem:** Desktop view was broken (panels not filling available width, odd column spacing).
*   **Solution:** Refined desktop CSS Grid in \`index.css\` to ensure \`app-container\` and panels explicitly took \`100%\` width. Changed \`text-align: justify;\` to \`text-align: left;\` for \`.content-wrapper\` to ensure columns fill space more naturally without large word gaps.
*   **Outcome:** Desktop layout fixed, columns now occupy the entire screen width correctly. Mobile view remained flawless.

### Iteration 17: Feature - Persistent Toggle State (Momentary Toggle Fix)
*   **Problem:** On desktop, clicking the "Hide/Show Source" button resulted in a momentary toggle (it would switch, then immediately revert).
*   **Root Cause:** The \`useEffect\` listening for \`window.resize\` was unconditionally resetting \`isSourceVisible\` on every resize event (even minor ones), overriding user interaction.
*   **Solution:** Modified \`handleWindowResize\` in \`App.jsx\` to only \`setSourceVisible\` when the device type (desktop/mobile threshold) *actually changed*. Used a \`currentDeviceTypeRef\` to track the previous device type. Also, carefully revised dependencies for the resizer and window resize \`useEffect\`s.
*   **Outcome:** Toggle behavior became persistent and correctly reacted to user input on desktop.

### Iteration 18: Feature - Gesture-Based Toggle (Right-Click / Two-Finger Tap)
*   **Goal:** Toggle view with Right-Click on Desktop and Two-Finger Tap on Mobile.
*   **Solution:**
    *   **Desktop:** Added \`onContextMenu\` handler to \`app-container\` (later discovered to be problematic).
    *   **Mobile:** Added \`onTouchStart\` and \`onTouchEnd\` handlers to \`app-container\` to detect two-finger taps (tracking \`e.touches.length\`, duration, and ensuring not on textarea/button).
*   **Outcome:** Initial gesture detection implemented.

### Iteration 19: \`ReferenceError\` & Gesture Troubleshooting
*   **Problem:** \`ReferenceError: handleGlobalToggle is not defined\` in console. Right-click toggle was unreliable/momentary.
*   **Root Cause:** Removed the \`handleGlobalToggle\` function definition in \`App.jsx\` but left \`onContextMenu={handleGlobalToggle}\` prop in the JSX.
*   **Solution:** Removed the invalid \`onContextMenu={handleGlobalToggle}\` prop from the \`div\`.
*   **Outcome:** \`ReferenceError\` fixed. Right-click functionality still needed refinement.

### Iteration 20: Feature - Desktop Toggle: \`Ctrl+S\` (Replacing Right-Click)
*   **Goal:** Replace unreliable Right-Click toggle with \`Ctrl+S\` keyboard shortcut on desktop.
*   **Solution:** Removed \`onContextMenu\` completely. Added a \`keydown\` event listener to \`window\` in a \`useEffect\` that detects \`e.ctrlKey && e.key === 's'\`, \`preventDefault()\`, \`stopPropagation()\`, and toggles \`isSourceVisible\`. Included logic to prevent toggling if typing in the textarea.
*   **Outcome:** Desktop toggle now uses \`Ctrl+S\` reliably.

### Iteration 21: Final Toggle Persistence Fix
*   **Problem:** After \`Ctrl+S\` implementation, the toggle still exhibited momentary behavior (switching briefly, then reverting).
*   **Root Cause:** The \`handleWindowResize\` \`useEffect\` was still subtly overriding \`isSourceVisible\` by reactively setting it based on \`isSourceVisible\` as a dependency.
*   **Solution:** Refined the dependencies of the \`handleWindowResize\` \`useEffect\` to ensure it only sets the *initial* state correctly and then avoids interfering with subsequent user-triggered \`isSourceVisible\` changes, allowing user interaction to persist.
*   **Outcome:** All toggle mechanisms (Ctrl+S, Two-Finger Tap, \`+/-\` button) now work perfectly and persistently across desktop and mobile.

### Iteration 22: KaTeX Formula Formatting Error
*   **Problem:** Long LaTeX formula in \`defaultText\` showed red rendering errors in output.
*   **Root Cause:** Invalid KaTeX syntax (e.g., using raw text directly within \`\\frac{}\` or other math environments without proper \`\\text{}\` escapes for all non-math parts) caused parsing failure.
*   **Solution:** Corrected the problematic KaTeX formula in \`defaultText\` to be syntactically valid (e.g., simplified it to \`+ \\frac{A}{B}\`).
*   **Outcome:** KaTeX formulas now render correctly.

### Iteration 23: Feature - Dynamic Column Overflow Handling (LaTeX)
*   **Goal:** Ensure long LaTeX formulae don't break column layout but allow horizontal scrolling.
*   **Solution:** Removed \`overflow-x: hidden;\` from desktop panel CSS and changed the base \`.panel\` to \`overflow: auto;\` (allowing both horizontal and vertical scrolling) in \`src/index.css\`.
*   **Outcome:** Long LaTeX formulas now correctly trigger horizontal scrollbars within columns instead of breaking the layout.

### Iteration 24: \`git push\` \`node_modules\` Cleanup
*   **Problem:** Git commit/push operations involved \`node_modules\`, leading to large repository size and \`ENAMETOOLONG\` errors for \`gh-pages\`.
*   **Solution:** Ensured \`.gitignore\` correctly excluded \`/node_modules\` and \`/dist\`. Used \`git rm -r --cached node_modules\` and \`git rm -r --cached dist\` to remove them from Git's tracking history.
*   **Outcome:** Git repository now lean, only tracking source files.

### Iteration 25: All Features Fully Functional & Final Deployment
*   **Final Check:** All features (Ctrl+S toggle, Two-Finger Tap toggle, \`+/-\` button, auto-select, responsive layout, dynamic columns, KaTeX rendering, horizontal scrolling for overflow) were confirmed to work perfectly locally.
*   **Deployment:** Performed final \`npm run deploy\` and configured GitHub Pages.
*   **Outcome:** The Gemini Render OCCO website is fully functional and deployed, offering a robust and intuitive user experience.

## Phase 3: Perfecting User Interaction & Scrolling (Iterations 26-33)

This final phase focused on refining the user experience, particularly the arrow key navigation, to create a robust and polished feel.

### Iteration 26: Feature - Initial Arrow Key Column Scrolling
*   **Goal:** Allow users to scroll through columns using Left/Right arrow keys.
*   **Initial Solution:** Added a \`keydown\` listener that used \`outputPanel.scrollBy({ left: outputPanel.clientWidth })\`.
*   **Problem:** This scrolled by the entire visible panel width, not a single column width, causing it to skip columns and feel inexact.

### Iteration 27: Precise Column-Width Scrolling
*   **Problem:** Scrolling was still misaligned, especially by the end of the document.
*   **Root Cause:** The calculation of a single column's width was flawed because it failed to subtract the panel's own internal padding (\`padding: 30px 40px\`).
*   **Solution:** Used \`getComputedStyle\` to get \`paddingLeft\` and \`paddingRight\`, subtracting them from \`clientWidth\` before calculating the column width.
*   **Outcome:** The scroll amount for a single column was now pixel-perfect, but a new issue emerged.

### Iteration 28: Rapid Press Animation Bug
*   **Problem:** Rapidly pressing an arrow key would break the scroll position, causing it to misalign in the middle of a column.
*   **Root Cause:** New \`scrollBy\` commands were being fired before the previous \`smooth\` scroll animation had finished, creating a race condition.
*   **Solution Pivot:** Re-architected the feature to use a state-driven system with pre-calculated "snap points" and an absolute \`scrollTo\` command, eliminating reliance on the element's current (and possibly mid-animation) scroll position.

### Iteration 29: Snap Point Calculation & Double-Scroll Bug
*   **Problem:** The scroll was now completely broken or scrolling by two columns at once.
*   **Root Cause 1 (Layout):** The snap points were being calculated in a \`useEffect\` that ran *before* the browser had rendered the Markdown and determined the final \`scrollWidth\`, resulting in an incorrect array of snap points.
*   **Root Cause 2 (Double Scroll):** Multiple \`useEffect\` hooks for keyboard events were active, causing each key press to be registered twice in React's \`StrictMode\`, incrementing the target index by two.
*   **Solution:** Consolidated all keyboard logic into a **single \`useEffect\` hook** to prevent duplicate listeners. Moved the snap point calculation logic *inside* the \`ResizeObserver\`'s callback, guaranteeing it only runs after the browser has finalized the layout.

### Iteration 30: Feature - "Snake Scroll" Logic
*   **Problem:** The snap points were initially calculated by stepping through by \`clientWidth\`, which resulted in "page-by-page" scrolling, not the desired "column-by-column" snake scroll.
*   **Root Cause:** A logical error in how the snap points array was generated.
*   **Solution:** Corrected the calculation to iterate by \`columnWidth + columnGap\`, creating a snap point for the beginning of every single column.
*   **Outcome:** Column-by-column scrolling worked, but rapid presses still felt clunky.

### Iteration 31: Feature - Two-Stage "Jump & Settle" Animation
*   **Goal:** Make rapid key presses feel responsive while still having a smooth final animation.
*   **Solution:** Implemented a two-stage scroll system:
    1.  **Immediate Jump:** On every key press, scroll instantly (\`behavior: 'auto'\`) to the target column for maximum responsiveness.
    2.  **Debounced Settle:** After the user stops pressing keys for \`150ms\`, trigger one final \`smooth\` scroll to the same target position for a polished "settling" animation.
*   **Outcome:** The animation now felt perfect, but a final edge-case bug was found.

### Iteration 32: Out-of-Bounds State Bug
*   **Problem:** When reaching the first or last column, pressing the arrow key again would make the controls feel unresponsive when trying to scroll back.
*   **Root Cause:** The \`setCurrentSnapIndex\` state was still being *updated* with the same clamped value (e.g., \`0\`), triggering unnecessary re-renders and preventing an immediate response in the opposite direction.
*   **Solution:** Added boundary checks inside the state setter. If the index is already at an edge, the state update is skipped entirely.

### Iteration 33: Feature - "You shall not pass!" Toast Message
*   **Goal:** Provide clear, fun feedback to the user when they hit the scroll boundaries.
*   **Solution:** Hooked into the new boundary checks. When an edge is hit, instead of just skipping the state update, a new \`toastMessage\` state is set. A floating component renders this message with a CSS fade-in/out animation, which automatically disappears after 2.5 seconds.
*   **Outcome:** All features are now fully functional, robust, and provide an excellent user experience.

`;

function App() {
  const [text, setText] = useState(defaultText);
  const [isSourceVisible, setSourceVisible] = useState(window.innerWidth >= 768);
  const containerRef = useRef(null);
  const outputPanelRef = useRef(null);
  const markdownInputRef = useRef(null);
  const [columnClass, setColumnClass] = useState('cols-1');
  const [snapPoints, setSnapPoints] = useState([0]);
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);
  const [lastKnownLeftWidth, setLastKnownLeftWidth] = useState(null);
  const currentDeviceTypeRef = useRef(window.innerWidth >= 768 ? 'desktop' : 'mobile');

  // --- NEW: State and Ref for the toast message ---
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef(null);

  // --- NEW: Helper function to show and auto-hide the toast ---
  const showToast = (message) => {
    clearTimeout(toastTimerRef.current); // Clear any existing timer
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage('');
    }, 2500); // Message stays for 2.5 seconds
  };

  // Unchanged handlers...
  const handleInputClick = (e) => {
    e.stopPropagation();
    if (markdownInputRef.current) {
      markdownInputRef.current.select();
    }
  };
  const touchStartCountRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const handleTouchStart = (e) => {
    if (window.innerWidth < 768) {
      touchStartCountRef.current = e.touches.length;
      touchStartTimeRef.current = new Date().getTime();
    }
  };
  const handleTouchEnd = (e) => {
    if (window.innerWidth < 768 && touchStartCountRef.current > 0) {
      const touchDuration = new Date().getTime() - touchStartTimeRef.current;
      if (
        touchStartCountRef.current === 2 &&
        e.touches.length === 0 &&
        touchDuration < 300 &&
        e.target !== markdownInputRef.current &&
        e.target.id !== 'toggle-source'
      ) {
        setSourceVisible((prev) => !prev);
        e.preventDefault();
      }
    }
    touchStartCountRef.current = 0;
    touchStartTimeRef.current = 0;
  };

  // Unchanged useEffects for layout...
  useEffect(() => {
    const resizer = document.querySelector('.resizer');
    const container = containerRef.current;
    if (!resizer || !container) return;
    const applyDesktopSplitView = () => {
      if (window.innerWidth >= 768 && isSourceVisible) {
        const defaultSplitWidth = window.innerWidth / 2 - 1;
        const effectiveWidth = lastKnownLeftWidth || defaultSplitWidth;
        container.style.gridTemplateColumns = `${effectiveWidth}px 2px 1fr`;
        if (lastKnownLeftWidth === null) {
          setLastKnownLeftWidth(effectiveWidth);
        }
      } else if (window.innerWidth >= 768 && !isSourceVisible) {
        container.style.gridTemplateColumns = '0px 0px 1fr';
      }
    };
    applyDesktopSplitView();
    const handleMouseMove = (e) => {
      if (isSourceVisible && window.innerWidth >= 768) {
        const newLeftWidth = e.clientX;
        if (newLeftWidth > 100 && newLeftWidth < window.innerWidth - 100) {
          container.style.gridTemplateColumns = `${newLeftWidth}px 2px 1fr`;
          setLastKnownLeftWidth(newLeftWidth);
        }
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    const handleMouseDown = () => {
      if (isSourceVisible && window.innerWidth >= 768) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    };
    resizer.addEventListener('mousedown', handleMouseDown);
    return () => {
      resizer.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSourceVisible, lastKnownLeftWidth]);

  useEffect(() => {
    const handleWindowResize = () => {
      const isCurrentlyDesktop = window.innerWidth >= 768;
      const prevDeviceType = currentDeviceTypeRef.current;
      const newDeviceType = isCurrentlyDesktop ? 'desktop' : 'mobile';
      if (newDeviceType !== prevDeviceType) {
        setSourceVisible(isCurrentlyDesktop);
        currentDeviceTypeRef.current = newDeviceType;
      }
      if (containerRef.current) {
        if (isCurrentlyDesktop) {
          if (isSourceVisible) {
            const defaultSplitWidth = window.innerWidth / 2 - 1;
            containerRef.current.style.gridTemplateColumns = `${
              lastKnownLeftWidth || defaultSplitWidth
            }px 2px 1fr`;
            if (lastKnownLeftWidth === null) {
              setLastKnownLeftWidth(defaultSplitWidth);
            }
          } else {
            containerRef.current.style.gridTemplateColumns = '0px 0px 1fr';
          }
        } else {
          containerRef.current.style.gridTemplateColumns = '';
        }
      }
      if (newDeviceType !== prevDeviceType) {
        setLastKnownLeftWidth(null);
      }
    };
    window.addEventListener('resize', handleWindowResize);
    handleWindowResize();
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [isSourceVisible, lastKnownLeftWidth]);

  // Part 1: ResizeObserver calculates columns AND snap points. This is correct.
  useEffect(() => {
    const outputPanel = outputPanelRef.current;
    if (!outputPanel) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        let newClass = 'cols-1', columnCountNumber = 1;
        const { width } = entry.contentRect;
        if (width > 1500) { newClass = 'cols-4'; columnCountNumber = 4; }
        else if (width > 1100) { newClass = 'cols-3'; columnCountNumber = 3; }
        else if (width > 700) { newClass = 'cols-2'; columnCountNumber = 2; }
        setColumnClass(newClass);
        if (columnCountNumber <= 1 || entry.target.scrollWidth <= entry.target.clientWidth) {
          setSnapPoints([0]); setCurrentSnapIndex(0); return;
        }
        const panelStyle = window.getComputedStyle(entry.target);
        const contentWrapper = entry.target.querySelector('.content-wrapper');
        if (!contentWrapper) return;
        const wrapperStyle = window.getComputedStyle(contentWrapper);
        const columnGap = parseFloat(wrapperStyle.columnGap) || 40;
        const paddingLeft = parseFloat(panelStyle.paddingLeft);
        const paddingRight = parseFloat(panelStyle.paddingRight);
        const contentAreaWidth = entry.target.clientWidth - paddingLeft - paddingRight;
        const totalGapWidth = columnGap * (columnCountNumber - 1);
        const columnWidth = (contentAreaWidth - totalGapWidth) / columnCountNumber;
        const scrollAmountPerColumn = columnWidth + columnGap;
        const maxScrollLeft = entry.target.scrollWidth - entry.target.clientWidth;
        const points = []; let currentPoint = 0;
        while (currentPoint < maxScrollLeft) {
          points.push(currentPoint); currentPoint += scrollAmountPerColumn;
        }
        points.push(maxScrollLeft);
        const uniquePoints = [...new Set(points.map((p) => Math.round(p)))];
        setSnapPoints(uniquePoints); setCurrentSnapIndex(0);
        entry.target.scrollTo({ left: 0, behavior: 'auto' });
      }
    });
    observer.observe(outputPanel);
    return () => observer.disconnect();
  }, [text]);

  // Part 2: CONSOLIDATED keyboard handler with BOUNDARY CHECKS.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        if (window.innerWidth >= 768) {
          e.preventDefault(); e.stopPropagation();
          if (document.activeElement === markdownInputRef.current) return;
          setSourceVisible((prev) => !prev);
        }
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (document.activeElement === markdownInputRef.current) return;
        e.preventDefault();
        
        // Use the functional form of setState to get the most recent index
        setCurrentSnapIndex((prevIndex) => {
          if (e.key === 'ArrowRight') {
            if (prevIndex >= snapPoints.length - 1) {
              showToast('You shall not pass!'); // Trigger toast at the end
              return prevIndex; // Return the same index, no change
            }
            return prevIndex + 1; // Okay to increment
          } else { // ArrowLeft
            if (prevIndex <= 0) {
              showToast('You shall not pass!'); // Trigger toast at the start
              return prevIndex; // Return the same index, no change
            }
            return prevIndex - 1; // Okay to decrement
          }
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [snapPoints, markdownInputRef]); // snapPoints is a dependency

  // Part 3: Two-Stage Debounced Scroll. This is correct.
  useEffect(() => {
    const outputPanel = outputPanelRef.current;
    if (!outputPanel || snapPoints.length <= 1) return;
    const targetScrollLeft = snapPoints[currentSnapIndex];
    outputPanel.scrollTo({ left: targetScrollLeft, behavior: 'auto' });
    const debounceTimer = setTimeout(() => {
      outputPanel.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(debounceTimer);
  }, [currentSnapIndex, snapPoints]);

  // --- Screen Wake Lock API (Unchanged) ---
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          wakeLock.addEventListener('release', () => {});
        } catch (err) { console.error(`${err.name}, ${err.message}`); }
      }
    };
    requestWakeLock();
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (wakeLock !== null) { wakeLock.release(); wakeLock = null; }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={`app-container ${isSourceVisible ? 'source-active' : 'source-inactive'}`}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
      >
        <div className="panel input-panel">
          <textarea
            ref={markdownInputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onClick={handleInputClick}
            placeholder="Type your Markdown here..."
          />
        </div>
        <div className="resizer"></div>
        <div className="panel output-panel" ref={outputPanelRef}>
          <div className={`content-wrapper ${columnClass}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <div
        id="toggle-source"
        onClick={(e) => { e.stopPropagation(); setSourceVisible((prev) => !prev); }}
      >
        {isSourceVisible ? '—' : '+'}
      </div>
      {/* --- NEW: Render the toast message when it's active --- */}
      {toastMessage && <div id="toast">{toastMessage}</div>}
    </>
  );
}

export default App;