#!/usr/bin/env node
// Rebuilds every hand-designed SVG. The contribution chart has its own script
// (scripts/build-activity.mjs) because it needs the GitHub API.
import "./art/header.mjs";
import "./art/track.mjs";
import "./art/now.mjs";
import "./art/stack.mjs";
import "./art/cards.mjs";
import "./art/footer.mjs";
import "./art/nav.mjs";
