(() => {
  const CONTENT_BUILD_ID = "1.4.12";
  const APP_VERSION = "1.4.12";
  const existingApi = window.__VFS_SIDEBAR_REVIEW__;
  if (window.__VFS_SIDEBAR_REVIEW_LOADED__ && existingApi?.version === CONTENT_BUILD_ID) {
    return;
  }
  try {
    existingApi?.dispose?.();
  } catch {
    // Older injected builds did not expose disposal; remove their visible chrome below.
  }
  document.querySelectorAll(".vfs-root, .vfs-marker-layer, .vfs-focus-box").forEach((node) => node.remove());
  window.__VFS_SIDEBAR_REVIEW_LOADED__ = true;
  window.__VFS_SIDEBAR_REVIEW_VERSION__ = CONTENT_BUILD_ID;

  const POPUP_SOURCE = "vfs-popup";
  const CONTENT_SOURCE = "vfs-content";
  const MAGIC_BRIDGE_SOURCE = "vf-magic-login-bridge";
  const AUTHOR_STORAGE_KEY = "vfs-author";
  const FEISHU_FASS_BASE_URL = "https://magic.solutionsuite.cn/api/faas/vpYFBd0FLU8";
  const FEISHU_HEALTH_URL = `${FEISHU_FASS_BASE_URL}?action=health`;
  const FEISHU_SYNC_DEFAULT_URL = `${FEISHU_FASS_BASE_URL}?action=sync`;
  const FEISHU_COLLAB_DEFAULT_URL = `${FEISHU_FASS_BASE_URL}?action=collab`;
  const FEISHU_LOGIN_URL = `${FEISHU_FASS_BASE_URL}?action=oauth-login`;
  const FEISHU_SESSION_STORAGE_KEY = "vf-feishu:session";
  const FEISHU_LOGIN_CLIENT_STORAGE_KEY = "vf-feishu:login-client";
  const FEISHU_DOC_MAP_STORAGE_KEY = "vf-feishu:doc-map";
  const FEISHU_SYNC_URL_STORAGE_KEY = "vf-feishu:sync-url";
  const COLLAB_API_URL_STORAGE_KEY = "vf-collab:api-url";
  const COLLAB_ROOM_STORAGE_PREFIX = "vf-collab:room:";
  const TEAM_ACTIVE_STORAGE_KEY = "vf-team:active";
  const TEAM_RECENT_STORAGE_KEY = "vf-team:recent";
  const ANALYTICS_SCHEMA_VERSION = "1.0";
  const ANALYTICS_INSTALLATION_STORAGE_KEY = "vf-analytics:installation-id";
  const ANALYTICS_QUEUE_STORAGE_KEY = "vf-analytics:queue";
  const ANALYTICS_MAX_QUEUE_SIZE = 30;
  const ANALYTICS_EVENT_NAMES = new Set([
    "plugin_opened",
    "mode_changed",
    "feishu_login_started",
    "feishu_login_succeeded",
    "feishu_login_failed",
    "teams_refresh_started",
    "teams_refresh_succeeded",
    "teams_refresh_failed",
    "team_selected",
    "sync_started",
    "sync_succeeded",
    "sync_failed",
    "comment_created",
    "reply_created",
    "mention_created",
    "comment_resolved",
    "comment_reopened",
    "comment_deleted",
    "deep_link_opened",
    "page_shared",
    "ba_compare_used",
    "agent_delivery_opened",
    "agent_exported"
  ]);
  const ANALYTICS_PROP_KEYS = new Set([
    "source",
    "mode",
    "sync_kind",
    "comment_type",
    "comparison_side",
    "export_format",
    "team_count",
    "record_count",
    "mention_count",
    "has_mention",
    "has_preview",
    "has_style_edits",
    "background"
  ]);
  const COLLAB_INLINE_IMAGE_LIMIT = 120000;
  const SESSION_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;
  const SESSION_REFRESH_TIMEOUT_MS = 8000;
  const COLLAB_REQUEST_TIMEOUT_MS = 20000;
  const DOCUMENT_SYNC_TIMEOUT_MS = 45000;
  const REOPEN_HIDDEN_STORAGE_KEY = "vfs-reopen-hidden";
  const MARKERS_HIDDEN_STORAGE_KEY = "vfs-markers-hidden";
  const DEFAULT_AUTHOR = "我";
  const NATIVE_SIDEPANEL_BUILD = false;
  const MODES = ["read", "dom", "shot", "off"];
  const ANNOTATION_TARGET_SELECTOR = "a,button,input,textarea,select,label,summary,h1,h2,h3,h4,h5,h6,p,li,img,section,article,aside,div,span,[role='menuitem'],[role='option'],[role='treeitem']";
  const PRECISE_ANNOTATION_TARGET_SELECTOR = "a,button,input,textarea,select,label,summary,h1,h2,h3,h4,h5,h6,p,li,img,span,[role='menuitem'],[role='option'],[role='treeitem']";
  const TOOL_LABELS = {
    box: "框",
    arrow: "箭头",
    pen: "画笔"
  };
  const SHOT_PREVIEW_MAX_WIDTH = 960;
  const SHOT_PREVIEW_MAX_HEIGHT = 640;
  const SHOT_PREVIEW_JPEG_QUALITY = 0.86;
  const STYLE_PROPERTIES = [
    "font-size",
    "font-weight",
    "color",
    "background-color",
    "opacity",
    "padding",
    "border-radius",
    "text-align"
  ];
  const STYLE_PRESETS = {
    "font-size": ["10px", "11px", "12px", "13px", "14px", "15px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "40px", "48px", "56px", "64px"],
    "font-weight": ["300", "400", "500", "600", "700", "800"],
    color: ["#111318", "#29282d", "#59636f", "#A94DDB", "#FF704F", "#ffffff", "#000000"],
    "background-color": ["#ffffff", "#f7f5fb", "#ebe6ff", "#fff2e8", "#29282d", "#000000"],
    opacity: ["100%", "90%", "75%", "60%", "50%", "40%", "25%", "0%"],
    padding: ["0px", "2px", "4px", "6px", "8px", "10px", "12px", "16px", "20px", "24px", "32px", "40px"],
    "border-radius": ["0px", "2px", "4px", "6px", "8px", "10px", "12px", "16px", "20px", "24px", "32px"]
  };
  const ICON_PATHS = {
    back: "M702.1568 15.9744a54.76352 54.76352 0 0 1 76.75904-0.2048 53.08416 53.08416 0 0 1 0.2048 75.776L318.60736 547.30752a54.784 54.784 0 0 1-76.77952 0.2048 53.10464 53.10464 0 0 1-0.2048-75.776L702.1568 15.9744z M779.14112 927.5392a53.10464 53.10464 0 0 1-0.2048 75.776 54.76352 54.76352 0 0 1-76.77952-0.2048L241.60256 547.34848a53.10464 53.10464 0 0 1 0.2048-75.776 54.80448 54.80448 0 0 1 76.77952 0.2048L779.14112 927.5392z",
    copy: "M661.333333 234.666667A64 64 0 0 1 725.333333 298.666667v597.333333a64 64 0 0 1-64 64h-469.333333A64 64 0 0 1 128 896V298.666667a64 64 0 0 1 64-64z m-21.333333 85.333333H213.333333v554.666667h426.666667v-554.666667z m191.829333-256a64 64 0 0 1 63.744 57.856l0.256 6.144v575.701333a42.666667 42.666667 0 0 1-85.034666 4.992l-0.298667-4.992V149.333333H384a42.666667 42.666667 0 0 1-42.368-37.674666L341.333333 106.666667a42.666667 42.666667 0 0 1 37.674667-42.368L384 64h447.829333z",
    switch: "M886.2 604.8H137.8c-22.1 0-40 17.9-40 40 0 8.4 2.6 16.2 7 22.6 1.9 4.5 4.8 8.7 8.4 12.4L289.5 856c7.8 7.8 18 11.7 28.3 11.7s20.5-3.9 28.3-11.7c15.6-15.6 15.6-40.9 0-56.6L231.3 684.8h654.8c22.1 0 40-17.9 40-40s-17.8-40-39.9-40zM137.8 419.2h748.4c22.1 0 40-17.9 40-40 0-8.4-2.6-16.2-7-22.6-1.4-3.3-3.4-6.5-5.8-9.5L769.2 170.9c-14-17.1-39.2-19.6-56.3-5.6-17.1 14-19.6 39.2-5.6 56.3l96.3 117.6H137.8c-22.1 0-40 17.9-40 40s17.9 40 40 40z",
    collapse: "M810.667 725.333a42.667 42.667 0 1 1 0 85.334H213.333a42.667 42.667 0 1 1 0-85.334h597.334z m3.84-318.08a25.6 25.6 0 0 1 38.826 21.974v165.546a25.6 25.6 0 0 1-38.826 21.974l-137.899-82.774a25.6 25.6 0 0 1 0-43.946zM512 469.333a42.667 42.667 0 1 1 0 85.334H213.333a42.667 42.667 0 1 1 0-85.334H512z m298.667-256a42.667 42.667 0 1 1 0 85.334H213.333a42.667 42.667 0 1 1 0-85.334h597.334z",
    edit: "M156.16 1024C69.12 1024 0 954.88 0 867.84V156.16C0 69.12 69.12 0 156.16 0h430.08c33.28 0 58.88 28.16 58.88 58.88s-28.16 58.88-58.88 58.88H156.16c-20.48 0-35.84 15.36-35.84 35.84v716.8c0 20.48 15.36 35.84 35.84 35.84h711.68c20.48 0 35.84-15.36 35.84-35.84V468.48c0-33.28 28.16-58.88 58.88-58.88 15.36 0 33.28 7.68 43.52 17.92 10.24 10.24 15.36 25.6 15.36 40.96v399.36c0 87.04-69.12 156.16-156.16 156.16H156.16z M450.56 670.72c-7.68 0-15.36-5.12-20.48-10.24-5.12-5.12-5.12-15.36-2.56-20.48l28.16-84.48L934.4 74.24c10.24-12.8 25.6-17.92 43.52-17.92 15.36 0 30.72 7.68 43.52 17.92 23.04 23.04 25.6 64 0 87.04L542.72 642.56l-84.48 28.16h-7.68z",
    reply: "M298.666667 128C183.893333 128 85.333333 215.125333 85.333333 329.130667v237.738666C85.333333 680.874667 183.893333 768 298.666667 768a42.666667 42.666667 0 1 0 0-85.333333c-73.728 0-128-54.784-128-115.797334V329.130667C170.666667 268.117333 224.938667 213.333333 298.666667 213.333333h426.666666c73.728 0 128 54.784 128 115.797334v237.738666C853.333333 627.882667 799.061333 682.666667 725.333333 682.666667a42.666667 42.666667 0 0 0-42.666666 42.666666v96.213334l-142.122667-127.914667A42.666667 42.666667 0 0 0 512 682.666667h-42.666667a42.666667 42.666667 0 1 0 0 85.333333h26.282667l129.962667 116.949333C680.533333 934.4 768 895.402667 768 821.546667v-57.6c95.488-18.432 170.666667-97.536 170.666667-197.12v-237.653334C938.666667 215.082667 840.106667 128 725.333333 128H298.666667zM256 341.333333a42.666667 42.666667 0 0 1 42.666667-42.666666h426.666666a42.666667 42.666667 0 1 1 0 85.333333H298.666667a42.666667 42.666667 0 0 1-42.666667-42.666667z m42.666667 128a42.666667 42.666667 0 1 0 0 85.333334h256a42.666667 42.666667 0 1 0 0-85.333334H298.666667z"
  };
  const TOOLBAR_ICONS = {
    eye: '<path d="M2.5 12s3.4-6.5 9.5-6.5S21.5 12 21.5 12 18.1 18.5 12 18.5 2.5 12 2.5 12Z"></path><circle cx="12" cy="12" r="2.8"></circle>',
    eyeOff: '<path d="M3 3 21 21"></path><path d="M10.6 5.7A10.9 10.9 0 0 1 12 5.5c6.1 0 9.5 6.5 9.5 6.5a17.1 17.1 0 0 1-3.2 3.9"></path><path d="M6.2 6.4A17.2 17.2 0 0 0 2.5 12S5.9 18.5 12 18.5a9.8 9.8 0 0 0 2.8-.4"></path><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"></path>',
    comment: '<path d="M20.5 11.5a7.6 7.6 0 0 1-8.1 7.5 8.7 8.7 0 0 1-3.2-.7L4 20l1.5-4.3A7.1 7.1 0 0 1 4 11.5 7.6 7.6 0 0 1 12.1 4a7.6 7.6 0 0 1 8.4 7.5Z"></path>',
    reply: '<path d="m9 7-5 5 5 5"></path><path d="M4 12h9a6 6 0 0 1 6 6v1"></path>',
    team: '<path d="M8.8 11.1a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z"></path><path d="M2.9 20.1a6.1 6.1 0 0 1 11.8 0"></path><path d="M16.2 11.4a3 3 0 1 0-.7-5.8"></path><path d="M15.4 14.3a5.1 5.1 0 0 1 5.7 4.9"></path>',
    commentPlus: '<path d="M20.5 11.5a7.6 7.6 0 0 1-8.1 7.5 8.7 8.7 0 0 1-3.2-.7L4 20l1.5-4.3A7.1 7.1 0 0 1 4 11.5 7.6 7.6 0 0 1 12.1 4a7.6 7.6 0 0 1 8.4 7.5Z"></path><path d="M12 8.6v5.2M9.4 11.2h5.2"></path>',
    camera: '<path d="M4.5 7.5h3l1.3-2h6.4l1.3 2h3A2.5 2.5 0 0 1 22 10v8.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5V10a2.5 2.5 0 0 1 2.5-2.5Z"></path><circle cx="12" cy="14" r="3.25"></circle>',
    box: '<path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4"></path>',
    arrow: '<path d="M6 18 18 6M10 6h8v8"></path>',
    pen: '<path d="m4 20 4.3-1 10-10a2.3 2.3 0 0 0-3.3-3.3l-10 10L4 20Z"></path><path d="m13.6 7.1 3.3 3.3"></path>',
    refresh: '<path d="M3 4v5h5"></path><path d="M4.8 8.5A8 8 0 1 1 4 15"></path>',
    share: '<circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="m8.3 10.9 7.4-4.6M8.3 13.1l7.4 4.6"></path>',
    cloudUpload: '<path d="M7.2 18.5H5.8A3.8 3.8 0 0 1 5.3 11a6.5 6.5 0 0 1 12.4-1.8 4.6 4.6 0 0 1 .5 9.2H16"></path><path d="M12 20V11"></path><path d="m8.7 14.3 3.3-3.3 3.3 3.3"></path>',
    pending: '<circle cx="12" cy="12" r="7.5"></circle>',
    check: '<path d="m5 12.5 4.2 4.2L19 7"></path>',
    checkCircle: '<circle cx="12" cy="12" r="8.5"></circle><path d="m8.1 12.2 2.5 2.6 5.4-5.6"></path>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="2"></rect><path d="M5 16V5a2 2 0 0 1 2-2h9"></path>',
    sparkles: '<path d="m12 2 1.3 4.7L18 8l-4.7 1.3L12 14l-1.3-4.7L6 8l4.7-1.3L12 2Z"></path><path d="m18.5 14 .7 2.8L22 17.5l-2.8.7-.7 2.8-.7-2.8-2.8-.7 2.8-.7.7-2.8Z"></path><path d="m5.2 14 .6 2.1 2.1.6-2.1.6-.6 2.1-.6-2.1-2.1-.6 2.1-.6.6-2.1Z"></path>',
    compare: '<text x="3.2" y="15.8" fill="currentColor" stroke="none" font-size="10.5" font-weight="800" font-family="Arial, sans-serif">B</text><path d="M10.2 12h3.4m-1.8-1.8L13.6 12l-1.8 1.8"></path><text x="14.4" y="15.8" fill="currentColor" stroke="none" font-size="10.5" font-weight="800" font-family="Arial, sans-serif">A</text>',
    undo: '<path d="M8 7 4 11l4 4"></path><path d="M5 11h8.5a5.5 5.5 0 1 1 0 11H12"></path>',
    redo: '<path d="m16 7 4 4-4 4"></path><path d="M19 11h-8.5a5.5 5.5 0 1 0 0 11H12"></path>',
    grip: '<circle cx="7" cy="7" r="1"></circle><circle cx="7" cy="12" r="1"></circle><circle cx="7" cy="17" r="1"></circle><circle cx="12" cy="7" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="17" r="1"></circle>',
    close: '<path d="m6 6 12 12M18 6 6 18"></path>',
    trash: '<path d="M5 7h14"></path><path d="M10 11v6M14 11v6"></path><path d="M9 7l1-2h4l1 2"></path><path d="m7 7 .8 13h8.4L17 7"></path>',
    collapse: '<path d="m9 18 6-6-6-6"></path>',
    expandLeft: '<path d="m15 18-6-6 6-6"></path>',
    archive: '<path d="M4 5.5h16v3H4z"></path><path d="M5.5 8.5v11h13v-11"></path><path d="m9 14 2 2 4-4"></path>',
    download: '<path d="M12 3v12"></path><path d="m7.5 10.5 4.5 4.5 4.5-4.5"></path><path d="M4 20h16"></path>',
    package: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"></path><path d="m4 7.5 8 4.5 8-4.5M12 12v9"></path>',
    help: '<circle cx="12" cy="12" r="9"></circle><path d="M9.7 9.2a2.5 2.5 0 0 1 4.8.9c0 1.8-2.5 2.2-2.5 3.9"></path><path d="M12 17.4h.01"></path>',
    theme: '<path d="M20.5 14.3A8.3 8.3 0 0 1 9.7 3.5 8.3 8.3 0 1 0 20.5 14.3Z"></path>',
    sun: '<circle cx="12" cy="12" r="3.5"></circle><path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6"></path>'
  };
  const INTERNAL_SOURCE = "vfs-internal";
  const PAGE_SCALE_MIN = 0.68;

  let pageContext = {
    title: document.title || "",
    url: location.href
  };
  let records = [];
  let mode = "off";
  let sidebarOpen = false;
  let reopenHidden = false;
  let markersHidden = false;
  let currentAuthor = DEFAULT_AUTHOR;
  let feishuSessionToken = "";
  let feishuUser = null;
  let feishuSessionExpiresAt = 0;
  let feishuSessionSavedAt = 0;
  let feishuPendingText = "";
  let feishuBusy = false;
  let feishuBusyAction = "";
  let collabState = null;
  let collabBusy = false;
  let collabBackgroundBusy = false;
  let collabBusyAction = "";
  let collabOverviewPromise = null;
  let collabShowResolved = false;
  let selectedElement = null;
  let pendingSelection = null;
  let activeDomSelection = null;
  let hoveredElement = null;
  let activeId = "";
  let agentDeliveryOpen = false;
  let agentFormat = "compact";
  let agentMarkdownDraft = null;
  let isDarkTheme = false;
  let agentSelectedIds = new Set();
  let agentSelectedContentKeys = new Set();
  let agentContentDrafts = new Map();
  let agentActiveContentKey = "";
  let agentMobilePane = "selection";
  let agentBatchIndex = 0;
  let root = null;
  let workbar = null;
  let shotbar = null;
  let sidebar = null;
  let jsonImportInput = null;
  let composer = null;
  let composerLabel = null;
  let commentInput = null;
  let styleTextInput = null;
  let stylePresetMenu = null;
  let stylePresetInput = null;
  let styleHelpTooltip = null;
  let threadList = null;
  let markerLayer = null;
  let focusBox = null;
  let toastNode = null;
  let shotOverlay = null;
  let shotStage = null;
  let shotImage = null;
  let shotCanvas = null;
  let shotCtx = null;
  let shotTitle = null;
  let shotPopover = null;
  let shotCommentInput = null;
  let editPopover = null;
  let editLabel = null;
  let editInput = null;
  let imageViewer = null;
  let imageViewerImg = null;
  let imageViewerTitle = null;
  let shareConfirmModal = null;
  let shareConfirmReturnFocus = null;
  let shareNoteInput = null;
  let sharePagePreviewDataUrl = "";
  let sharePreviewCaptureId = 0;
  let sharePreviewCapturePromise = null;
  let agentModal = null;
  let agentModalMarkdown = null;
  let composerMode = "comment";
  let styleDraft = null;
  let styleHistory = [];
  let styleFuture = [];
  let styleComparisonActive = false;
  let savedStyleComparison = null;
  const mentionSelections = {
    dom: new Map(),
    shot: new Map(),
    reply: new Map(),
    share: new Map()
  };
  const mentionQueries = { dom: "", shot: "", reply: "", share: "" };
  const mentionActiveIndexes = { dom: 0, shot: 0, reply: 0, share: 0 };
  let openMentionScope = "";
  let pendingDeepLink = null;
  let openingDeepLink = false;
  let deepLinkHighlightThreadId = "";
  let deepLinkHighlightTimer = 0;
  let toolbarDragState = null;
  let shotbarAutoShiftOrigin = null;
  let sidebarDragState = null;
  let sidebarResizeState = null;
  let markerFrame = 0;
  let markerTrackingFrame = 0;
  let markerTrackingUntil = 0;
  let focusFrame = 0;
  let childRecordRectFrame = 0;
  let childRecordRects = new Map();
  let toastTimer = null;
  let focusTimer = null;
  let screenshotRecoveryRequest = 0;
  let shotAnchorRequestIndex = 0;
  let shotAnchorRequests = new Map();
  let activePageKey = "";
  let pageIdentityTimer = null;
  let confirmTimer = null;
  let pendingConfirm = null;
  let activeFocusElement = null;
  let activeFocusRecord = null;
  let captureInProgress = false;
  let shotTool = "box";
  let shotRegion = null;
  let shotAnnotations = [];
  let shotComposerDraft = null;
  let shotDraft = null;
  let shotDrawing = false;
  let shotCaptureArea = null;
  let shotScrollTimer = null;
  let collabPollTimer = null;
  let collabSyncTimer = null;
  let editingRecordId = "";
  let editingRecordMode = "edit";
  let domSaveInProgress = false;
  let shotSaveInProgress = false;
  const remoteStyleSessions = new Map();
  const remoteSavedStyleComparisons = new Map();
  const shotEnrichmentTasks = new Map();
  const loadingButtonMotions = new WeakMap();
  let analyticsWork = Promise.resolve();
  let initialStatePromise = null;

  init();

  function loadInitialState() {
    if (!initialStatePromise) {
      initialStatePromise = Promise.all([
        loadRecords(),
        loadAuthor(),
        loadFeishuSession({ skipRefresh: true }),
        loadCollabState(),
        loadReopenHidden(),
        loadMarkersHidden()
      ]);
    }
    return initialStatePromise;
  }

  function init() {
    if (isTopFrame()) {
      activePageKey = currentPageIdentityKey();
      loadInitialState().then(() => {
        activePageKey = activePageKey || currentPageIdentityKey();
        void consumePendingDeepLink();
      });
    } else {
      loadAuthor().then(() => {
        removeEmbeddedMarkerLayers();
        renderChrome();
        postToParent({ type: "VFS_CHILD_READY", frameUrl: location.href });
      });
    }
    chrome.runtime.onMessage.addListener(handleRuntimeMessage);
    window.addEventListener("pointerdown", handleDomPointerDown, true);
    window.addEventListener("mousemove", handleMouseMove, true);
    window.addEventListener("click", handleDocumentClick, true);
    document.addEventListener("mousemove", handleMouseMove, true);
    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("message", handleWindowMessage);
    window.addEventListener("scroll", scheduleMarkerUpdate, true);
    document.addEventListener("scroll", scheduleMarkerUpdate, true);
    window.visualViewport?.addEventListener?.("scroll", scheduleMarkerUpdate);
    window.visualViewport?.addEventListener?.("resize", scheduleMarkerUpdate);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("visibilitychange", scheduleCollabPoll);
    chrome.storage?.onChanged?.addListener(handleStorageChange);
    watchPageIdentityChanges();
  }

  function handleRuntimeMessage(message, sender, sendResponse) {
    if (!message || message.source !== POPUP_SOURCE) {
      return undefined;
    }
    runMessage(message)
      .then((response) => sendResponse(response))
      .catch((error) => sendResponse({ ok: false, error: error.message || String(error) }));
    return true;
  }

  function handleWindowMessage(event) {
    const message = event.data;
    if (message?.source === MAGIC_BRIDGE_SOURCE && message.type === "VF_MAGIC_LOGIN_SUCCESS") {
      chrome.runtime.sendMessage({
        source: CONTENT_SOURCE,
        type: "VFS_MAGIC_LOGIN_SUCCESS",
        sessionToken: message.sessionToken,
        syncUrl: message.syncUrl,
        collabUrl: message.collabUrl,
        user: message.user,
        expiresAt: message.expiresAt
      }, (response) => {
        void chrome.runtime.lastError;
        if (response?.autoClose) {
          window.close();
        }
      });
      return;
    }

    if (!message || message.source !== INTERNAL_SOURCE) {
      return;
    }

    if (isRemoteStyleMessage(message)) {
      if (!handleRemoteStyleMessage(message)) {
        postToChildFrames(message);
      }
      return;
    }

    if (isSavedStyleComparisonMessage(message)) {
      if (!handleSavedStyleComparisonMessage(message)) {
        postToChildFrames(message);
      }
      return;
    }

    if (message.type === "VFS_SAVED_STYLE_COMPARE_RESULT") {
      if (isTopFrame()) {
        handleSavedStyleComparisonResult(message);
      } else {
        postToParent(message);
      }
      return;
    }

    if (isTopFrame()) {
      if (message.type === "VFS_CHILD_READY") {
        broadcastToChildFrames({ type: "VFS_MODE_CHANGED", mode, sidebarOpen, records });
        return;
      }
      if (message.type === "VFS_CHILD_SELECTION") {
        handleChildSelection(translateChildSelection(message.selection, event.source));
        return;
      }
      if (message.type === "VFS_CHILD_CLEARED") {
        pendingSelection = null;
      }
      if (message.type === "VFS_CHILD_SHOT_ANCHOR") {
        resolveChildShotAnchor(message, event.source);
      }
      if (message.type === "VFS_CHILD_RECORD_RECTS") {
        updateChildRecordRects(message, event.source);
      }
      if (message.type === "VFS_EXIT_TO_READ" && mode !== "off") {
        void setMode("read");
      }
      if (message.type === "VFS_CLOSE_DOM_COMPOSER") {
        clearSelection();
        clearHover();
        closeDomComposer();
        broadcastToChildFrames(message);
      }
      return;
    }

    if (message.type === "VFS_CHILD_SELECTION" || message.type === "VFS_CHILD_CLEARED") {
      postToParent(message.type === "VFS_CHILD_SELECTION" ? {
        ...message,
        selection: translateChildSelection(message.selection, event.source)
      } : message);
      return;
    }

    if (message.type === "VFS_MODE_CHANGED") {
      mode = MODES.includes(message.mode) ? message.mode : "read";
      sidebarOpen = Boolean(message.sidebarOpen);
      records = Array.isArray(message.records) ? message.records : records;
      if (mode !== "dom") {
        clearSelection();
        clearHover();
      }
      renderAll();
      postToChildFrames(message);
      return;
    }

    if (message.type === "VFS_RECORDS_UPDATED") {
      records = Array.isArray(message.records) ? message.records : [];
      renderAll();
      postToChildFrames(message);
      return;
    }

    if (message.type === "VFS_CLEAR_SELECTION") {
      clearSelection();
      clearHover();
      return;
    }

    if (message.type === "VFS_CLOSE_DOM_COMPOSER") {
      clearSelection();
      clearHover();
      closeDomComposer();
      postToChildFrames(message);
      return;
    }

    if (message.type === "VFS_LOCATE_RECORD") {
      locateRecordFromMessage(message.record);
      postToChildFrames(message);
      return;
    }

    if (message.type === "VFS_SHOT_ANCHOR_QUERY") {
      const anchor = buildViewportAnchor(message.rect);
      postToParent({
        type: "VFS_CHILD_SHOT_ANCHOR",
        requestId: message.requestId,
        anchor
      });
      return;
    }

    if (message.type === "VFS_CHILD_SHOT_ANCHOR" || message.type === "VFS_EXIT_TO_READ") {
      postToParent(message);
    }

    if (message.type === "VFS_CHILD_RECORD_RECTS") {
      postToParent(message);
    }
  }

  async function runMessage(message, context = {}) {
    setPageContext(context);

    if (message.type === "VFS_PING") {
      return { ok: true, state: getState() };
    }

    if (isSavedStyleComparisonMessage(message)) {
      const handled = handleSavedStyleComparisonMessage(message);
      return { ok: handled, state: getState() };
    }

    if (message.type === "VFS_GET_STATE") {
      await loadInitialState();
      ensureUi();
      renderAll();
      return { ok: true, state: getState() };
    }

    if (message.type === "VFS_SET_AUTHOR") {
      currentAuthor = normalizeAuthor(message.author);
      await storageSet({ [AUTHOR_STORAGE_KEY]: currentAuthor });
      return { ok: true, state: getState() };
    }

    if (message.type === "VFS_SET_MODE") {
      await loadInitialState();
      ensureUi();
      await setMode(message.mode);
      return { ok: true, state: getState() };
    }

    if (message.type === "VFS_ACTION_OPEN") {
      ensureUi();
      setSidebarVisibility(true);
      await loadInitialState();
      renderAll();
      trackEvent("plugin_opened", { source: "browser_action", record_count: records.length });
      void refreshCollabWorkspaceOverview({ silent: true });
      return { ok: true, state: getState() };
    }

    if (message.type === "VFS_EXTERNAL_SYNC") {
      mode = MODES.includes(message.mode) ? message.mode : mode;
      sidebarOpen = Boolean(message.sidebarOpen);
      if (sidebarOpen) {
        await setReopenHidden(false);
      }
      if (isTopFrame()) {
        await loadRecords();
      }
      renderAll();
      return { ok: true, state: getState() };
    }

    if (message.type === "VFS_FRAME_SYNC") {
      if (isTopFrame()) {
        return { ok: true, state: getState() };
      }
      mode = MODES.includes(message.mode) ? message.mode : mode;
      sidebarOpen = Boolean(message.sidebarOpen);
      records = Array.isArray(message.records) ? message.records : records;
      if (mode !== "dom") {
        clearSelection();
        clearHover();
      }
      renderAll();
      return { ok: true, state: getState() };
    }

    if (message.type === "VFS_RECORDS_UPDATED") {
      if (isTopFrame()) {
        return { ok: true, state: getState() };
      }
      records = Array.isArray(message.records) ? message.records : [];
      renderAll();
      return { ok: true, state: getState() };
    }

    if (message.type === "VFS_CLEAR_SELECTION") {
      clearSelection();
      clearHover();
      return { ok: true, state: getState() };
    }

    if (message.type === "VFS_CLOSE_DOM_COMPOSER") {
      clearSelection();
      clearHover();
      closeDomComposer();
      return { ok: true, state: getState() };
    }

    if (message.type === "VFS_PANEL_STATE") {
      await loadInitialState();
      ensureUi();
      renderAll();
      return { ok: true, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_UPDATE_RECORD") {
      await loadRecords();
      const record = records.find((item) => item.id === message.recordId);
      const text = String(message.text || "").trim();
      if (!record) {
        return { ok: false, error: "批注不存在。", state: getPanelState() };
      }
      if (!text) {
        return { ok: false, error: "批注内容不能为空。", state: getPanelState() };
      }
      record.text = text;
      record.updatedAt = new Date().toISOString();
      markRecordPendingCollabSync(record);
      activeId = record.id;
      await persistRecords();
      broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
      renderAll();
      scheduleCollabSync();
      return { ok: true, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_DELETE_RECORD") {
      restoreSavedStyleComparison();
      await loadRecords();
      const recordId = String(message.recordId || "");
      const record = records.find((item) => item.id === recordId);
      restoreRecordStyle(record);
      if (record && activeTeamChatId()) {
        markRecordDeletedForTeam(record);
      } else {
        records = records.filter((item) => item.id !== recordId);
      }
      if (activeId === recordId) {
        activeId = activeRecords()[0]?.id || records[0]?.id || "";
      }
      if (records.length) {
        await persistRecords();
      } else {
        await storageRemove(storageKey());
      }
      broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
      renderAll();
      scheduleCollabSync(0);
      if (record) {
        trackEvent("comment_deleted", {
          source: "native_panel",
          record_count: 1,
          comment_type: record.type === "screenshot" ? "screenshot" : "dom"
        });
      }
      return { ok: true, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_IMPORT_RECORDS") {
      const imported = parseImportedRecords(message.payload || {});
      if (!imported.length) {
        return { ok: false, error: "未识别到可导入的批注。", state: getPanelState() };
      }
      restoreSavedStyleComparison();
      records = imported;
      activeId = records[0]?.id || "";
      agentDeliveryOpen = false;
      agentSelectedIds = new Set();
      agentBatchIndex = 0;
      await persistRecords();
      broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
      renderAll();
      return { ok: true, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_LOCATE_RECORD") {
      await loadRecords();
      focusRecord(String(message.recordId || ""));
      return { ok: true, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_PREVIEW_IMAGE") {
      await loadRecords();
      const record = records.find((item) => item.id === String(message.recordId || ""));
      if (!record?.previewImage) {
        return { ok: false, error: "未找到配图。", state: getPanelState() };
      }
      openImageViewer(record.previewImage, record.type === "screenshot" ? "截图预览" : "配图预览");
      return { ok: true, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_TOGGLE_MARKERS") {
      await setMarkersHidden(Boolean(message.hidden));
      return { ok: true, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_EXPORT_PACKAGE") {
      await loadRecords();
      ensureAgentSelection();
      await exportAgentPackage();
      return { ok: true, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_AGENT_MARKDOWN") {
      await loadRecords();
      applyPanelAgentSelection(message.selectedIds);
      const selectedRecords = getAgentSelectedRecords();
      const selectedShots = selectedRecords.filter((record) => record.type === "screenshot" && record.previewImage);
      const currentIds = Array.isArray(message.currentIds)
        ? new Set(message.currentIds.map((id) => String(id)))
        : null;
      const sourceRecords = currentIds?.size
        ? records.filter((record) => currentIds.has(record.id))
        : selectedRecords;
      const markdown = exportAgentMarkdown(sourceRecords, {
        attachmentMap: buildAgentAttachmentMap(selectedShots),
        batchIndex: Number.isFinite(message.batchIndex) ? message.batchIndex : -1,
        batchCount: Number.isFinite(message.batchCount) ? message.batchCount : 1
      });
      return { ok: true, payload: markdown, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_AGENT_PACKAGE") {
      await loadRecords();
      applyPanelAgentSelection(message.selectedIds);
      await exportAgentPackage();
      return { ok: true, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_FEISHU_LOGIN") {
      await handleFeishuLogin();
      return { ok: true, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_FEISHU_SYNC") {
      const payload = await handleSyncFeishu();
      return { ok: true, payload, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_COLLAB_CREATE_ROOM") {
      const payload = await handleCollabCreateRoom(String(message.roundName || ""));
      return { ok: true, payload, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_COLLAB_JOIN_ROOM") {
      const payload = await handleCollabJoinRoom(String(message.roomId || ""));
      return { ok: true, payload, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_COLLAB_SYNC_ROOM") {
      const payload = await handleCollabSyncRoom();
      return { ok: true, payload, state: getPanelState() };
    }

    if (message.type === "VFS_PANEL_COLLAB_PULL_ROOM") {
      const payload = await handleCollabPullRoom();
      return { ok: true, payload, state: getPanelState() };
    }

    if (message.type === "VFS_LOCATE_RECORD") {
      locateRecordFromMessage(message.record);
      return { ok: true, state: getState() };
    }

    if (message.type === "VFS_TOGGLE_SIDEBAR") {
      ensureUi();
      sidebarOpen = !sidebarOpen;
      if (sidebarOpen) {
        await setReopenHidden(false);
      }
      renderAll();
      broadcastToChildFrames({ type: "VFS_MODE_CHANGED", mode, sidebarOpen, records });
      return { ok: true, state: getState() };
    }

    if (message.type === "VFS_EXPORT") {
      await loadRecords();
      const payload = message.format === "markdown" ? exportMarkdown() : exportJson();
      return { ok: true, payload, state: getState() };
    }

    if (message.type === "VFS_CLEAR") {
      await clearRecords();
      return { ok: true, state: getState() };
    }

    return { ok: false, error: "未知操作。" };
  }

  async function setMode(nextMode, options = {}) {
    const resolvedMode = MODES.includes(nextMode) ? nextMode : "read";
    const previousMode = mode;
    if (resolvedMode !== "read") {
      restoreSavedStyleComparison();
    }
    mode = resolvedMode;
    if (mode !== "dom") {
      clearSelection();
      clearHover();
    }
    if (isTopFrame()) {
      ensureUi();
      if (!options.keepSidebar) {
        sidebarOpen = mode === "off" ? false : true;
        if (sidebarOpen) {
          await setReopenHidden(false);
        }
      }
    }
    if (mode === "shot") {
      sidebarOpen = true;
      await setReopenHidden(false);
      renderChrome();
      openShotOverlay();
      await captureViewport();
    } else {
      closeShotOverlay();
      renderChrome();
    }
    if (isTopFrame()) {
      renderThreads();
      renderMarkers();
    }
    broadcastToChildFrames({ type: "VFS_MODE_CHANGED", mode, sidebarOpen, records });
    notifyPanelStateChanged();
    if (!options.silent) {
      showToast(modeMessage(mode));
      if (mode !== previousMode) {
        trackEvent("mode_changed", { mode });
      }
    }
  }

  function setSidebarVisibility(nextOpen) {
    sidebarOpen = Boolean(nextOpen);
    if (!sidebarOpen) {
      restoreSavedStyleComparison();
    }
    if (sidebarOpen && mode === "off") {
      mode = "read";
    }
    dockSidebarToRightEdge(!sidebarOpen);
    reopenHidden = false;
    renderAll();
    broadcastToChildFrames({ type: "VFS_MODE_CHANGED", mode, sidebarOpen, records });
    void storageSet({ [REOPEN_HIDDEN_STORAGE_KEY]: false }).catch(() => {});
  }

  function notifyPanelStateChanged() {
    if (!isTopFrame()) {
      return;
    }
    try {
      chrome.runtime.sendMessage({
        source: CONTENT_SOURCE,
        type: "VFS_PANEL_STATE_CHANGED",
        state: getPanelState()
      }, () => {
        void chrome.runtime.lastError;
      });
    } catch {
      // The native side panel may be closed; state will refresh on the next panel request.
    }
  }

  function forcePanelStateChanged() {
    notifyPanelStateChanged();
    requestAnimationFrame(() => notifyPanelStateChanged());
    setTimeout(() => notifyPanelStateChanged(), 120);
  }

  function notifyPanelRecordCommitted(record) {
    if (!isTopFrame() || !record) {
      return;
    }
    try {
      chrome.runtime.sendMessage({
        source: CONTENT_SOURCE,
        type: "VFS_PANEL_RECORD_COMMITTED",
        storageKey: storageKey(),
        record: clonePlainObject(record),
        count: records.length
      }, () => {
        void chrome.runtime.lastError;
      });
    } catch {
      // The full state/storage paths below remain the source of truth.
    }
  }

  async function commitRecord(record, options = {}) {
    activePageKey = activePageKey || currentPageIdentityKey();
    record = attachRecordPageMetadata(record);
    const previousRecords = records;
    const previousActiveId = activeId;
    records = records.filter((item) => item.id !== record.id);
    records.push(record);
    activeId = record.id;
    markRecordPendingCollabSync(record);
    const persisted = await persistRecordsSafely();
    if (!persisted) {
      records = previousRecords;
      activeId = previousActiveId;
      renderAll();
      return null;
    }
    notifyPanelRecordCommitted(record);
    broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
    renderAll();
    startMarkerTracking(1400);
    scheduleMarkerUpdate();
    forcePanelStateChanged();
    scheduleCollabSync();
    if (options.focus) {
      focusRecord(record.id);
    }
    const mentions = Array.isArray(record.mentions) ? record.mentions : [];
    trackEvent("comment_created", {
      comment_type: record.type === "screenshot" ? "screenshot" : "dom",
      has_mention: mentions.length > 0,
      mention_count: mentions.length,
      has_preview: Boolean(record.previewImage),
      has_style_edits: Boolean(record.styleEdits?.length)
    });
    if (mentions.length) {
      trackEvent("mention_created", {
        source: "comment",
        mention_count: mentions.length,
        comment_type: record.type === "screenshot" ? "screenshot" : "dom"
      });
    }
    return record;
  }

  function activeRecords() {
    const source = records.filter(Boolean);
    if (!activeTeamChatId()) {
      return source;
    }
    return source.filter((record) => {
      const status = String(record.collab?.status || "open");
      return collabShowResolved ? status === "resolved" : status !== "resolved" && status !== "deleted";
    });
  }

  function setPageContext(context = {}) {
    pageContext = {
      title: context.title || document.title || pageContext.title || "",
      url: context.url || location.href || pageContext.url || ""
    };
  }

  function currentPageUrl() {
    return location.href || pageContext.url || "";
  }

  function currentPageIdentityKey() {
    return normalizePageIdentityPart(currentPageUrl());
  }

  function legacyFramePageIdentityKey() {
    const base = currentPageIdentityKey();
    const frameUrl = primaryContentFrameUrl();
    const frame = frameUrl ? normalizePageIdentityPart(frameUrl) : "";
    return frame ? `${base}::frame=${frame}` : base;
  }

  function currentPageMetadata() {
    return {
      pageKey: currentPageIdentityKey(),
      pageTitle: pageContext.title || document.title || "未命名页面",
      url: currentPageUrl(),
      pageFrameUrl: primaryContentFrameUrl()
    };
  }

  function attachRecordPageMetadata(record) {
    if (!record || typeof record !== "object") {
      return record;
    }
    const page = currentPageMetadata();
    return {
      ...record,
      url: record.url || page.url,
      pageKey: record.pageKey || page.pageKey,
      pageTitle: record.pageTitle || page.pageTitle,
      pageFrameUrl: record.pageFrameUrl || page.pageFrameUrl
    };
  }

  function primaryContentFrameUrl() {
    if (!isTopFrame()) {
      return "";
    }
    const viewportRect = {
      x: 0,
      y: 0,
      width: Math.max(1, window.innerWidth || 1),
      height: Math.max(1, window.innerHeight || 1)
    };
    const viewportArea = rectArea(viewportRect);
    const candidates = Array.from(document.querySelectorAll("iframe"))
      .map((frame) => {
        const url = String(frame.src || "").trim();
        if (!url || /^about:|^javascript:/i.test(url) || isVfsUi(frame)) {
          return null;
        }
        if (normalizePageIdentityPart(url) === normalizePageIdentityPart(currentPageUrl())) {
          return null;
        }
        const rect = frame.getBoundingClientRect();
        const visibleArea = rectOverlapArea(rectToObject(rect), viewportRect);
        const minArea = Math.min(180000, viewportArea * 0.2);
        if (visibleArea < minArea || rect.width < 240 || rect.height < 180) {
          return null;
        }
        return { url, area: visibleArea };
      })
      .filter(Boolean)
      .sort((a, b) => b.area - a.area);
    return candidates[0]?.url || "";
  }

  function normalizePageIdentityPart(value) {
    const text = String(value || "").trim();
    if (!text) {
      return "";
    }
    try {
      const url = new URL(text, location.href);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => url.searchParams.delete(key));
      return url.href.replace(/\/$/, "");
    } catch {
      return text.replace(/\/$/, "");
    }
  }

  function watchPageIdentityChanges() {
    if (!isTopFrame()) {
      return;
    }
    window.addEventListener("hashchange", () => schedulePageIdentityCheck(40));
    window.addEventListener("popstate", () => schedulePageIdentityCheck(40));
    window.addEventListener("load", () => schedulePageIdentityCheck(140));
    if (!window.__VFS_PAGE_IDENTITY_HISTORY_PATCHED__) {
      window.__VFS_PAGE_IDENTITY_HISTORY_PATCHED__ = true;
      ["pushState", "replaceState"].forEach((name) => {
        const original = history[name];
        if (typeof original !== "function") {
          return;
        }
        try {
          history[name] = function patchedHistoryState(...args) {
            const result = original.apply(this, args);
            schedulePageIdentityCheck(40);
            return result;
          };
        } catch {
          // Some pages lock history methods; hash/popstate/load still cover normal navigation.
        }
      });
    }
  }

  function schedulePageIdentityCheck(delay = 80) {
    if (!isTopFrame()) {
      return;
    }
    clearTimeout(pageIdentityTimer);
    pageIdentityTimer = setTimeout(() => {
      pageIdentityTimer = null;
      refreshPageIdentityIfChanged().catch(() => {});
    }, delay);
  }

  async function refreshPageIdentityIfChanged() {
    const nextKey = currentPageIdentityKey();
    if (!activePageKey) {
      activePageKey = nextKey;
      return;
    }
    if (nextKey === activePageKey) {
      return;
    }
    await persistRecordsSafely();
    activePageKey = nextKey;
    pageContext = {
      title: document.title || "",
      url: location.href || pageContext.url || ""
    };
    activeId = "";
    agentDeliveryOpen = false;
    agentSelectedIds = new Set();
    agentBatchIndex = 0;
    collabState = null;
    await loadCollabState();
    await loadRecords();
    renderAll();
    broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
    notifyPanelStateChanged();
    void refreshCollabWorkspaceOverview({ silent: true });
  }

  function getState() {
    return {
      buildId: CONTENT_BUILD_ID,
      mode,
      sidebarOpen,
      reopenHidden,
      markersHidden,
      count: records.length,
      pageTitle: pageContext.title || document.title,
      url: currentPageUrl(),
      storageKey: storageKey()
    };
  }

  function getPanelState() {
    const loggedIn = Boolean(feishuSessionToken && feishuUser);
    return {
      ...getState(),
      records,
      author: currentAuthor,
      nativeSidePanel: NATIVE_SIDEPANEL_BUILD,
      feishu: {
        loggedIn,
        busy: feishuBusy,
        busyAction: feishuBusyAction,
        pendingText: feishuPendingText,
        userName: loggedIn ? displayFeishuUserName(feishuUser) : "",
        user: feishuUser || null
      },
      collab: {
        ...(collabState || {}),
        busy: collabBusy,
        backgroundBusy: collabBackgroundBusy,
        busyAction: collabBusyAction
      }
    };
  }

  function iconSvg(name, options = {}) {
    const path = ICON_PATHS[name] || "";
    const transform = options.mirror ? " transform=\"translate(1024 0) scale(-1 1)\"" : "";
    return `<svg class="vfs-icon-svg" viewBox="0 0 1024 1024" aria-hidden="true" focusable="false"><g${transform}><path d="${path}" fill="currentColor"></path></g></svg>`;
  }

  function toolbarIcon(name, options = {}) {
    const paint = options.filled
      ? 'fill="currentColor" stroke="none"'
      : 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
    return `<svg class="vfs-toolbar-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" ${paint}>${TOOLBAR_ICONS[name] || ""}</svg>`;
  }

  function mentionEditorMarkup(scope, placeholder) {
    return `<div class="vfs-mention-composer">
      <div class="vfs-mention-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="${placeholder}" data-placeholder="${placeholder}" data-vfs-mention-editor="${scope}" spellcheck="true"></div>
      <div class="vfs-mention-picker" data-vfs-mention-scope="${scope}">
      <button class="vfs-mention-trigger" type="button" data-vfs-action="toggle-mention-picker" data-vfs-mention-scope="${scope}" aria-expanded="false" title="提及群成员" aria-label="提及群成员">@</button>
      <div class="vfs-mention-menu" role="listbox" aria-label="选择要提醒的群成员" hidden></div>
      </div>
    </div>`;
  }

  const FEIBIAO_BUBBLE_PATH = "M484 235h293c25 0 43 17 40 45-5 51-11 101-16 150-6 62-14 134-36 197-30 84-116 151-215 166-87 13-176 0-240-52-60-45-93-113-100-193-7-94 24-172 76-226 53-55 119-87 198-87Z";

  function feibiaoBubbleSvg(className) {
    return `<svg class="${className}" viewBox="180 205 670 620" aria-hidden="true" focusable="false"><path fill="currentColor" d="${FEIBIAO_BUBBLE_PATH}"></path></svg>`;
  }

  function feibiaoBrandMarkSvg(className = "vfs-brand-mark-svg") {
    return `<svg class="${className}" viewBox="180 205 670 620" aria-hidden="true" focusable="false"><defs><linearGradient id="vfs-brand-gradient" x1="255" y1="270" x2="795" y2="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#A94DDB"></stop><stop offset=".5" stop-color="#EE568C"></stop><stop offset="1" stop-color="#FF704F"></stop></linearGradient></defs><path fill="url(#vfs-brand-gradient)" d="${FEIBIAO_BUBBLE_PATH}"></path><rect x="357" y="445" width="89" height="90" rx="3" fill="#fff"></rect><path d="M503 582c49 1 89-37 91-88" fill="none" stroke="#fff" stroke-width="31" stroke-linecap="round"></path></svg>`;
  }

  function setIconButton(button, name, label, options = {}) {
    button.classList.add("is-icon-only");
    button.title = label;
    button.setAttribute("aria-label", label);
    button.replaceChildren();
    button.insertAdjacentHTML("afterbegin", iconSvg(name, options));
  }

  function ensureUi() {
    if (!isTopFrame()) {
      removeEmbeddedMarkerLayers();
      return;
    }
    if (root) {
      removeStartupLoader();
      return;
    }

    removeStartupLoader();

    root = document.createElement("div");
    root.className = mode === "off" ? "vfs-root is-off" : "vfs-root";
    root.dataset.vfsBuild = CONTENT_BUILD_ID;
    root.innerHTML = `
      <nav class="vfs-workbar" aria-label="飞标工具栏">
        <button class="vfs-workbar-grip" type="button" data-vfs-drag-handle data-vfs-tooltip="拖动工具栏" aria-label="移动工具栏">${toolbarIcon("grip")}</button>
        <div class="vfs-workbar-group" aria-label="走查模式">
          <button class="vfs-workbar-button" type="button" data-vfs-action="toolbar-read" data-vfs-tooltip="浏览标记" aria-label="浏览">${toolbarIcon("eye")}</button>
          <button class="vfs-workbar-button" type="button" data-vfs-action="toolbar-comment" data-vfs-tooltip="DOM 标注" aria-label="评论">${toolbarIcon("comment")}</button>
          <button class="vfs-workbar-button" type="button" data-vfs-action="toolbar-shot" data-vfs-tooltip="截图批注" aria-label="截图批注">${toolbarIcon("camera")}</button>
        </div>
        <span class="vfs-workbar-divider" aria-hidden="true"></span>
        <button class="vfs-workbar-button vfs-workbar-agent" type="button" data-vfs-action="open-agent" data-vfs-tooltip="整理给 Agent" aria-label="整理给 Agent">${toolbarIcon("sparkles", { filled: true })}</button>
        <button class="vfs-workbar-button" type="button" data-vfs-action="toggle-theme" data-vfs-tooltip="切换明暗模式" aria-label="切换深色">${toolbarIcon("theme")}</button>
        <button class="vfs-workbar-button" type="button" data-vfs-action="toggle-sidebar" data-vfs-tooltip="收起 / 展开面板" aria-label="收起右侧浮层">${toolbarIcon("collapse")}</button>
        <button class="vfs-workbar-button vfs-close-control" type="button" data-vfs-action="close-workbench" data-vfs-tooltip="退出飞标" aria-label="退出飞标">${toolbarIcon("close")}</button>
      </nav>
      <aside class="vfs-sidebar" aria-label="飞标标注">
        <div class="vfs-head">
          <div class="vfs-title">
            <button class="vfs-panel-grip" type="button" data-vfs-panel-drag-handle title="移动标注列表" aria-label="移动标注列表">${toolbarIcon("grip")}</button>
            <span class="vfs-brand-mark">${feibiaoBrandMarkSvg()}</span>
            <h2>飞标</h2>
          </div>
          <div class="vfs-head-actions">
            <button class="vfs-icon-button vfs-clear-all vfs-delete-glyph is-icon-only" type="button" data-vfs-action="clear-all" title="清空全部批注" aria-label="清空全部批注"></button>
            <button class="vfs-icon-button is-icon-only" type="button" data-vfs-action="close-sidebar" title="收起侧栏" aria-label="收起侧栏">${iconSvg("collapse", { mirror: true })}</button>
          </div>
        </div>
        <section class="vfs-collab" aria-label="协同批注">
          <div class="vfs-collab-main">
            <button class="vfs-collab-user" type="button" data-vfs-action="toggle-account-menu" title="飞书账号" aria-label="飞书账号" disabled>
              <span class="vfs-collab-avatar">飞</span>
              <span class="vfs-collab-text">
                <strong>协同</strong>
                <small>未登录</small>
              </span>
            </button>
            <div class="vfs-collab-side">
              <button class="vfs-collab-login" type="button" data-vfs-action="login-feishu">登录飞书</button>
              <div class="vfs-collab-members" aria-label="评审空间成员"></div>
            </div>
          </div>
          <div class="vfs-account-menu" hidden aria-label="飞书账号菜单">
            <button type="button" data-vfs-action="switch-feishu-account">切换账号</button>
            <button class="is-danger" type="button" data-vfs-action="logout-feishu">退出登录</button>
          </div>
          <div class="vfs-workspace-resources" hidden aria-label="Team 资源与批注状态">
            <button class="vfs-workspace-resource vfs-collab-tooltip-anchor" type="button" data-vfs-action="open-workspace-base" data-vfs-tooltip="多维表格批注库" disabled>${toolbarIcon("package")}<span>批注库</span></button>
            <span class="vfs-workspace-resource-divider" aria-hidden="true"></span>
            <div class="vfs-workspace-resource-group is-status-filters" role="group" aria-label="批注处理状态">
              <button class="vfs-workspace-resource" type="button" data-vfs-action="show-open">${toolbarIcon("pending")}<span data-vfs-open-label>待处理</span></button>
              <button class="vfs-workspace-resource" type="button" data-vfs-action="show-resolved">${toolbarIcon("check")}<span data-vfs-resolved-label>已解决</span></button>
            </div>
          </div>
          <div class="vfs-collab-round-switcher" hidden>
            <span class="vfs-collab-status vfs-collab-tooltip-anchor is-disconnected" data-vfs-workspace-status data-vfs-tooltip="Team 批注库未连接" role="status" tabindex="0" aria-label="Team 批注库未连接"></span>
            <span class="vfs-team-select-wrap vfs-collab-tooltip-anchor" data-vfs-tooltip="选择要保存批注的飞书群聊">
              <button class="vfs-team-select-trigger" type="button" data-vfs-team-select data-vfs-action="toggle-team-select" aria-label="选择 Team 群聊" aria-haspopup="listbox" aria-expanded="false" aria-controls="vfs-team-select-menu">
                <span class="vfs-team-select-avatar" data-vfs-team-select-avatar aria-hidden="true">群</span>
                <span class="vfs-team-select-label" data-vfs-team-select-label>选择群聊</span>
                <span class="vfs-team-select-chevron" aria-hidden="true"></span>
              </button>
              <div class="vfs-team-select-menu" id="vfs-team-select-menu" data-vfs-team-menu role="listbox" aria-label="可用群聊" hidden></div>
            </span>
            <button class="vfs-icon-button vfs-collab-row-action is-icon-only" type="button" data-vfs-action="refresh-team-list" title="刷新批注与群聊列表" aria-label="刷新批注与群聊列表">${toolbarIcon("refresh")}</button>
            <button class="vfs-icon-button vfs-collab-row-action is-icon-only" type="button" data-vfs-action="share-team-page" title="分享到当前群聊" aria-label="分享到当前群聊">${toolbarIcon("share")}</button>
          </div>
          <div class="vfs-collab-create-row">
            <small data-vfs-team-help>先把飞标机器人加入常用群聊</small>
          </div>
        </section>
        <input class="vfs-json-input" type="file" accept=".json,application/json" aria-hidden="true">
        <div class="vfs-list"></div>
        <div class="vfs-foot">
          <button class="vfs-deliver-button" type="button" data-vfs-action="open-agent">整理给 Agent</button>
          <button class="vfs-icon-button vfs-foot-cloud is-icon-only" type="button" data-vfs-action="sync-feishu" data-vfs-tooltip="上传至云文档" title="上传至云文档" aria-label="上传至云文档">${toolbarIcon("cloudUpload")}</button>
        </div>
        <span class="vfs-panel-resize is-n" data-vfs-panel-resize="n" aria-hidden="true"></span>
        <span class="vfs-panel-resize is-e" data-vfs-panel-resize="e" aria-hidden="true"></span>
        <span class="vfs-panel-resize is-s" data-vfs-panel-resize="s" aria-hidden="true"></span>
        <span class="vfs-panel-resize is-w" data-vfs-panel-resize="w" aria-hidden="true"></span>
        <span class="vfs-panel-resize is-ne" data-vfs-panel-resize="ne" aria-hidden="true"></span>
        <span class="vfs-panel-resize is-se" data-vfs-panel-resize="se" aria-hidden="true"></span>
        <span class="vfs-panel-resize is-sw" data-vfs-panel-resize="sw" aria-hidden="true"></span>
        <span class="vfs-panel-resize is-nw" data-vfs-panel-resize="nw" aria-hidden="true"></span>
      </aside>
      <section class="vfs-composer vfs-dom-popover" aria-label="DOM 批注输入">
        <div class="vfs-composer-label">已选择元素</div>
        <div class="vfs-composer-tabs" role="tablist" aria-label="标注方式">
          <button class="vfs-composer-tab is-active" type="button" data-vfs-action="composer-comment" role="tab" aria-selected="true">评论</button>
          <button class="vfs-composer-tab" type="button" data-vfs-action="composer-style" role="tab" aria-selected="false">试改</button>
        </div>
        <div class="vfs-comment-editor">
          ${mentionEditorMarkup("dom", "输入评论，键入 @ 提及成员")}
        </div>
        <div class="vfs-style-editor" hidden>
          <textarea class="vfs-style-text" data-vfs-style="text" placeholder="直接修改文字内容"></textarea>
          <div class="vfs-style-grid">
            <div class="vfs-style-field" data-vfs-style-field="font-size"><span class="vfs-style-field-icon" data-vfs-style-help="字号：调整文字大小">Aa</span><input data-vfs-style="font-size" data-vfs-preset="font-size" type="text" inputmode="decimal" autocomplete="off" aria-label="字号"><button class="vfs-style-preset-trigger" type="button" data-vfs-preset-trigger="font-size" title="选择字号预设" aria-label="选择字号预设"></button></div>
            <div class="vfs-style-field" data-vfs-style-field="font-weight"><span class="vfs-style-field-icon" data-vfs-style-help="字重：调整文字粗细">B</span><input data-vfs-style="font-weight" data-vfs-preset="font-weight" type="text" inputmode="numeric" autocomplete="off" aria-label="字重"><button class="vfs-style-preset-trigger" type="button" data-vfs-preset-trigger="font-weight" title="选择字重预设" aria-label="选择字重预设"></button></div>
            <div class="vfs-style-field is-color" data-vfs-style-field="color"><span class="vfs-style-field-icon" data-vfs-style-help="文字颜色：调整文字本身的颜色">●</span><input data-vfs-style="color" type="text" spellcheck="false" autocomplete="off" aria-label="文字颜色值"><input class="vfs-style-color-picker" data-vfs-style="color" type="color" aria-label="打开文字调色盘"></div>
            <div class="vfs-style-field is-color" data-vfs-style-field="background-color"><span class="vfs-style-field-icon" data-vfs-style-help="背景颜色：调整元素底色">■</span><input data-vfs-style="background-color" type="text" spellcheck="false" autocomplete="off" aria-label="背景颜色值"><input class="vfs-style-color-picker" data-vfs-style="background-color" type="color" aria-label="打开背景调色盘"></div>
            <div class="vfs-style-field" data-vfs-style-field="opacity"><span class="vfs-style-field-icon" data-vfs-style-help="透明度：调整元素的可见程度">◐</span><input data-vfs-style="opacity" data-vfs-preset="opacity" type="text" inputmode="decimal" autocomplete="off" aria-label="透明度"><button class="vfs-style-preset-trigger" type="button" data-vfs-preset-trigger="opacity" title="选择透明度预设" aria-label="选择透明度预设"></button></div>
            <div class="vfs-style-field" data-vfs-style-field="padding"><span class="vfs-style-field-icon" data-vfs-style-help="内边距：调整内容与边缘的距离">□</span><input data-vfs-style="padding" data-vfs-preset="padding" type="text" inputmode="decimal" autocomplete="off" aria-label="内边距"><button class="vfs-style-preset-trigger" type="button" data-vfs-preset-trigger="padding" title="选择内边距预设" aria-label="选择内边距预设"></button></div>
            <div class="vfs-style-field" data-vfs-style-field="border-radius"><span class="vfs-style-field-icon" data-vfs-style-help="圆角：调整元素边角弧度">◻</span><input data-vfs-style="border-radius" data-vfs-preset="border-radius" type="text" inputmode="decimal" autocomplete="off" aria-label="圆角"><button class="vfs-style-preset-trigger" type="button" data-vfs-preset-trigger="border-radius" title="选择圆角预设" aria-label="选择圆角预设"></button></div>
            <div class="vfs-style-field is-select" data-vfs-style-field="text-align"><span class="vfs-style-field-icon" data-vfs-style-help="对齐：调整文字的横向排列">≡</span><select data-vfs-style="text-align" aria-label="文字对齐"><option value="left">L</option><option value="center">C</option><option value="right">R</option></select></div>
          </div>
        </div>
        <div class="vfs-actions">
          <button class="vfs-icon-button vfs-close-control is-icon-only" type="button" data-vfs-action="cancel-dom" title="取消" aria-label="取消">${toolbarIcon("close")}</button>
          <button class="vfs-button is-primary" type="button" data-vfs-action="save-dom">保存</button>
        </div>
      </section>
      <div class="vfs-style-menu" hidden></div>
      <div class="vfs-style-help" role="tooltip" hidden></div>
      <div class="vfs-reopen-wrap" aria-label="飞标入口">
        <button class="vfs-reopen" type="button" data-vfs-action="open-sidebar" title="展开飞标标注" aria-label="展开飞标标注">${toolbarIcon("expandLeft")}</button>
        <button class="vfs-reopen-dismiss vfs-close-control" type="button" data-vfs-action="close-workbench" title="退出飞标，保留记录" aria-label="退出飞标，保留记录">${toolbarIcon("close")}</button>
      </div>
      <section class="vfs-shot" aria-label="截图标注层">
        <div class="vfs-shotbar">
          <span class="vfs-shot-title" aria-live="polite">正在准备截图...</span>
          <button class="vfs-button vfs-shot-tool is-primary" type="button" data-vfs-tool="box" title="框选区域" aria-label="框选区域">${toolbarIcon("box")}</button>
          <button class="vfs-button vfs-shot-tool" type="button" data-vfs-tool="arrow" title="箭头" aria-label="箭头">${toolbarIcon("arrow")}</button>
          <button class="vfs-button vfs-shot-tool" type="button" data-vfs-tool="pen" title="画笔" aria-label="画笔">${toolbarIcon("pen")}</button>
          <span class="vfs-shotbar-divider" aria-hidden="true"></span>
          <button class="vfs-button vfs-shot-secondary" type="button" data-vfs-action="recapture" title="重新截屏" aria-label="重新截屏">${toolbarIcon("refresh")}</button>
          <button class="vfs-button vfs-shot-finish" type="button" data-vfs-action="finish-shot" disabled>${toolbarIcon("check")}<span>写批注</span></button>
          <button class="vfs-button vfs-shot-secondary vfs-close-control" type="button" data-vfs-action="exit-shot" title="退出截图" aria-label="退出截图">${toolbarIcon("close")}</button>
        </div>
        <div class="vfs-shot-stage">
          <div class="vfs-shot-placeholder">截图预览会显示在这里。</div>
          <img class="vfs-shot-image" alt="当前视口截图">
          <canvas class="vfs-shot-canvas"></canvas>
        </div>
      </section>
      <section class="vfs-shot-popover" aria-label="截图批注输入">
        <div class="vfs-composer-label">截图批注</div>
        ${mentionEditorMarkup("shot", "输入截图批注，键入 @ 提及成员")}
        <div class="vfs-actions">
          <button class="vfs-button" type="button" data-vfs-action="cancel-shot">取消</button>
          <button class="vfs-button is-primary" type="button" data-vfs-action="save-shot">保存</button>
        </div>
      </section>
      <section class="vfs-edit-popover" aria-label="编辑批注">
        <div class="vfs-composer-label">编辑批注</div>
        ${mentionEditorMarkup("reply", "输入回复，键入 @ 提及成员")}
        <div class="vfs-actions">
          <button class="vfs-button" type="button" data-vfs-action="cancel-edit">取消</button>
          <button class="vfs-button is-primary" type="button" data-vfs-action="save-edit">保存</button>
        </div>
      </section>
      <section class="vfs-image-viewer" data-vfs-action="image-viewer-backdrop" aria-label="批注图片预览" aria-hidden="true">
        <div class="vfs-image-viewer-panel">
          <div class="vfs-image-viewer-head">
            <span class="vfs-image-viewer-title">批注图片</span>
            <button class="vfs-icon-button vfs-close-control is-icon-only" type="button" data-vfs-action="close-image-viewer" title="关闭图片预览" aria-label="关闭图片预览">${toolbarIcon("close")}</button>
          </div>
          <img class="vfs-image-viewer-img" alt="批注图片大图">
        </div>
      </section>
      <section class="vfs-share-confirm" data-vfs-action="share-confirm-backdrop" aria-label="确认分享" aria-hidden="true">
        <div class="vfs-share-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="vfs-share-confirm-title">
          <header class="vfs-share-confirm-head">
            <strong id="vfs-share-confirm-title">分享到群聊</strong>
            <button class="vfs-icon-button vfs-share-confirm-close is-icon-only" type="button" data-vfs-action="cancel-share-team-page" title="关闭" aria-label="关闭">${toolbarIcon("close")}</button>
          </header>
          <div class="vfs-share-confirm-body">
            <div class="vfs-share-confirm-recipient">
              <span class="vfs-share-confirm-label">群聊</span>
              <div class="vfs-share-confirm-team">
                <span class="vfs-share-confirm-team-avatar" data-vfs-share-team-avatar aria-hidden="true">群</span>
                <strong data-vfs-share-team-name>当前群聊</strong>
              </div>
            </div>
            <article class="vfs-share-page-preview">
              <div class="vfs-share-page-preview-media is-loading" data-vfs-share-preview-media>
                <img data-vfs-share-preview-image alt="当前网页预览" hidden>
                <span class="vfs-share-page-preview-placeholder" aria-hidden="true">${toolbarIcon("camera")}</span>
              </div>
              <div class="vfs-share-page-preview-meta">
                <strong data-vfs-share-page-title>未命名页面</strong>
                <small data-vfs-share-page-url></small>
              </div>
            </article>
            <div class="vfs-share-note">
              ${mentionEditorMarkup("share", "添加备注，键入 @ 提及成员")}
            </div>
          </div>
          <footer class="vfs-share-confirm-foot">
            <button class="vfs-button" type="button" data-vfs-action="cancel-share-team-page">取消</button>
            <button class="vfs-button is-primary" type="button" data-vfs-action="confirm-share-team-page">分享</button>
          </footer>
        </div>
      </section>
      <section class="vfs-agent-modal" aria-label="Agent 修改清单" aria-hidden="true">
        <div class="vfs-agent-dialog" role="dialog" aria-modal="true" aria-label="Agent 修改清单">
          <header class="vfs-agent-modal-head">
            <strong class="vfs-agent-modal-title">整理给 Agent</strong>
            <div class="vfs-agent-format" role="tablist" aria-label="Markdown 格式">
              <button class="is-active" type="button" data-vfs-action="agent-format-compact" role="tab" aria-selected="true">精简</button>
              <button type="button" data-vfs-action="agent-format-full" role="tab" aria-selected="false">完整</button>
            </div>
            <button class="vfs-icon-button vfs-close-control is-icon-only" type="button" data-vfs-action="agent-close" title="关闭" aria-label="关闭">${toolbarIcon("close")}</button>
          </header>
          <div class="vfs-agent-workspace">
            <section class="vfs-agent-preview" aria-label="Markdown 预览">
              <textarea class="vfs-agent-markdown" aria-label="Markdown 修改清单" spellcheck="false"></textarea>
              <div class="vfs-agent-modal-attachments"></div>
            </section>
          </div>
          <footer class="vfs-agent-modal-foot">
            <button class="vfs-agent-action" type="button" data-vfs-action="agent-export-package" title="导出 Markdown 与截图附件" aria-label="导出 Markdown 与截图附件">${toolbarIcon("package")}<span>导出附件包</span></button>
            <button class="vfs-agent-action" type="button" data-vfs-action="agent-send-trae" title="发送到 Trae" aria-label="发送到 Trae">${toolbarIcon("sparkles", { filled: true })}<span>发送到 Trae</span></button>
            <button class="vfs-agent-action is-primary" type="button" data-vfs-action="agent-copy-md" title="复制给 Agent" aria-label="复制给 Agent">${toolbarIcon("copy")}<span>复制给 Agent</span></button>
          </footer>
        </div>
      </section>
      <div class="vfs-toast" role="status"></div>
    `;

    ensureMarkerLayer();
    document.documentElement.append(root, markerLayer);

    workbar = root.querySelector(".vfs-workbar");
    shotbar = root.querySelector(".vfs-shotbar");
    sidebar = root.querySelector(".vfs-sidebar");
    jsonImportInput = root.querySelector(".vfs-json-input");
    composer = root.querySelector(".vfs-composer");
    composerLabel = root.querySelector(".vfs-composer-label");
    commentInput = composer.querySelector("[data-vfs-mention-editor='dom']");
    styleTextInput = composer.querySelector(".vfs-style-text");
    stylePresetMenu = root.querySelector(".vfs-style-menu");
    styleHelpTooltip = root.querySelector(".vfs-style-help");
    threadList = root.querySelector(".vfs-list");
    toastNode = root.querySelector(".vfs-toast");
    shotOverlay = root.querySelector(".vfs-shot");
    shotStage = root.querySelector(".vfs-shot-stage");
    shotImage = root.querySelector(".vfs-shot-image");
    shotCanvas = root.querySelector(".vfs-shot-canvas");
    shotCtx = shotCanvas.getContext("2d");
    shotTitle = root.querySelector(".vfs-shot-title");
    shotPopover = root.querySelector(".vfs-shot-popover");
    shotCommentInput = shotPopover.querySelector("[data-vfs-mention-editor='shot']");
    editPopover = root.querySelector(".vfs-edit-popover");
    editLabel = editPopover.querySelector(".vfs-composer-label");
    editInput = editPopover.querySelector("[data-vfs-mention-editor='reply']");
    imageViewer = root.querySelector(".vfs-image-viewer");
    imageViewerImg = root.querySelector(".vfs-image-viewer-img");
    imageViewerTitle = root.querySelector(".vfs-image-viewer-title");
    shareConfirmModal = root.querySelector(".vfs-share-confirm");
    shareNoteInput = shareConfirmModal.querySelector("[data-vfs-mention-editor='share']");
    agentModal = root.querySelector(".vfs-agent-modal");
    agentModalMarkdown = root.querySelector(".vfs-agent-markdown");
    agentModalMarkdown.addEventListener("input", () => {
      agentMarkdownDraft = agentModalMarkdown.value;
      const meta = agentModal?.querySelector(".vfs-agent-markdown-meta");
      if (meta) {
        meta.textContent = agentMarkdownDraft ? `${formatAgentTextCount(agentMarkdownDraft.length)} 字符` : "暂无内容";
      }
    });

    bindMentionEditor(commentInput, "dom");
    bindMentionEditor(shotCommentInput, "shot");
    bindMentionEditor(editInput, "reply");
    bindMentionEditor(shareNoteInput, "share");
    commentInput.addEventListener("keydown", handleDomComposerKeyDown, true);
    commentInput.addEventListener("keyup", handleDomComposerKeyUp, true);
    shotCommentInput.addEventListener("keydown", handleShotComposerKeyDown, true);
    shotCommentInput.addEventListener("keyup", handleShotComposerKeyUp, true);
    bindDirectAction(shotPopover.querySelector("[data-vfs-action='save-shot']"), saveShotRecord);
    bindDirectAction(shotPopover.querySelector("[data-vfs-action='cancel-shot']"), cancelShotComposer);
    bindDirectAction(composer.querySelector("[data-vfs-action='save-dom']"), saveDomRecord);
    bindDirectAction(composer.querySelector("[data-vfs-action='cancel-dom']"), cancelDomSelection);
    root.addEventListener("click", handleUiClick, true);
    root.addEventListener("focusin", handleStylePresetFocusIn, true);
    root.addEventListener("pointerdown", handleStylePresetPointerDown, true);
    root.addEventListener("pointerover", handleStyleHelpPointerOver, true);
    root.addEventListener("pointerout", handleStyleHelpPointerOut, true);
    stylePresetMenu?.addEventListener("pointerdown", handleStylePresetOptionPointerDown, true);
    root.querySelectorAll("[data-vfs-style]").forEach((input) => {
      input.addEventListener("input", handleStyleInput);
      input.addEventListener("change", handleStyleInput);
    });
    bindWorkbarDrag();
    bindSidebarDrag();
    bindSidebarResize();
    jsonImportInput.addEventListener("change", handleJsonImportChange);
    shotCanvas.addEventListener("pointerdown", handleShotPointerDown);
    shotCanvas.addEventListener("pointermove", handleShotPointerMove);
    shotCanvas.addEventListener("pointerup", handleShotPointerUp);
    shotCanvas.addEventListener("pointercancel", cancelShotDraft);
    shotOverlay.addEventListener("wheel", handleShotWheel, { passive: false });
    shotImage.addEventListener("load", syncShotCanvasToImage);
    requestAnimationFrame(() => positionShotbarFromWorkbar({ ensureAbove: true }));
  }

  function removeStartupLoader() {
    try {
      window.__VFS_STARTUP_LOADER__?.dispose?.();
    } catch {
      document.getElementById("vfs-startup-host")?.remove();
    }
  }

  function bindDirectAction(button, handler) {
    if (!button || typeof handler !== "function") {
      return;
    }
    const run = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      clearConfirmState();
      void handler();
    };
    button.addEventListener("pointerdown", run, true);
    button.addEventListener("click", run, true);
  }

  function bindWorkbarDrag() {
    const grip = workbar?.querySelector("[data-vfs-drag-handle]");
    if (!grip || !workbar) {
      return;
    }
    grip.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }
      const rect = workbar.getBoundingClientRect();
      if (mode === "shot") {
        shotbarAutoShiftOrigin = null;
      }
      toolbarDragState = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
      };
      workbar.style.setProperty("left", `${Math.round(rect.left)}px`, "important");
      workbar.style.setProperty("top", `${Math.round(rect.top)}px`, "important");
      workbar.style.setProperty("transform", "none", "important");
      grip.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    }, true);

    const move = (event) => {
      if (!toolbarDragState || event.pointerId !== toolbarDragState.pointerId || !workbar) {
        return;
      }
      const rect = workbar.getBoundingClientRect();
      const left = clamp(event.clientX - toolbarDragState.offsetX, 8, Math.max(8, window.innerWidth - rect.width - 8));
      const shotbarReserve = mode === "shot" ? (shotbar?.offsetHeight || 44) + 16 : 8;
      const top = clamp(event.clientY - toolbarDragState.offsetY, shotbarReserve, Math.max(shotbarReserve, window.innerHeight - rect.height - 8));
      workbar.style.setProperty("left", `${Math.round(left)}px`, "important");
      workbar.style.setProperty("top", `${Math.round(top)}px`, "important");
      positionShotbarFromWorkbar();
      event.preventDefault();
    };
    const end = (event) => {
      if (!toolbarDragState || event.pointerId !== toolbarDragState.pointerId) {
        return;
      }
      toolbarDragState = null;
      positionShotbarFromWorkbar();
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", end, true);
    window.addEventListener("pointercancel", end, true);
  }

  function positionShotbarFromWorkbar(options = {}) {
    if (!shotbar || !workbar || mode !== "shot" || !shotOverlay?.classList.contains("is-visible")) {
      return;
    }
    const shotbarRect = shotbar.getBoundingClientRect();
    if (!shotbarRect.width || !shotbarRect.height) {
      return;
    }
    const margin = 8;
    const gap = 8;
    let workbarRect = workbar.getBoundingClientRect();
    let above = workbarRect.top - shotbarRect.height - gap;
    if (options.ensureAbove && above < margin) {
      if (!shotbarAutoShiftOrigin) {
        shotbarAutoShiftOrigin = ["left", "top", "transform"].reduce((origin, property) => {
          origin[property] = {
            value: workbar.style.getPropertyValue(property),
            priority: workbar.style.getPropertyPriority(property)
          };
          return origin;
        }, {});
      }
      const shiftedTop = clamp(
        margin + shotbarRect.height + gap,
        margin,
        Math.max(margin, window.innerHeight - workbarRect.height - margin)
      );
      workbar.style.setProperty("left", `${Math.round(workbarRect.left)}px`, "important");
      workbar.style.setProperty("top", `${Math.round(shiftedTop)}px`, "important");
      workbar.style.setProperty("transform", "none", "important");
      workbarRect = workbar.getBoundingClientRect();
      above = workbarRect.top - shotbarRect.height - gap;
    }
    const left = clamp(
      workbarRect.left + (workbarRect.width - shotbarRect.width) / 2,
      margin,
      Math.max(margin, window.innerWidth - shotbarRect.width - margin)
    );
    const below = workbarRect.bottom + gap;
    const top = above >= margin
      ? above
      : clamp(below, margin, Math.max(margin, window.innerHeight - shotbarRect.height - margin));
    shotbar.style.setProperty("left", `${Math.round(left)}px`, "important");
    shotbar.style.setProperty("top", `${Math.round(top)}px`, "important");
    shotbar.style.setProperty("right", "auto", "important");
    shotbar.style.setProperty("bottom", "auto", "important");
    shotbar.classList.toggle("is-guide-left", window.innerWidth - (left + shotbarRect.width) < 250 && left > 250);
  }

  function restoreWorkbarAfterShot() {
    if (!shotbarAutoShiftOrigin || !workbar) {
      shotbarAutoShiftOrigin = null;
      return;
    }
    Object.entries(shotbarAutoShiftOrigin).forEach(([property, state]) => {
      if (state.value) {
        workbar.style.setProperty(property, state.value, state.priority);
      } else {
        workbar.style.removeProperty(property);
      }
    });
    shotbarAutoShiftOrigin = null;
  }

  function bindSidebarDrag() {
    const handle = sidebar?.querySelector(".vfs-title");
    if (!handle || !sidebar) {
      return;
    }
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target?.closest?.(".vfs-brand-mark")) {
        return;
      }
      const rect = sidebar.getBoundingClientRect();
      sidebarDragState = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
      };
      sidebar.style.setProperty("left", `${Math.round(rect.left)}px`, "important");
      sidebar.style.setProperty("top", `${Math.round(rect.top)}px`, "important");
      sidebar.style.setProperty("right", "auto", "important");
      sidebar.style.setProperty("bottom", "auto", "important");
      handle.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    }, true);
    const move = (event) => {
      if (!sidebarDragState || event.pointerId !== sidebarDragState.pointerId || !sidebar) {
        return;
      }
      const rect = sidebar.getBoundingClientRect();
      const left = clamp(event.clientX - sidebarDragState.offsetX, 8, Math.max(8, window.innerWidth - rect.width - 8));
      const top = clamp(event.clientY - sidebarDragState.offsetY, 78, Math.max(78, window.innerHeight - rect.height - 8));
      sidebar.style.setProperty("left", `${Math.round(left)}px`, "important");
      sidebar.style.setProperty("top", `${Math.round(top)}px`, "important");
      event.preventDefault();
    };
    const end = (event) => {
      if (sidebarDragState && event.pointerId === sidebarDragState.pointerId) {
        sidebarDragState = null;
      }
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", end, true);
    window.addEventListener("pointercancel", end, true);
  }

  function dockSidebarToRightEdge(collapsed = false) {
    if (!sidebar) {
      return;
    }
    const rect = sidebar.getBoundingClientRect();
    const right = collapsed ? 0 : window.innerWidth <= 720 ? 8 : 16;
    const top = clamp(rect.top, 78, Math.max(78, window.innerHeight - rect.height - 8));
    sidebar.style.setProperty("left", "auto", "important");
    sidebar.style.setProperty("right", `${right}px`, "important");
    sidebar.style.setProperty("top", `${Math.round(top)}px`, "important");
    sidebar.style.setProperty("bottom", "auto", "important");
  }

  function bindSidebarResize() {
    const handles = Array.from(sidebar?.querySelectorAll("[data-vfs-panel-resize]") || []);
    if (!handles.length || !sidebar) {
      return;
    }
    handles.forEach((handle) => {
      handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) {
          return;
        }
        const rect = sidebar.getBoundingClientRect();
        sidebarResizeState = {
          pointerId: event.pointerId,
          direction: handle.dataset.vfsPanelResize || "",
          startX: event.clientX,
          startY: event.clientY,
          rect: {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
          }
        };
        sidebar.style.setProperty("left", `${Math.round(rect.left)}px`, "important");
        sidebar.style.setProperty("top", `${Math.round(rect.top)}px`, "important");
        sidebar.style.setProperty("right", "auto", "important");
        sidebar.style.setProperty("bottom", "auto", "important");
        sidebar.style.setProperty("width", `${Math.round(rect.width)}px`, "important");
        sidebar.style.setProperty("height", `${Math.round(rect.height)}px`, "important");
        sidebar.classList.add("is-resizing");
        handle.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
      }, true);
    });
    const move = (event) => {
      if (!sidebarResizeState || event.pointerId !== sidebarResizeState.pointerId || !sidebar) {
        return;
      }
      const margin = 8;
      const viewportWidth = Math.max(260, window.innerWidth - margin * 2);
      const viewportHeight = Math.max(320, window.innerHeight - margin * 2);
      const minWidth = Math.min(312, viewportWidth);
      const minHeight = Math.min(360, viewportHeight);
      const { direction, rect } = sidebarResizeState;
      let left = rect.left;
      let right = rect.right;
      let top = rect.top;
      let bottom = rect.bottom;
      if (direction.includes("w")) {
        left = clamp(event.clientX, margin, right - minWidth);
      }
      if (direction.includes("e")) {
        right = clamp(event.clientX, left + minWidth, window.innerWidth - margin);
      }
      if (direction.includes("n")) {
        top = clamp(event.clientY, margin, bottom - minHeight);
      }
      if (direction.includes("s")) {
        bottom = clamp(event.clientY, top + minHeight, window.innerHeight - margin);
      }
      const width = Math.max(minWidth, right - left);
      const height = Math.max(minHeight, bottom - top);
      sidebar.style.setProperty("left", `${Math.round(left)}px`, "important");
      sidebar.style.setProperty("top", `${Math.round(top)}px`, "important");
      sidebar.style.setProperty("width", `${Math.round(width)}px`, "important");
      sidebar.style.setProperty("height", `${Math.round(height)}px`, "important");
      event.preventDefault();
    };
    const end = (event) => {
      if (sidebarResizeState && event.pointerId === sidebarResizeState.pointerId) {
        sidebarResizeState = null;
        sidebar?.classList.remove("is-resizing");
      }
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", end, true);
    window.addEventListener("pointercancel", end, true);
  }

  function ensureMarkerLayer() {
    if (markerLayer) {
      return;
    }
    markerLayer = document.createElement("div");
    markerLayer.className = "vfs-marker-layer";
    document.documentElement.append(markerLayer);
  }

  function ensureFocusBox() {
    if (focusBox) {
      return;
    }
    focusBox = document.createElement("div");
    focusBox.className = "vfs-focus-box";
    document.documentElement.append(focusBox);
  }

  function renderChrome() {
    if (root) {
      root.classList.toggle("is-native-sidepanel", NATIVE_SIDEPANEL_BUILD);
      root.classList.toggle("is-open", sidebarOpen);
      root.classList.toggle("is-dom", mode === "dom");
      root.classList.toggle("is-shot", mode === "shot");
      root.classList.toggle("is-off", mode === "off");
      root.classList.toggle("is-agent", agentDeliveryOpen);
      root.classList.toggle("is-dark", isDarkTheme);
      root.classList.toggle("is-reopen-hidden", reopenHidden);
      root.classList.toggle("are-markers-hidden", markersHidden);
      const activeRecordCount = activeRecords().length;
      const reopenButton = root.querySelector("[data-vfs-action='open-sidebar']");
      if (reopenButton) {
        const label = activeRecordCount ? `展开飞标标注，${activeRecordCount} 条` : "展开飞标标注";
        reopenButton.title = label;
        reopenButton.setAttribute("aria-label", label);
      }
      const readButton = root.querySelector("[data-vfs-action='toolbar-read']");
      if (readButton) {
        const isReading = mode === "read";
        const label = !isReading ? "浏览" : markersHidden ? "显示所有数字角标" : "隐藏所有数字角标";
        readButton.dataset.vfsTooltip = label;
        readButton.setAttribute("aria-label", label);
        readButton.innerHTML = toolbarIcon(markersHidden ? "eyeOff" : "eye");
      }
      const themeToggle = root.querySelector("[data-vfs-action='toggle-theme']");
      if (themeToggle) {
        const label = isDarkTheme ? "切换浅色" : "切换深色";
        themeToggle.dataset.vfsTooltip = label;
        themeToggle.setAttribute("aria-label", label);
        themeToggle.innerHTML = toolbarIcon(isDarkTheme ? "theme" : "sun");
      }
      const sidebarToggle = root.querySelector("[data-vfs-action='toggle-sidebar']");
      if (sidebarToggle) {
        const label = sidebarOpen ? "收起右侧浮层" : "展开右侧浮层";
        sidebarToggle.dataset.vfsTooltip = label;
        sidebarToggle.setAttribute("aria-label", label);
        sidebarToggle.innerHTML = toolbarIcon(sidebarOpen ? "collapse" : "expandLeft");
      }
      renderCollabStatus();
      updateToolButtons();
      updateConfirmButtons();
      if (mode === "shot") {
        requestAnimationFrame(() => positionShotbarFromWorkbar({ ensureAbove: true }));
      }
    }
    document.documentElement.classList.toggle("vfs-dom-mode", mode === "dom");
    document.documentElement.classList.toggle("vfs-sidebar-open", isTopFrame() && sidebarOpen && !NATIVE_SIDEPANEL_BUILD);
    updatePageScale();
    scheduleCollabPoll();
    scheduleMarkerUpdate();
  }

  function renderAll() {
    if (isTopFrame()) {
      ensureUi();
    } else {
      removeEmbeddedMarkerLayers();
    }
    renderChrome();
    if (isTopFrame()) {
      renderThreads();
      renderMarkers();
      renderAgentDeliveryPanel();
    }
  }

  function renderCollabStatus() {
    if (!root) {
      return;
    }
    const box = root.querySelector(".vfs-collab");
    if (!box) {
      return;
    }
    const loggedIn = Boolean(feishuSessionToken && feishuUser);
    const chatId = activeTeamChatId();
    const active = Boolean(chatId);
    const teams = normalizeCollabTeams(collabState);
    const visibleTeams = teams;
    const team = collabState?.team || teams.find((item) => item.chatId === chatId) || {};
    const busy = feishuBusy || collabBusy;
    box.classList.toggle("is-logged-in", loggedIn);
    box.classList.toggle("is-active", active);
    box.classList.toggle("is-busy", busy);

    const userButton = box.querySelector("[data-vfs-action='toggle-account-menu']");
    const loginButton = box.querySelector("[data-vfs-action='login-feishu']");
    const accountMenu = box.querySelector(".vfs-account-menu");
    const avatar = box.querySelector(".vfs-collab-avatar");
    const title = box.querySelector(".vfs-collab-text strong");
    const meta = box.querySelector(".vfs-collab-text small");
    const teamSwitcher = box.querySelector(".vfs-collab-round-switcher");
    const teamSelect = box.querySelector("[data-vfs-team-select]");
    const teamMenu = box.querySelector("[data-vfs-team-menu]");
    const teamHelp = box.querySelector("[data-vfs-team-help]");
    const refreshTeamsButton = box.querySelector("[data-vfs-action='refresh-team-list']");
    const shareButton = box.querySelector("[data-vfs-action='share-team-page']");
    const syncFeishuButton = root.querySelector("[data-vfs-action='sync-feishu']");
    const membersNode = box.querySelector(".vfs-collab-members");
    const resourcesNode = box.querySelector(".vfs-workspace-resources");
    const workspaceStatus = box.querySelector("[data-vfs-workspace-status]");
    const baseButton = box.querySelector("[data-vfs-action='open-workspace-base']");
    const openButton = box.querySelector("[data-vfs-action='show-open']");
    const resolvedButton = box.querySelector("[data-vfs-action='show-resolved']");
    const openLabel = box.querySelector("[data-vfs-open-label]");
    const resolvedLabel = box.querySelector("[data-vfs-resolved-label]");

    renderCollabAvatar(avatar, loggedIn ? feishuUser : null);
    if (title) {
      title.textContent = loggedIn ? displayFeishuUserName(feishuUser) : "协同批注";
    }
    if (meta) {
      const metaText = feishuPendingText || (active
        ? ""
        : loggedIn && visibleTeams.length ? `${visibleTeams.length} 个可用 Team` : loggedIn ? displayFeishuUserName(feishuUser) : "未登录");
      meta.textContent = metaText;
      meta.hidden = !metaText;
    }
    if (userButton) {
      userButton.title = loggedIn ? "账号菜单" : "未登录";
      userButton.setAttribute("aria-label", userButton.title);
      userButton.disabled = !loggedIn || feishuBusy;
    }
    if (loginButton) {
      loginButton.hidden = loggedIn;
      loginButton.disabled = feishuBusy;
      loginButton.textContent = feishuBusyAction === "login" ? "登录中" : "登录飞书";
      loginButton.title = "登录飞书";
      loginButton.setAttribute("aria-label", loginButton.title);
      setButtonLoading(loginButton, feishuBusyAction === "login");
    }
    if (accountMenu) {
      accountMenu.hidden = !loggedIn || accountMenu.hidden;
    }
    if (teamSwitcher) {
      teamSwitcher.hidden = !loggedIn;
    }
    if (teamSelect) {
      const signature = `${chatId}|${visibleTeams.map((item) => `${item.chatId}:${item.name}:${item.avatarUrl || item.avatar_url || item.avatar || ""}`).join("|")}`;
      if (teamSelect.dataset.signature !== signature) {
        const options = visibleTeams.map((item) => createTeamPickerOption(item, item.chatId === chatId));
        teamMenu?.replaceChildren(...options);
        teamSelect.dataset.signature = signature;
      }
      teamSelect.disabled = busy || !loggedIn || !visibleTeams.length;
      teamSelect.value = active ? chatId : "";
      const selectedTeam = visibleTeams.find((item) => item.chatId === chatId) || (team.chatId === chatId ? team : null);
      const teamLabel = teamSelect.querySelector("[data-vfs-team-select-label]");
      if (teamLabel) {
        teamLabel.textContent = selectedTeam?.name || (visibleTeams.length ? "选择群聊" : "暂无可用群聊");
      }
      renderTeamPickerAvatar(teamSelect.querySelector("[data-vfs-team-select-avatar]"), selectedTeam);
      if (teamSelect.disabled) {
        setTeamPickerOpen(false);
      }
    }
    if (teamHelp) {
      teamHelp.textContent = visibleTeams.length
        ? "选择群聊后开始协同"
        : "先把飞标机器人加入目标群聊";
      const helpRow = teamHelp.closest(".vfs-collab-create-row");
      if (helpRow) {
        helpRow.hidden = !loggedIn || active;
      }
    }
    if (refreshTeamsButton) {
      refreshTeamsButton.disabled = busy || !loggedIn;
      const refreshLoading = ["teams", "workspace-refresh", "team", "refresh"].includes(collabBusyAction);
      refreshTeamsButton.classList.toggle("is-refreshing", refreshLoading);
      const tooltipText = refreshLoading ? "正在刷新批注与群聊列表" : "刷新批注与群聊列表";
      refreshTeamsButton.title = tooltipText;
      refreshTeamsButton.setAttribute("aria-label", tooltipText);
      setButtonLoading(refreshTeamsButton, refreshLoading);
    }
    if (shareButton) {
      const shareLoading = collabBusyAction === "share";
      shareButton.hidden = !loggedIn;
      shareButton.disabled = busy || !loggedIn || !active;
      shareButton.title = shareLoading ? "正在分享到当前群聊" : "将当前网页分享到目标群聊";
      shareButton.setAttribute("aria-label", shareButton.title);
      setButtonLoading(shareButton, shareLoading);
    }
    if (syncFeishuButton) {
      const syncLoading = feishuBusyAction === "sync-document";
      syncFeishuButton.hidden = !loggedIn;
      syncFeishuButton.disabled = busy || !loggedIn || !feishuDocumentRecords().length;
      syncFeishuButton.title = syncLoading ? "正在上传至云文档" : "上传至云文档";
      syncFeishuButton.setAttribute("aria-label", syncFeishuButton.title);
      setButtonLoading(syncFeishuButton, syncLoading);
    }
    if (resourcesNode) {
      resourcesNode.hidden = !loggedIn || !active;
    }
    if (baseButton) {
      baseButton.disabled = !team.baseUrl;
      baseButton.title = team.baseUrl ? "打开多维表格批注库" : "多维表格批注库正在创建";
      baseButton.setAttribute("aria-label", baseButton.title);
    }
    if (openButton) {
      openButton.disabled = !active || busy;
      openButton.classList.toggle("is-active", !collabShowResolved);
      openButton.setAttribute("aria-pressed", String(!collabShowResolved));
      openButton.title = "查看待处理批注";
      openButton.setAttribute("aria-label", openButton.title);
    }
    if (resolvedButton) {
      resolvedButton.disabled = !active || busy;
      resolvedButton.classList.toggle("is-active", collabShowResolved);
      resolvedButton.setAttribute("aria-pressed", String(collabShowResolved));
      resolvedButton.title = "查看已解决批注";
      resolvedButton.setAttribute("aria-label", resolvedButton.title);
    }
    if (openLabel) {
      openLabel.textContent = "待处理";
    }
    if (resolvedLabel) {
      resolvedLabel.textContent = "已解决";
    }
    if (workspaceStatus) {
      const connected = active && team.provisionState === "ready";
      const statusText = collabState?.statusText || (active ? teamProvisionStatusText(team) : "Team 批注库未连接");
      const statusDetails = Array.isArray(team.provisionErrors) ? team.provisionErrors.join("\n") : "";
      workspaceStatus.classList.toggle("is-connected", connected);
      workspaceStatus.classList.toggle("is-disconnected", !connected);
      workspaceStatus.dataset.vfsTooltip = statusText;
      workspaceStatus.title = statusDetails || statusText;
      workspaceStatus.setAttribute("aria-label", statusText);
    }
    if (membersNode) {
      membersNode.hidden = true;
    }
    renderMentionPickers();
  }

  function setButtonLoading(button, loading) {
    if (!button) {
      return;
    }
    button.classList.toggle("is-loading", Boolean(loading));
    if (loading) {
      button.setAttribute("aria-busy", "true");
    } else {
      button.removeAttribute("aria-busy");
    }
  }

  function setButtonLoadingContent(button, label, loading) {
    if (!button) {
      return;
    }
    const text = String(label || "");
    if (loading) {
      if (button.dataset.loadingLabel !== text || !button.querySelector(".vfs-team-sync-spinner")) {
        stopButtonLoadingMotion(button);
        const shimmer = document.createElement("span");
        shimmer.className = "vfs-team-sync-shimmer";
        shimmer.setAttribute("aria-hidden", "true");
        const spinner = document.createElement("span");
        spinner.className = "vfs-team-sync-spinner";
        spinner.setAttribute("aria-hidden", "true");
        const labelNode = document.createElement("span");
        labelNode.className = "vfs-team-sync-label";
        labelNode.textContent = text;
        button.replaceChildren(shimmer, spinner, labelNode);
        button.dataset.loadingLabel = text;
        startButtonLoadingMotion(button, spinner, shimmer);
      }
    } else if (button.dataset.loadingLabel || button.textContent !== text) {
      stopButtonLoadingMotion(button);
      button.textContent = text;
      delete button.dataset.loadingLabel;
    }
    setButtonLoading(button, loading);
  }

  function startButtonLoadingMotion(button, spinner, shimmer) {
    const motion = { frame: 0, startedAt: performance.now() };
    const tick = (now) => {
      if (!button.isConnected || !button.classList.contains("is-loading") || !spinner.isConnected || !shimmer.isConnected) {
        loadingButtonMotions.delete(button);
        return;
      }
      const elapsed = Math.max(0, now - motion.startedAt);
      const spinnerDegrees = elapsed % 680 / 680 * 360;
      const shimmerPosition = 160 - elapsed % 1050 / 1050 * 320;
      spinner.style.setProperty("transform", `rotate(${spinnerDegrees}deg)`, "important");
      shimmer.style.setProperty("background-position", `${shimmerPosition}% 0`, "important");
      motion.frame = requestAnimationFrame(tick);
    };
    loadingButtonMotions.set(button, motion);
    motion.frame = requestAnimationFrame(tick);
  }

  function stopButtonLoadingMotion(button) {
    const motion = loadingButtonMotions.get(button);
    if (!motion) {
      return;
    }
    cancelAnimationFrame(motion.frame);
    loadingButtonMotions.delete(button);
  }

  function renderCollabAvatar(node, user) {
    if (!node) {
      return;
    }
    node.replaceChildren();
    const avatarUrl = user?.avatarUrl || user?.avatar_url;
    if (avatarUrl) {
      const image = document.createElement("img");
      image.src = avatarUrl;
      image.alt = "";
      node.append(image);
      return;
    }
    node.textContent = user ? displayFeishuUserName(user).slice(0, 1).toUpperCase() : "飞";
  }

  function renderTeamPickerAvatar(node, team) {
    if (!node) {
      return;
    }
    node.replaceChildren();
    const avatarUrl = team?.avatarUrl || team?.avatar_url || team?.avatar;
    if (avatarUrl) {
      const image = document.createElement("img");
      image.src = avatarUrl;
      image.alt = "";
      node.append(image);
      return;
    }
    node.textContent = team?.name?.slice(0, 1).toUpperCase() || "群";
  }

  function createTeamPickerOption(team, selected) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "vfs-team-select-option";
    option.dataset.vfsAction = "select-team";
    option.dataset.vfsTeamOption = "";
    option.dataset.chatId = team.chatId;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(selected));
    option.classList.toggle("is-selected", selected);

    const avatar = document.createElement("span");
    avatar.className = "vfs-team-select-avatar";
    avatar.setAttribute("aria-hidden", "true");
    renderTeamPickerAvatar(avatar, team);

    const label = document.createElement("span");
    label.className = "vfs-team-select-option-label";
    label.textContent = team.name || "未命名群聊";

    const check = document.createElement("span");
    check.className = "vfs-team-select-option-check";
    check.setAttribute("aria-hidden", "true");
    check.innerHTML = toolbarIcon("check");
    option.append(avatar, label, check);
    return option;
  }

  function setTeamPickerOpen(open, options = {}) {
    const trigger = root?.querySelector?.("[data-vfs-team-select]");
    const menu = root?.querySelector?.("[data-vfs-team-menu]");
    if (!trigger || !menu) {
      return;
    }
    const shouldOpen = Boolean(open && !trigger.disabled && menu.childElementCount);
    menu.hidden = !shouldOpen;
    trigger.setAttribute("aria-expanded", String(shouldOpen));
    trigger.closest(".vfs-team-select-wrap")?.classList.toggle("is-open", shouldOpen);
    if (shouldOpen && options.focusOption) {
      const selected = menu.querySelector("[role='option'][aria-selected='true']");
      (selected || menu.querySelector("[role='option']"))?.focus?.({ preventScroll: true });
    } else if (!shouldOpen && options.restoreFocus) {
      trigger.focus?.({ preventScroll: true });
    }
  }

  function toggleTeamPicker() {
    const trigger = root?.querySelector?.("[data-vfs-team-select]");
    setTeamPickerOpen(trigger?.getAttribute("aria-expanded") !== "true", { focusOption: true });
  }

  function handleTeamPickerKeyDown(event) {
    const trigger = event.target?.closest?.("[data-vfs-team-select]");
    const option = event.target?.closest?.("[data-vfs-team-option]");
    const menu = root?.querySelector?.("[data-vfs-team-menu]");
    if (!trigger && !option) {
      return false;
    }
    if (trigger && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      setTeamPickerOpen(true, { focusOption: true });
      return true;
    }
    if (trigger && event.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
      event.preventDefault();
      event.stopPropagation();
      setTeamPickerOpen(false, { restoreFocus: true });
      return true;
    }
    if (!option || !menu || menu.hidden) {
      return false;
    }
    const options = Array.from(menu.querySelectorAll("[data-vfs-team-option]"));
    const currentIndex = Math.max(0, options.indexOf(option));
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setTeamPickerOpen(false, { restoreFocus: true });
      return true;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      option.click();
      return true;
    }
    let nextIndex = -1;
    if (event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = options.length - 1;
    }
    if (nextIndex >= 0) {
      event.preventDefault();
      event.stopPropagation();
      options[nextIndex]?.focus?.({ preventScroll: true });
      return true;
    }
    return false;
  }

  function activeCollabRoundId() {
    return String(collabState?.roundId || collabState?.round?.roundId || collabState?.roomId || "").trim();
  }

  function activeTeamChatId() {
    return String(collabState?.team?.chatId || collabState?.chatId || "").trim();
  }

  function normalizeCollabTeams(state) {
    const source = Array.isArray(state?.teams) ? state.teams : [];
    return source.map((team) => ({
      ...team,
      chatId: String(team?.chatId || team?.teamId || "").trim(),
      name: String(team?.name || "未命名群聊").trim()
    })).filter((team) => team.chatId);
  }

  function normalizeCollabRounds(state) {
    const source = Array.isArray(state?.rounds) ? state.rounds : [];
    return source.map((round, index) => ({
      ...round,
      roundId: String(round?.roundId || round?.roomId || "").trim(),
      roundName: String(round?.roundName || round?.title || `第 ${index + 1} 轮`).trim()
    })).filter((round) => round.roundId);
  }

  function teamProvisionStatusText(team) {
    if (!team?.chatId) {
      return "";
    }
    if (team.provisionState === "ready") {
      return "Team 批注库已连接";
    }
    if (team.provisionState === "partial") {
      return "批注库部分创建";
    }
    if (team.provisionState === "manual") {
      return "等待机器人建表";
    }
    return "正在准备批注库";
  }

  async function selectCollabTeamFromUi(chatId) {
    const startedAt = performance.now();
    try {
      await handleCollabOpenTeam(chatId, { preserveLocalRecords: !activeTeamChatId() });
      if (records.some((record) => !record.collab?.threadId || record.collab?.pendingSync)) {
        await handleCollabSyncTeamPage({ busyAction: "team" });
      }
      trackEvent("team_selected", { source: "team_picker" }, {
        success: true,
        durationMs: performance.now() - startedAt
      });
      showToast("已切换 Team。");
    } catch (error) {
      trackEvent("sync_failed", { source: "team_picker", sync_kind: "team_open" }, {
        success: false,
        durationMs: performance.now() - startedAt,
        errorCode: error
      });
      showToast(normalizeCollabError(error));
      renderCollabStatus();
    }
  }

  function openWorkspaceResource(type) {
    const team = collabState?.team || {};
    const url = type === "chat" ? team.chatUrl : team.baseUrl;
    if (!url) {
      showToast(type === "chat" ? "暂时无法打开群聊。" : "批注库尚未创建。");
      return;
    }
    void openUrlInNewTab(url).catch(() => {
      showToast(type === "chat" ? "暂时无法打开群聊。" : "暂时无法打开批注库。");
    });
  }

  async function syncCollabRoomFromUi(options = {}) {
    const previousCount = records.length;
    const previousVersion = Number(collabState?.serverVersion || 0);
    const startedAt = performance.now();
    let syncSucceeded = false;
    if (!options.background) {
      setFeishuPending(options.pendingText || "正在同步当前页面…");
      trackEvent("sync_started", { sync_kind: "team_page", record_count: records.length, background: false });
    }
    try {
      await handleCollabSyncTeamPage({
        pendingOnly: Boolean(options.pendingOnly),
        busyAction: options.background ? "" : options.busyAction || "refresh"
      });
      syncSucceeded = true;
      if (!options.background) {
        trackEvent("sync_succeeded", { sync_kind: "team_page", record_count: records.length, background: false }, {
          success: true,
          durationMs: performance.now() - startedAt
        });
        const addedCount = Math.max(0, records.length - previousCount);
        const changed = Number(collabState?.serverVersion || 0) > previousVersion;
        showToast(options.successMessage || (addedCount
          ? `当前页面已刷新，新增 ${addedCount} 条批注。`
          : changed ? "当前页面已同步到最新。" : "当前页面已是最新，无新增批注。"));
      }
    } catch (error) {
      if (!options.background) {
        trackEvent("sync_failed", { sync_kind: "team_page", record_count: records.length, background: false }, {
          success: false,
          durationMs: performance.now() - startedAt,
          errorCode: error
        });
        showToast(normalizeCollabError(error));
      }
    } finally {
      if (!options.background) {
        clearFeishuPending();
      }
      if (options.background && records.some((record) => record.collab?.pendingSync)) {
        scheduleCollabSync(syncSucceeded ? 120 : 1600);
      }
    }
  }

  async function pullCollabRoomFromUi(options = {}) {
    try {
      await handleCollabOpenTeam(activeTeamChatId(), {
        busyAction: options.background ? "" : "refresh",
        preserveLocalRecords: true
      });
      if (!options.background) {
        showToast("当前页面已刷新。");
      }
    } catch (error) {
      if (!options.background) {
        showToast(normalizeCollabError(error));
      }
    }
  }

  function removeEmbeddedMarkerLayers() {
    if (isTopFrame()) {
      return;
    }
    markerLayer?.remove();
    markerLayer = null;
    document.querySelectorAll(".vfs-marker-layer").forEach((node) => node.remove());
  }

  function handleUiClick(event) {
    const actionTarget = event.target?.closest?.("[data-vfs-action]");
    const toolTarget = event.target?.closest?.("[data-vfs-tool]");
    const action = actionTarget?.dataset?.vfsAction;
    const tool = toolTarget?.dataset?.vfsTool;
    if (action === "toggle-team-select") {
      clearConfirmState();
      toggleTeamPicker();
      return;
    }
    if (action === "select-team") {
      clearConfirmState();
      const chatId = String(actionTarget?.dataset?.chatId || "").trim();
      setTeamPickerOpen(false, { restoreFocus: true });
      if (chatId && chatId !== activeTeamChatId()) {
        void selectCollabTeamFromUi(chatId);
      }
      return;
    }
    if (!action && !tool) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    if (tool) {
      clearConfirmState();
      setShotTool(tool);
      return;
    }

    if (action === "toolbar-read") {
      clearConfirmState();
      closeRecordEditor();
      if (mode === "read") {
        void setMarkersHidden(!markersHidden);
        return;
      }
      void setMode("read");
      return;
    }
    if (action === "toolbar-comment") {
      clearConfirmState();
      closeRecordEditor();
      void setMode("dom");
      return;
    }
    if (action === "toolbar-shot") {
      clearConfirmState();
      closeRecordEditor();
      void setMode("shot");
      return;
    }
    if (action === "close-workbench") {
      clearConfirmState();
      closeRecordEditor();
      sidebarOpen = false;
      void setMode("off", { keepSidebar: true });
      return;
    }
    if (action === "toggle-style-compare") {
      toggleStyleComparison();
      return;
    }
    if (action === "compare-record-style") {
      clearConfirmState();
      toggleSavedStyleComparison(actionTarget?.dataset?.recordId);
      return;
    }
    if (action === "toggle-mention-picker") {
      toggleMentionPicker(actionTarget?.dataset?.vfsMentionScope);
      return;
    }
    if (action === "toggle-mention-member") {
      toggleMentionMember(actionTarget?.dataset?.vfsMentionScope, actionTarget?.dataset?.openId);
      return;
    }
    if (action === "composer-comment") {
      setComposerMode("comment");
      return;
    }
    if (action === "composer-style") {
      setComposerMode("style");
      return;
    }
    if (action === "open-agent" || action === "copy-markdown") {
      clearConfirmState();
      closeRecordEditor();
      void openAgentDeliveryPanel();
      return;
    }
    if (action === "login-feishu") {
      clearConfirmState();
      handleFeishuLogin();
      return;
    }
    if (action === "sync-feishu") {
      clearConfirmState();
      void handleSyncFeishu().catch(() => {});
      return;
    }
    if (action === "toggle-account-menu") {
      clearConfirmState();
      toggleAccountMenu();
      return;
    }
    if (action === "switch-feishu-account") {
      clearConfirmState();
      setAccountMenuOpen(false);
      handleFeishuLogin();
      return;
    }
    if (action === "logout-feishu") {
      clearConfirmState();
      void logoutFeishuAccount();
      return;
    }
    if (action === "refresh-team-list") {
      clearConfirmState();
      void refreshCollabWorkspaceFromUi();
      return;
    }
    if (action === "share-team-page") {
      clearConfirmState();
      void openShareTeamConfirm(actionTarget);
      return;
    }
    if (action === "cancel-share-team-page") {
      clearConfirmState();
      closeShareTeamConfirm();
      return;
    }
    if (action === "confirm-share-team-page") {
      clearConfirmState();
      const shareDraft = currentShareNoteDraft();
      closeShareTeamConfirm({ restoreFocus: false });
      void shareCurrentPageToTeam(shareDraft);
      return;
    }
    if (action === "share-confirm-backdrop") {
      if (event.target === actionTarget) {
        clearConfirmState();
        closeShareTeamConfirm();
      }
      return;
    }
    if (action === "sync-room") {
      clearConfirmState();
      syncCollabRoomFromUi();
      return;
    }
    if (action === "pull-room") {
      clearConfirmState();
      pullCollabRoomFromUi();
      return;
    }
    if (action === "show-open" || action === "show-resolved") {
      clearConfirmState();
      collabShowResolved = action === "show-resolved";
      activeId = activeRecords()[0]?.id || "";
      renderAll();
      return;
    }
    if (action === "open-workspace-base") {
      clearConfirmState();
      openWorkspaceResource("base");
      return;
    }
    if (action === "agent-format-compact" || action === "agent-format-full") {
      agentFormat = action === "agent-format-full" ? "full" : "compact";
      agentMarkdownDraft = null;
      renderAgentDeliveryPanel();
      return;
    }
    if (action === "agent-pane-selection" || action === "agent-pane-preview") {
      agentMobilePane = action === "agent-pane-preview" ? "preview" : "selection";
      renderAgentDeliveryPanel();
      return;
    }
    if (action === "toggle-theme") {
      isDarkTheme = !isDarkTheme;
      renderAll();
      return;
    }
    if (action === "toggle-sidebar") {
      clearConfirmState();
      if (sidebarOpen) {
        closeRecordEditor();
      }
      setSidebarVisibility(!sidebarOpen);
      return;
    }
    if (action === "close-sidebar") {
      clearConfirmState();
      closeRecordEditor();
      setSidebarVisibility(false);
      return;
    }
    if (action === "open-sidebar") {
      clearConfirmState();
      setSidebarVisibility(true);
      return;
    }
    if (action === "hide-reopen") {
      clearConfirmState();
      closeRecordEditor();
      restoreSavedStyleComparison();
      sidebarOpen = false;
      void setReopenHidden(true).catch(() => {});
      renderAll();
      broadcastToChildFrames({ type: "VFS_MODE_CHANGED", mode, sidebarOpen, records });
      return;
    }
    if (action === "save-dom") {
      clearConfirmState();
      saveDomRecord();
      return;
    }
    if (action === "cancel-dom") {
      clearConfirmState();
      clearSelection();
      return;
    }
    if (action === "read-mode") {
      clearConfirmState();
      closeRecordEditor();
      setMode("read");
      return;
    }
    if (action === "dom-mode") {
      clearConfirmState();
      closeRecordEditor();
      setMode("dom");
      return;
    }
    if (action === "shot-mode") {
      clearConfirmState();
      closeRecordEditor();
      setMode("shot");
      return;
    }
    if (action === "agent-close") {
      clearConfirmState();
      closeAgentDeliveryPanel();
      return;
    }
    if (action === "agent-select-all") {
      clearConfirmState();
      selectAgentRecords("all");
      return;
    }
    if (action === "agent-select-none") {
      clearConfirmState();
      selectAgentRecords("none");
      return;
    }
    if (action === "agent-select-shots") {
      clearConfirmState();
      selectAgentRecords("shots");
      return;
    }
    if (action === "agent-copy-md") {
      clearConfirmState();
      copyAgentMarkdownSelection();
      return;
    }
    if (action === "agent-download-md") {
      clearConfirmState();
      downloadAgentMarkdownSelection();
      return;
    }
    if (action === "agent-export-package") {
      clearConfirmState();
      exportAgentPackage();
      return;
    }
    if (action === "agent-send-trae") {
      clearConfirmState();
      deliverAgentToTrae();
      return;
    }
    if (action === "agent-copy-image") {
      clearConfirmState();
      copyAgentImage(actionTarget?.dataset?.recordId);
      return;
    }
    if (action === "agent-preview-image") {
      clearConfirmState();
      previewAgentImage(actionTarget?.dataset?.recordId);
      return;
    }
    if (action === "agent-batch") {
      clearConfirmState();
      setAgentBatch(Number(actionTarget?.dataset?.batch || 0));
      return;
    }
    if (action === "import-json") {
      clearConfirmState();
      openJsonImportPicker();
      return;
    }
    if (action === "download-json") {
      clearConfirmState();
      downloadJsonPackage();
      return;
    }
    if (action === "clear-all") {
      closeRecordEditor();
      clearRecordsWithConfirm();
      return;
    }
    if (action === "edit-record") {
      clearConfirmState();
      openRecordEditor(actionTarget?.dataset?.recordId, actionTarget);
      return;
    }
    if (action === "reply-record") {
      clearConfirmState();
      openRecordReply(actionTarget?.dataset?.recordId, actionTarget);
      return;
    }
    if (action === "resolve-record") {
      clearConfirmState();
      void toggleRecordResolved(actionTarget?.dataset?.recordId);
      return;
    }
    if (action === "save-edit") {
      clearConfirmState();
      saveRecordEdit();
      return;
    }
    if (action === "cancel-edit") {
      clearConfirmState();
      closeRecordEditor();
      return;
    }
    if (action === "recapture") {
      clearConfirmState();
      captureViewport();
      return;
    }
    if (action === "finish-shot") {
      clearConfirmState();
      finishShotAnnotation();
      return;
    }
    if (action === "exit-shot") {
      clearConfirmState();
      setMode("read");
      return;
    }
    if (action === "save-shot") {
      clearConfirmState();
      saveShotRecord();
      return;
    }
    if (action === "cancel-shot") {
      clearConfirmState();
      cancelShotDraft();
      return;
    }
    if (action === "close-image-viewer") {
      clearConfirmState();
      closeImageViewer();
      return;
    }
    if (action === "image-viewer-backdrop") {
      clearConfirmState();
      closeImageViewer();
    }
  }

  function handleKeyDown(event) {
    if (event.isComposing) {
      return;
    }
    if (handleTeamPickerKeyDown(event)) {
      return;
    }
    const mentionScope = event.target?.dataset?.vfsMentionEditor || "";
    if (mentionScope && handleMentionSuggestionKeyDown(event, mentionScope)) {
      return;
    }
    if (event.key === "Escape") {
      if (shareConfirmModal?.classList.contains("is-visible")) {
        event.preventDefault();
        event.stopPropagation();
        clearConfirmState();
        closeShareTeamConfirm();
        return;
      }
      if (mode === "off") {
        return;
      }
      if (!isTopFrame()) {
        event.preventDefault();
        event.stopPropagation();
        postToParent({ type: "VFS_EXIT_TO_READ" });
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      clearConfirmState();
      closeImageViewer();
      closeRecordEditor();
      closeDomComposer();
      if (mode === "read") {
        clearSelection();
        cancelShotDraft();
        renderAll();
      } else {
        void setMode("read");
      }
      return;
    }
    if (!isEnterKey(event)) {
      return;
    }
    if (editInput && event.target === editInput) {
      if (event.shiftKey) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      saveRecordEdit();
      return;
    }
    if (mode === "dom") {
      if (commentInput && event.target === commentInput) {
        if (event.shiftKey) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        void saveDomRecord();
        return;
      }
      if (!isTextEditingTarget(event.target) && (selectedElement || pendingSelection)) {
        event.preventDefault();
        event.stopPropagation();
        openDomComposer(currentDomSelection());
      }
      return;
    }
    if (shotPopover?.classList.contains("is-visible")) {
      if (event.shiftKey) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      void saveShotRecord();
      return;
    }
    if (mode !== "shot") {
      return;
    }
    if (isTextEditingTarget(event.target) || shotPopover?.classList.contains("is-visible")) {
      return;
    }
    if (!shotRegion || !shotStage?.classList.contains("is-captured")) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    finishShotAnnotation();
  }

  function handleDomComposerKeyDown(event) {
    if (!isComposerSubmitEvent(event) || event.isComposing) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    void saveDomRecord();
  }

  function handleDomComposerKeyUp(event) {
    if (!isComposerSubmitEvent(event) || !composer?.classList.contains("is-visible")) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    void saveDomRecord();
  }

  function handleShotComposerKeyDown(event) {
    if (!isComposerSubmitEvent(event) || event.isComposing) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    void saveShotRecord();
  }

  function handleShotComposerKeyUp(event) {
    if (!isComposerSubmitEvent(event) || !shotPopover?.classList.contains("is-visible")) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    void saveShotRecord();
  }

  function isComposerSubmitEvent(event) {
    return isEnterKey(event) && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey;
  }

  function isEnterKey(event) {
    return event.key === "Enter" || event.code === "Enter" || event.code === "NumpadEnter" || event.keyCode === 13 || event.which === 13;
  }

  function isTextEditingTarget(target) {
    if (!(target instanceof Element)) {
      return false;
    }
    const tag = target.tagName?.toLowerCase();
    return target.isContentEditable || tag === "textarea" || tag === "input" || tag === "select";
  }

  function openImageViewer(src, title) {
    if (!imageViewer || !imageViewerImg) {
      return;
    }
    imageViewerImg.src = src;
    imageViewerTitle.textContent = title || "批注图片";
    imageViewer.classList.add("is-visible");
    imageViewer.setAttribute("aria-hidden", "false");
  }

  function closeImageViewer() {
    if (!imageViewer || !imageViewerImg) {
      return;
    }
    imageViewer.classList.remove("is-visible");
    imageViewer.setAttribute("aria-hidden", "true");
    imageViewerImg.removeAttribute("src");
  }

  function handleDocumentClick(event) {
    const clickTarget = event.target instanceof Element ? event.target : null;
    const confirmControl = pendingConfirm?.type === "clear"
      ? clickTarget?.closest("[data-vfs-action='clear-all']")
      : clickTarget?.closest(".vfs-delete");
    if (pendingConfirm && !confirmControl) {
      clearConfirmState();
      requestAnimationFrame(() => {
        if (!pendingConfirm) {
          renderAll();
        }
      });
    }
    const accountMenu = root?.querySelector(".vfs-account-menu");
    const accountButton = root?.querySelector("[data-vfs-action='toggle-account-menu']");
    if (accountMenu && !accountMenu.hidden && !accountMenu.contains(event.target) && !accountButton?.contains(event.target)) {
      accountMenu.hidden = true;
    }
    const teamPicker = root?.querySelector(".vfs-team-select-wrap");
    if (teamPicker?.classList.contains("is-open") && !teamPicker.contains(event.target)) {
      setTeamPickerOpen(false);
    }
    if (mode !== "dom" || isEventBlockedForDom(event)) {
      return;
    }
    const element = normalizeTarget(event.target, event.clientX, event.clientY);
    if (!element) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    selectElement(element);
  }

  function handleDomPointerDown(event) {
    if (mode !== "dom" || isEventBlockedForDom(event)) {
      return;
    }
    const element = normalizeTarget(event.target, event.clientX, event.clientY);
    if (!element) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    if (event.button === undefined || event.button === 0) {
      selectElement(element);
    }
  }

  function handleMouseMove(event) {
    if (mode !== "dom" || isEventBlockedForDom(event)) {
      return;
    }
    const element = normalizeTarget(event.target, event.clientX, event.clientY);
    if (element === hoveredElement) {
      return;
    }
    clearHover();
    hoveredElement = element;
    hoveredElement?.classList.add("vfs-hover");
  }

  function normalizeTarget(target, clientX = null, clientY = null) {
    if (!(target instanceof Element)) {
      return null;
    }
    if (isVfsAnnotationBlocked(target)) {
      return null;
    }
    if (target.closest("iframe")) {
      return null;
    }
    const preciseTarget = refineTargetAtPoint(target, clientX, clientY);
    const element = preciseTarget.closest(ANNOTATION_TARGET_SELECTOR);
    if (!element || isVfsAnnotationBlocked(element)) {
      return null;
    }
    if (element === document.documentElement || element === document.body) {
      return null;
    }
    return element;
  }

  function refineTargetAtPoint(target, clientX, clientY) {
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
      return target;
    }
    if (target.matches(PRECISE_ANNOTATION_TARGET_SELECTOR)) {
      return target;
    }
    const specific = findSpecificChildAtPoint(target, clientX, clientY);
    return specific || target;
  }

  function findSpecificChildAtPoint(container, clientX, clientY) {
    const candidates = Array.from(container.querySelectorAll(PRECISE_ANNOTATION_TARGET_SELECTOR));
    let best = null;
    let bestArea = Infinity;
    candidates.forEach((element) => {
      if (!(element instanceof Element) || isVfsAnnotationBlocked(element)) {
        return;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2 || clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        return;
      }
      const hasSignal = element.matches("input,textarea,select,img") || elementExcerpt(element);
      if (!hasSignal) {
        return;
      }
      const area = rect.width * rect.height;
      if (area < bestArea) {
        bestArea = area;
        best = element;
      }
    });
    return best;
  }

  function isVfsUi(target) {
    if (!target) {
      return false;
    }
    if (target instanceof Node && (root?.contains(target) || markerLayer?.contains(target) || focusBox?.contains(target))) {
      return true;
    }
    if (!(target instanceof Element)) {
      return false;
    }
    return Boolean(target.closest(".vfs-root, .vfs-marker-layer, .vfs-focus-box, .vfs-shot, .vfs-shot-popover, .vfs-image-viewer, .vfs-reopen-wrap, .vfs-reopen, [data-vfs-action], [data-vfs-tool]"));
  }

  function isEventInsideVfsUi(event) {
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    if (path.some((node) => isVfsUi(node))) {
      return true;
    }
    return isVfsUi(event.target);
  }

  // 插件自身 UI 不参与 DOM 标注，避免工作栏/侧栏在标注模式下截走功能点击。
  function isVfsControl(target) {
    if (!(target instanceof Element)) {
      return false;
    }
    return Boolean(target.closest(".vfs-root, [data-vfs-action], [data-vfs-tool]"));
  }

  // 插件瞬态浮层：标记点、聚焦框、截图层、图片预览、Toast、重开按钮，标注时忽略以减少噪声。
  function isVfsOverlay(target) {
    if (!(target instanceof Element)) {
      return false;
    }
    return Boolean(target.closest(".vfs-marker-layer, .vfs-focus-box, .vfs-shot, .vfs-image-viewer, .vfs-toast, .vfs-reopen-wrap, .vfs-reopen"));
  }

  // DOM 标注只命中被评审页面，飞标浮层和所有瞬态层都跳过。
  function isVfsAnnotationBlocked(target) {
    return isVfsUi(target) || isVfsControl(target) || isVfsOverlay(target);
  }

  function isEventBlockedForDom(event) {
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    if (path.some((node) => isVfsAnnotationBlocked(node))) {
      return true;
    }
    return isVfsAnnotationBlocked(event.target);
  }

  function selectElement(element) {
    clearSelection();
    selectedElement = element;
    selectedElement.classList.add("vfs-selected");
    if (!isTopFrame()) {
      postToParent({
        type: "VFS_CHILD_SELECTION",
        selection: buildElementSelection(element)
      });
      return;
    }
    sidebarOpen = true;
    pendingSelection = null;
    renderChrome();
    openDomComposer(buildElementSelection(element));
  }

  function clearSelection() {
    selectedElement?.classList.remove("vfs-selected");
    selectedElement = null;
    if (isTopFrame()) {
      pendingSelection = null;
    }
    activeDomSelection = null;
    closeDomComposer();
  }

  function cancelDomSelection() {
    clearSelection();
    if (isTopFrame()) {
      broadcastToChildFrames({ type: "VFS_CLEAR_SELECTION" });
    }
  }

  function clearHover() {
    hoveredElement?.classList.remove("vfs-hover");
    hoveredElement = null;
  }

  function currentDomSelection() {
    if (pendingSelection) {
      return pendingSelection;
    }
    if (selectedElement) {
      return buildElementSelection(selectedElement);
    }
    return activeDomSelection;
  }

  function openDomComposer(selection) {
    if (!selection || !composer || !commentInput) {
      return;
    }
    activeDomSelection = clonePlainObject(selection);
    resetMentionSelection("dom");
    composerLabel.textContent = `已选择：${selection.label || selection.excerpt || "页面元素"}`;
    composerMode = "comment";
    styleDraft = createStyleDraft(selection);
    styleHistory = [];
    styleFuture = [];
    styleComparisonActive = false;
    composer.classList.add("is-visible");
    positionDomComposer(selection);
    if (!commentInput.value) {
      commentInput.value = "";
    }
    setComposerMode("comment", { focus: true });
    updateToolButtons();
  }

  function closeDomComposer(options = {}) {
    const keepStyle = Boolean(options.keepStyle);
    closeStylePresetMenu();
    hideStyleHelpTooltip();
    if (styleDraft && !keepStyle) {
      restoreStyleDraftBaseline(styleDraft, { dispose: true });
    }
    root?.querySelectorAll(".vfs-dom-popover.is-visible").forEach((node) => {
      node.classList.remove("is-visible");
    });
    composer?.classList.remove("is-visible");
    activeDomSelection = null;
    if (commentInput) {
      if (document.activeElement === commentInput) {
        commentInput.blur();
      }
      commentInput.value = "";
    }
    if (styleTextInput) {
      styleTextInput.value = "";
    }
    styleDraft = null;
    styleHistory = [];
    styleFuture = [];
    styleComparisonActive = false;
    resetMentionSelection("dom");
    composerMode = "comment";
    updateToolButtons();
  }

  function setComposerMode(nextMode, options = {}) {
    const next = nextMode === "style" ? "style" : "comment";
    if (next === "style" && !styleDraft) {
      showToast("当前元素暂不支持直接试改。");
      return;
    }
    composerMode = next;
    const commentEditor = composer?.querySelector(".vfs-comment-editor");
    const styleEditor = composer?.querySelector(".vfs-style-editor");
    commentEditor && (commentEditor.hidden = next !== "comment");
    styleEditor && (styleEditor.hidden = next !== "style");
    composer?.querySelectorAll(".vfs-composer-tab").forEach((button) => {
      const active = button.dataset.vfsAction === `composer-${next}`;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    if (next === "style") {
      syncStyleInputs();
      if (options.focus !== false) {
        styleTextInput?.focus();
      }
    } else if (options.focus !== false) {
      commentInput?.focus();
    }
    positionDomComposer();
  }

  function createStyleDraft(selection) {
    const element = styleTargetForSelection(selection);
    if (!element) {
      const remote = selection?.remoteStyle;
      if (!remote?.sessionId || !remote.before) {
        return null;
      }
      return {
        element: null,
        remoteSessionId: String(remote.sessionId),
        selection: clonePlainObject(selection),
        values: {},
        inline: {},
        priority: {},
        before: clonePlainObject(remote.before) || {},
        text: String(remote.text || ""),
        html: "",
        isField: Boolean(remote.isField)
      };
    }
    return {
      element,
      selection: clonePlainObject(selection),
      values: {},
      ...captureElementStyleBaseline(element)
    };
  }

  function captureElementStyleBaseline(element) {
    const computed = getComputedStyle(element);
    const inline = {};
    const priority = {};
    const before = {};
    STYLE_PROPERTIES.forEach((property) => {
      inline[property] = element.style.getPropertyValue(property);
      priority[property] = element.style.getPropertyPriority(property);
      before[property] = computed.getPropertyValue(property).trim();
    });
    const isField = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
    return {
      inline,
      priority,
      before,
      text: isField ? String(element.value || "") : String(element.textContent || ""),
      html: isField ? "" : element.innerHTML,
      isField
    };
  }

  function createRemoteStyleSession(element) {
    if (!element?.isConnected) {
      return null;
    }
    const sessionId = createId();
    const baseline = captureElementStyleBaseline(element);
    remoteStyleSessions.set(sessionId, {
      sessionId,
      element,
      selector: cssPath(element),
      values: {},
      ...baseline
    });
    return {
      sessionId,
      before: clonePlainObject(baseline.before) || {},
      text: baseline.text,
      isField: baseline.isField
    };
  }

  function isRemoteStyleMessage(message) {
    return [
      "VFS_REMOTE_STYLE_APPLY",
      "VFS_REMOTE_STYLE_RESTORE",
      "VFS_REMOTE_STYLE_COMMIT"
    ].includes(message?.type);
  }

  function handleRemoteStyleMessage(message) {
    const sessionId = String(message?.sessionId || "");
    const session = remoteStyleSessions.get(sessionId);
    if (!session) {
      return false;
    }
    const element = resolveRemoteStyleElement(session);
    if (!element) {
      remoteStyleSessions.delete(sessionId);
      return true;
    }
    if (message.type === "VFS_REMOTE_STYLE_COMMIT") {
      remoteStyleSessions.delete(sessionId);
      return true;
    }
    restoreElementStyleBaseline(session);
    if (message.type === "VFS_REMOTE_STYLE_APPLY") {
      session.values = clonePlainObject(message.values) || {};
      Object.entries(session.values).forEach(([property, value]) => applyStyleValue(session, property, value));
      return true;
    }
    if (message.dispose) {
      remoteStyleSessions.delete(sessionId);
    }
    return true;
  }

  function resolveRemoteStyleElement(session) {
    if (session?.element?.isConnected) {
      return session.element;
    }
    if (!session?.selector) {
      return null;
    }
    try {
      const element = document.querySelector(session.selector);
      if (element) {
        session.element = element;
      }
      return element;
    } catch {
      return null;
    }
  }

  function isSavedStyleComparisonMessage(message) {
    return [
      "VFS_SAVED_STYLE_COMPARE",
      "VFS_SAVED_STYLE_RESTORE",
      "VFS_SAVED_STYLE_REVERT"
    ].includes(message?.type);
  }

  function handleSavedStyleComparisonMessage(message) {
    const record = message?.record;
    const recordId = String(message?.recordId || record?.id || "");
    const frameUrl = recordFrameUrl(record);
    if (!recordId || !frameUrl || normalizeLocationKey(frameUrl) !== normalizeLocationKey(location.href)) {
      return false;
    }

    if (message.type === "VFS_SAVED_STYLE_REVERT") {
      const comparison = remoteSavedStyleComparisons.get(recordId);
      if (comparison) {
        restoreElementStyleBaseline(comparison);
        remoteSavedStyleComparisons.delete(recordId);
      }
      const element = findElement(record);
      if (!element || isFrameFallbackForRecord(record, element)) {
        postSavedStyleComparisonResult(message, false, "没有找到这条试改对应的 iframe 元素。");
        return true;
      }
      applyRecordStyleBaseline(element, record, Array.isArray(message.edits) ? message.edits : []);
      postSavedStyleComparisonResult(message, true);
      return true;
    }

    if (message.type === "VFS_SAVED_STYLE_RESTORE") {
      const comparison = remoteSavedStyleComparisons.get(recordId);
      if (comparison) {
        restoreElementStyleBaseline(comparison);
        remoteSavedStyleComparisons.delete(recordId);
      }
      postSavedStyleComparisonResult(message, true);
      return true;
    }

    const side = message.side === "after" ? "after" : "before";
    const edits = Array.isArray(message.edits) ? message.edits : [];
    let comparison = remoteSavedStyleComparisons.get(recordId);
    if (!comparison?.element?.isConnected) {
      if (comparison) {
        remoteSavedStyleComparisons.delete(recordId);
      }
      const element = findElement(record);
      if (!element || isFrameFallbackForRecord(record, element)) {
        postSavedStyleComparisonResult(message, false, "没有找到这条试改对应的 iframe 元素。");
        return true;
      }
      comparison = {
        recordId,
        element,
        edits,
        side: "",
        ...captureElementStyleBaseline(element)
      };
      remoteSavedStyleComparisons.set(recordId, comparison);
    } else {
      comparison.edits = edits;
    }
    applySavedStyleComparisonSide(comparison, side);
    postSavedStyleComparisonResult(message, true);
    return true;
  }

  function postSavedStyleComparisonResult(message, ok, error = "") {
    postToParent({
      type: "VFS_SAVED_STYLE_COMPARE_RESULT",
      recordId: String(message?.recordId || message?.record?.id || ""),
      requestId: String(message?.requestId || ""),
      operation: message?.type === "VFS_SAVED_STYLE_RESTORE"
        ? "restore"
        : message?.type === "VFS_SAVED_STYLE_REVERT"
          ? "revert"
          : "compare",
      side: message?.side === "after" ? "after" : "before",
      ok: Boolean(ok),
      error: String(error || "")
    });
  }

  function sendRemoteStyleMessage(type, draft, payload = {}) {
    if (!isTopFrame() || !draft?.remoteSessionId) {
      return;
    }
    postToChildFrames({
      type,
      sessionId: draft.remoteSessionId,
      ...payload
    });
  }

  function styleTargetForSelection(selection) {
    if (selectedElement?.isConnected && !isVfsAnnotationBlocked(selectedElement)) {
      return selectedElement;
    }
    if (!selection?.topFrame || !selection.selector) {
      return null;
    }
    try {
      const element = document.querySelector(selection.selector);
      return element && !isVfsAnnotationBlocked(element) ? element : null;
    } catch {
      return null;
    }
  }

  function handleStyleInput(event) {
    applyStyleInput(event.currentTarget);
  }

  function applyStyleInput(input) {
    const property = input?.dataset?.vfsStyle;
    if (!styleDraft || !property) {
      return;
    }
    const normalized = normalizeStyleValue(property, input.value);
    if (normalized === null) {
      return;
    }
    const next = clonePlainObject(styleDraft.values) || {};
    const baseline = normalizeStyleValue(property, styleBaselineValue(styleDraft, property));
    if (normalized === baseline) {
      delete next[property];
    } else {
      next[property] = normalized;
    }
    if (styleStatesEqual(next, styleDraft.values)) {
      return;
    }
    styleHistory.push(clonePlainObject(styleDraft.values) || {});
    if (styleHistory.length > 48) {
      styleHistory.shift();
    }
    styleFuture = [];
    styleComparisonActive = false;
    applyStyleDraftState(next);
    updateToolButtons();
  }

  function handleStylePresetFocusIn(event) {
    const input = event.target?.closest?.("[data-vfs-style][data-vfs-preset]");
    if (!input || !composer?.contains(input)) {
      return;
    }
    openStylePresetMenu(input);
  }

  function handleStylePresetPointerDown(event) {
    if (event.target?.closest?.(".vfs-style-menu")) {
      return;
    }
    const trigger = event.target?.closest?.("[data-vfs-preset-trigger]");
    const input = stylePresetInputFromTarget(event.target);
    if (input && composer?.contains(input)) {
      if (trigger) {
        event.preventDefault();
      }
      openStylePresetMenu(input);
      return;
    }
    closeStylePresetMenu();
  }

  function stylePresetInputFromTarget(target) {
    if (!(target instanceof Element)) {
      return null;
    }
    const input = target.closest("[data-vfs-style][data-vfs-preset]");
    if (input) {
      return input;
    }
    return target.closest("[data-vfs-style-field]")?.querySelector("[data-vfs-style][data-vfs-preset]") || null;
  }

  function handleStyleHelpPointerOver(event) {
    const icon = event.target?.closest?.("[data-vfs-style-help]");
    if (icon && composer?.contains(icon)) {
      showStyleHelpTooltip(icon);
    }
  }

  function handleStyleHelpPointerOut(event) {
    const icon = event.target?.closest?.("[data-vfs-style-help]");
    if (!icon) {
      return;
    }
    if (event.relatedTarget instanceof Node && icon.contains(event.relatedTarget)) {
      return;
    }
    hideStyleHelpTooltip();
  }

  function showStyleHelpTooltip(icon) {
    const text = String(icon?.dataset?.vfsStyleHelp || "").trim();
    if (!styleHelpTooltip || !text) {
      return;
    }
    styleHelpTooltip.textContent = text;
    styleHelpTooltip.hidden = false;
    styleHelpTooltip.style.visibility = "hidden";
    const anchorRect = icon.getBoundingClientRect();
    const tooltipRect = styleHelpTooltip.getBoundingClientRect();
    const left = clamp(anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2, 8, window.innerWidth - tooltipRect.width - 8);
    const top = Math.max(8, anchorRect.top - tooltipRect.height - 7);
    styleHelpTooltip.style.left = `${Math.round(left)}px`;
    styleHelpTooltip.style.top = `${Math.round(top)}px`;
    styleHelpTooltip.style.visibility = "visible";
  }

  function hideStyleHelpTooltip() {
    if (styleHelpTooltip) {
      styleHelpTooltip.hidden = true;
    }
  }

  function handleStylePresetOptionPointerDown(event) {
    const option = event.target?.closest?.("[data-vfs-preset-value]");
    if (!option || !stylePresetInput) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    stylePresetInput.value = option.dataset.vfsPresetValue || "";
    applyStyleInput(stylePresetInput);
    stylePresetInput.focus();
    closeStylePresetMenu();
  }

  function openStylePresetMenu(input) {
    const property = input?.dataset?.vfsPreset || input?.dataset?.vfsStyle;
    const values = STYLE_PRESETS[property] || [];
    if (!stylePresetMenu || !values.length) {
      closeStylePresetMenu();
      return;
    }
    stylePresetInput = input;
    stylePresetMenu.replaceChildren(...values.map((value) => createStylePresetOption(property, value, input.value)));
    const anchor = input.closest("[data-vfs-style-field]") || input;
    const rect = anchor.getBoundingClientRect();
    const width = Math.max(160, Math.min(280, rect.width));
    const menuHeight = Math.min(244, values.length * 32 + 8);
    const belowTop = rect.bottom + 6;
    const top = belowTop + menuHeight > window.innerHeight - 8
      ? Math.max(8, rect.top - menuHeight - 6)
      : belowTop;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    stylePresetMenu.style.left = `${Math.round(left)}px`;
    stylePresetMenu.style.top = `${Math.round(top)}px`;
    stylePresetMenu.style.width = `${Math.round(width)}px`;
    stylePresetMenu.style.maxHeight = `${Math.round(menuHeight)}px`;
    stylePresetMenu.hidden = false;
  }

  function closeStylePresetMenu() {
    if (stylePresetMenu) {
      stylePresetMenu.hidden = true;
      stylePresetMenu.replaceChildren();
    }
    stylePresetInput = null;
  }

  function createStylePresetOption(property, value, currentValue) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "vfs-style-menu-option";
    option.dataset.vfsPresetValue = value;
    const normalizedValue = normalizeStyleValue(property, value);
    const normalizedCurrent = normalizeStyleValue(property, currentValue);
    option.classList.toggle("is-selected", normalizedValue !== null && normalizedValue === normalizedCurrent);
    if (property === "color" || property === "background-color") {
      const swatch = document.createElement("span");
      swatch.className = "vfs-style-menu-swatch";
      swatch.style.background = colorValueToHex(value, "#ffffff");
      option.append(swatch);
    }
    const text = document.createElement("span");
    text.textContent = value;
    option.append(text);
    return option;
  }

  function undoStyleChange() {
    if (!styleDraft || !styleHistory.length) {
      return;
    }
    styleFuture.push(clonePlainObject(styleDraft.values) || {});
    applyStyleDraftState(styleHistory.pop() || {});
    updateToolButtons();
  }

  function redoStyleChange() {
    if (!styleDraft || !styleFuture.length) {
      return;
    }
    styleHistory.push(clonePlainObject(styleDraft.values) || {});
    applyStyleDraftState(styleFuture.pop() || {});
    updateToolButtons();
  }

  function toggleStyleComparison() {
    if (!styleDraftAvailable(styleDraft) || !Object.keys(styleDraft.values || {}).length) {
      return;
    }
    if (styleComparisonActive) {
      applyStyleDraftState(styleDraft.values);
      styleComparisonActive = false;
    } else {
      restoreStyleDraftBaseline(styleDraft);
      styleComparisonActive = true;
    }
    updateToolButtons();
    trackEvent("ba_compare_used", {
      source: "draft",
      comparison_side: styleComparisonActive ? "before" : "after"
    });
  }

  function savedStyleEdits(record) {
    if (record?.type !== "dom" || record.annotationKind !== "adjustment" || !Array.isArray(record.styleEdits)) {
      return [];
    }
    return record.styleEdits.flatMap((edit) => {
      if (!edit || !Object.prototype.hasOwnProperty.call(edit, "before") || !Object.prototype.hasOwnProperty.call(edit, "after")) {
        return [];
      }
      const rawProperty = String(edit.property || "").trim();
      const property = rawProperty === "文本内容" ? "text" : rawProperty;
      if (property !== "text" && !STYLE_PROPERTIES.includes(property)) {
        return [];
      }
      return [{
        property,
        before: String(edit.before ?? ""),
        after: String(edit.after ?? "")
      }];
    });
  }

  function serializeStyleBaseline(draft, edits) {
    if (!draft || !Array.isArray(edits) || !edits.length) {
      return null;
    }
    const properties = new Set(edits.map((edit) => edit.property === "文本内容" ? "text" : String(edit.property || "")));
    const inline = {};
    const priority = {};
    properties.forEach((property) => {
      if (property === "text" || !STYLE_PROPERTIES.includes(property)) {
        return;
      }
      if (Object.prototype.hasOwnProperty.call(draft.inline || {}, property)) {
        inline[property] = String(draft.inline[property] || "");
        priority[property] = String(draft.priority?.[property] || "");
      }
    });
    return {
      inline,
      priority,
      text: properties.has("text") ? String(draft.text || "") : "",
      isField: Boolean(draft.isField)
    };
  }

  function applyRecordStyleBaseline(element, record, edits = savedStyleEdits(record)) {
    if (!element?.isConnected || !edits.length) {
      return false;
    }
    const baseline = record?.styleBaseline && typeof record.styleBaseline === "object" ? record.styleBaseline : {};
    edits.forEach((edit) => {
      if (edit.property === "text") {
        const text = Object.prototype.hasOwnProperty.call(baseline, "text") ? baseline.text : edit.before;
        if (baseline.isField || element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
          element.value = String(text || "");
        } else {
          element.textContent = String(text || "");
        }
        return;
      }
      if (Object.prototype.hasOwnProperty.call(baseline.inline || {}, edit.property)) {
        const inlineValue = String(baseline.inline[edit.property] || "");
        if (inlineValue) {
          element.style.setProperty(edit.property, inlineValue, String(baseline.priority?.[edit.property] || ""));
        } else {
          element.style.removeProperty(edit.property);
        }
        return;
      }
      if (edit.before) {
        element.style.setProperty(edit.property, edit.before, "important");
      } else {
        element.style.removeProperty(edit.property);
      }
    });
    return true;
  }

  function restoreRecordStyle(record) {
    const edits = savedStyleEdits(record);
    if (!record || !edits.length) {
      return false;
    }
    if (isRecordFromDifferentFrame(record)) {
      return sendSavedStyleComparisonMessage("VFS_SAVED_STYLE_REVERT", record, edits, "before");
    }
    const element = findElement(record);
    if (!element || isFrameFallbackForRecord(record, element)) {
      return false;
    }
    return applyRecordStyleBaseline(element, record, edits);
  }

  function toggleSavedStyleComparison(recordId) {
    const record = records.find((item) => item.id === recordId);
    const edits = savedStyleEdits(record);
    if (!record || mode !== "read" || !edits.length) {
      return;
    }
    if (isRecordFromDifferentFrame(record)) {
      if (savedStyleComparison?.recordId === record.id && savedStyleComparison.remote) {
        const nextSide = savedStyleComparison.side === "before" ? "after" : "before";
        if (!sendSavedStyleComparisonMessage("VFS_SAVED_STYLE_COMPARE", record, edits, nextSide, savedStyleComparison)) {
          restoreSavedStyleComparison();
          showToast("没有找到这条试改对应的 iframe。");
          return;
        }
        savedStyleComparison.side = nextSide;
        renderThreads();
        trackEvent("ba_compare_used", { source: "saved_iframe", comparison_side: nextSide });
        return;
      }

      restoreSavedStyleComparison();
      savedStyleComparison = {
        recordId: record.id,
        record,
        edits,
        side: "before",
        remote: true,
        pendingRequestId: ""
      };
      if (!sendSavedStyleComparisonMessage("VFS_SAVED_STYLE_COMPARE", record, edits, "before", savedStyleComparison)) {
        savedStyleComparison = null;
        showToast("没有找到这条试改对应的 iframe。");
        return;
      }
      renderThreads();
      trackEvent("ba_compare_used", { source: "saved_iframe", comparison_side: "before" });
      return;
    }

    if (savedStyleComparison?.recordId === record.id && savedStyleComparison.element?.isConnected) {
      const nextSide = savedStyleComparison.side === "before" ? "after" : "before";
      applySavedStyleComparisonSide(savedStyleComparison, nextSide);
      renderThreads();
      trackEvent("ba_compare_used", { source: "saved_dom", comparison_side: nextSide });
      return;
    }

    restoreSavedStyleComparison();
    const element = findElement(record);
    if (!element || isFrameFallbackForRecord(record, element)) {
      showToast("没有找到这条试改对应的页面元素。");
      return;
    }
    savedStyleComparison = {
      recordId: record.id,
      element,
      edits,
      side: "",
      ...captureElementStyleBaseline(element)
    };
    applySavedStyleComparisonSide(savedStyleComparison, "before");
    renderThreads();
    trackEvent("ba_compare_used", { source: "saved_dom", comparison_side: "before" });
  }

  function applySavedStyleComparisonSide(comparison, side) {
    if (!comparison?.element?.isConnected) {
      return;
    }
    restoreElementStyleBaseline(comparison);
    comparison.edits.forEach((edit) => {
      applyStyleValue(comparison, edit.property, edit[side]);
    });
    comparison.side = side;
  }

  function restoreSavedStyleComparison() {
    if (!savedStyleComparison) {
      return;
    }
    if (savedStyleComparison.remote) {
      sendSavedStyleComparisonMessage(
        "VFS_SAVED_STYLE_RESTORE",
        savedStyleComparison.record,
        savedStyleComparison.edits,
        savedStyleComparison.side,
        savedStyleComparison
      );
    } else {
      restoreElementStyleBaseline(savedStyleComparison);
    }
    savedStyleComparison = null;
  }

  function sendSavedStyleComparisonMessage(type, record, edits, side, comparison) {
    if (!isTopFrame() || !record) {
      return false;
    }
    const frame = findFrameElementForRecord(record);
    if (!frame?.contentWindow) {
      return false;
    }
    const requestId = createId();
    if (comparison) {
      comparison.pendingRequestId = requestId;
    }
    try {
      frame.contentWindow.postMessage({
        source: INTERNAL_SOURCE,
        type,
        recordId: String(record.id || ""),
        requestId,
        record: clonePlainObject(record),
        edits: clonePlainObject(edits) || [],
        side: side === "after" ? "after" : "before"
      }, "*");
      return true;
    } catch {
      return false;
    }
  }

  function handleSavedStyleComparisonResult(message) {
    if (message.operation !== "compare" || !savedStyleComparison?.remote) {
      return;
    }
    if (savedStyleComparison.recordId !== message.recordId || savedStyleComparison.pendingRequestId !== message.requestId) {
      return;
    }
    savedStyleComparison.pendingRequestId = "";
    if (message.ok) {
      return;
    }
    savedStyleComparison = null;
    renderThreads();
    showToast(message.error || "没有找到这条试改对应的 iframe 元素。");
  }

  function applyStyleDraftState(values) {
    if (!styleDraftAvailable(styleDraft)) {
      return;
    }
    styleDraft.values = clonePlainObject(values) || {};
    if (styleDraft.remoteSessionId) {
      sendRemoteStyleMessage("VFS_REMOTE_STYLE_APPLY", styleDraft, { values: styleDraft.values });
      syncStyleInputs();
      return;
    }
    restoreStyleDraftBaseline(styleDraft);
    Object.entries(styleDraft.values).forEach(([property, value]) => applyStyleValue(styleDraft, property, value));
    syncStyleInputs();
  }

  function restoreStyleDraftBaseline(draft, options = {}) {
    if (draft?.remoteSessionId) {
      sendRemoteStyleMessage("VFS_REMOTE_STYLE_RESTORE", draft, { dispose: Boolean(options.dispose) });
      return;
    }
    restoreElementStyleBaseline(draft);
  }

  function restoreElementStyleBaseline(draft) {
    if (!draft?.element?.isConnected) {
      return;
    }
    STYLE_PROPERTIES.forEach((property) => {
      const value = draft.inline[property] || "";
      if (value) {
        draft.element.style.setProperty(property, value, draft.priority[property] || "");
      } else {
        draft.element.style.removeProperty(property);
      }
    });
    if (draft.isField) {
      draft.element.value = draft.text;
    } else {
      draft.element.innerHTML = draft.html;
    }
  }

  function commitStyleDraft(draft) {
    if (draft?.remoteSessionId) {
      sendRemoteStyleMessage("VFS_REMOTE_STYLE_COMMIT", draft);
    }
  }

  function styleDraftAvailable(draft) {
    return Boolean(draft?.remoteSessionId || draft?.element?.isConnected);
  }

  function applyStyleValue(draft, property, value) {
    if (property === "text") {
      if (draft.isField) {
        draft.element.value = String(value);
      } else {
        draft.element.textContent = String(value);
      }
      return;
    }
    draft.element.style.setProperty(property, String(value), "important");
  }

  function syncStyleInputs() {
    if (!composer || !styleDraft) {
      return;
    }
    composer.querySelectorAll("[data-vfs-style]").forEach((input) => {
      const property = input.dataset.vfsStyle;
      const value = Object.prototype.hasOwnProperty.call(styleDraft.values, property)
        ? styleDraft.values[property]
        : normalizeStyleValue(property, styleBaselineValue(styleDraft, property));
      const displayValue = formatStyleInputValue(property, value);
      if (displayValue !== null && input.value !== displayValue) {
        input.value = displayValue;
      }
    });
  }

  function styleBaselineValue(draft, property) {
    return property === "text" ? draft.text : draft.before[property] || "";
  }

  function formatStyleInputValue(property, value) {
    if (value === null || value === undefined) {
      return null;
    }
    if (property === "opacity") {
      const numeric = Number.parseFloat(value);
      return Number.isFinite(numeric) ? `${roundNumber(numeric * 100)}%` : String(value);
    }
    return String(value);
  }

  function normalizeStyleValue(property, value) {
    const raw = String(value ?? "").trim();
    if (property === "text") {
      return raw;
    }
    if (property === "color" || property === "background-color") {
      return colorValueToHex(raw, null);
    }
    if (property === "font-size" || property === "padding" || property === "border-radius") {
      const numeric = Number.parseFloat(raw);
      if (!Number.isFinite(numeric) || numeric < 0 || (property === "font-size" && numeric < 1)) {
        return null;
      }
      return `${roundNumber(numeric)}px`;
    }
    if (property === "font-weight") {
      const numeric = raw === "normal" ? 400 : raw === "bold" ? 700 : Number.parseFloat(raw);
      if (!Number.isFinite(numeric)) {
        return null;
      }
      return String(clamp(Math.round(numeric / 100) * 100, 100, 900));
    }
    if (property === "opacity") {
      const numeric = raw.endsWith("%") ? Number.parseFloat(raw) / 100 : Number.parseFloat(raw);
      return Number.isFinite(numeric) ? String(roundNumber(clamp(numeric, 0, 1))) : null;
    }
    if (property === "text-align") {
      const align = raw === "start" ? "left" : raw === "end" ? "right" : raw;
      return ["left", "center", "right", "justify"].includes(align) ? align : "left";
    }
    return raw || null;
  }

  function colorValueToHex(value, fallback) {
    const raw = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) {
      return raw.toLowerCase();
    }
    if (/^#[0-9a-f]{3}$/i.test(raw)) {
      return `#${raw.slice(1).split("").map((part) => `${part}${part}`).join("")}`.toLowerCase();
    }
    const channels = raw.match(/\d+(?:\.\d+)?/g);
    if (!channels || channels.length < 3) {
      return fallback;
    }
    return `#${channels.slice(0, 3).map((channel) => clamp(Math.round(Number(channel)), 0, 255).toString(16).padStart(2, "0")).join("")}`;
  }

  function styleStatesEqual(left, right) {
    const leftKeys = Object.keys(left || {}).sort();
    const rightKeys = Object.keys(right || {}).sort();
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }
    return leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key]);
  }

  function collectStyleEdits(draft) {
    if (!draft?.values) {
      return [];
    }
    return Object.entries(draft.values).map(([property, after]) => ({
      property: property === "text" ? "文本内容" : property,
      before: styleBaselineValue(draft, property),
      after: String(after)
    }));
  }

  function positionDomComposer(selection = currentDomSelection()) {
    if (!selection || !composer?.classList.contains("is-visible")) {
      return;
    }
    const rect = selection.viewportRect || selection.rect;
    if (!rect) {
      return;
    }
    const sidebar = sidebarWidth();
    const compact = window.innerWidth <= 720 || window.innerWidth - sidebar < 296;
    const height = composer.offsetHeight || 178;
    if (compact) {
      const top = Math.max(88, Math.min(rect.y + rect.height + 12, window.innerHeight - height - 16));
      composer.style.setProperty("left", "8px", "important");
      composer.style.setProperty("right", "8px", "important");
      composer.style.setProperty("width", "calc(100vw - 16px)", "important");
      composer.style.setProperty("top", `${Math.round(top)}px`, "important");
      return;
    }
    composer.style.removeProperty("width");
    const maxRight = window.innerWidth - sidebar - 16;
    const width = Math.max(260, Math.min(320, window.innerWidth - sidebar - 36));
    let left = rect.x + rect.width + 12;
    if (left + width > maxRight) {
      left = rect.x - width - 12;
    }
    if (left < 16) {
      left = Math.max(16, Math.min(rect.x, maxRight - width));
    }
    const top = Math.max(70, Math.min(rect.y + rect.height + 12, window.innerHeight - height - 16));
    composer.style.setProperty("left", `${Math.round(left)}px`, "important");
    composer.style.setProperty("top", `${Math.round(top)}px`, "important");
    composer.style.setProperty("right", "auto", "important");
  }

  async function saveDomRecord() {
    if (domSaveInProgress) {
      return;
    }
    reconcileMentionSelectionFromInput("dom");
    const mentions = selectedMentions("dom");
    const comment = stripMentionTokens(commentInput.value, mentions).trim();
    const selection = currentDomSelection();
    const styleEdits = collectStyleEdits(styleDraft);
    const styleBaseline = serializeStyleBaseline(styleDraft, styleEdits);
    const text = comment || styleEditSummary(styleEdits);
    if (!selection || (!text && !styleEdits.length)) {
      showToast("请先选择页面元素并留下批注或试改。");
      return;
    }

    if (styleComparisonActive && styleDraft) {
      applyStyleDraftState(styleDraft.values);
      styleComparisonActive = false;
    }
    commitStyleDraft(styleDraft);

    domSaveInProgress = true;
    selectedElement?.classList.remove("vfs-selected");
    selectedElement = null;
    pendingSelection = null;
    closeDomComposer({ keepStyle: true });
    broadcastToChildFrames({ type: "VFS_CLEAR_SELECTION" });
    broadcastToChildFrames({ type: "VFS_CLOSE_DOM_COMPOSER" });
    try {
      const previewImage = await createDomPreview(selection).catch(() => "");
      const recordSelection = clonePlainObject(selection) || {};
      delete recordSelection.remoteStyle;
      const record = {
        ...recordSelection,
        id: createId(),
        type: "dom",
        author: currentAuthor,
        text,
        annotationKind: styleEdits.length ? "adjustment" : "evaluation",
        mentions,
        styleEdits,
        styleBaseline,
        previewImage,
        createdAt: new Date().toISOString(),
        url: currentPageUrl()
      };

      const committed = await commitRecord(record, { focus: true });
      if (!committed) {
        restoreRecordStyle(record);
        showToast("DOM 标注保存失败，请检查插件存储空间后重试。");
        return;
      }
      showToast("DOM 标注已保留。");
      if (!previewImage) {
        void enrichDomRecord(record.id, selection);
      }
    } finally {
      domSaveInProgress = false;
      closeDomComposer({ keepStyle: true });
      requestAnimationFrame(() => closeDomComposer({ keepStyle: true }));
    }
  }

  async function enrichDomRecord(recordId, selection) {
    let previewImage = "";
    try {
      previewImage = await createDomPreview(selection);
    } catch (error) {
      console.warn("[VFS] DOM preview fallback", error);
    }
    if (!previewImage) {
      return;
    }
    const record = records.find((item) => item.id === recordId);
    if (!record) {
      return;
    }
    record.previewImage = previewImage;
    await persistRecordEnrichment(record);
    broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
    renderAll();
    scheduleMarkerUpdate();
    forcePanelStateChanged();
  }

  function renderThreads() {
    if (savedStyleComparison && (mode !== "read" || !records.some((record) => record.id === savedStyleComparison.recordId))) {
      restoreSavedStyleComparison();
    }
    const previousScrollTop = threadList.scrollTop;
    const previousScrollLeft = threadList.scrollLeft;
    const visibleRecords = activeRecords();
    const inlineReplyRecordId = editPopover?.classList.contains("is-visible")
      && editPopover.classList.contains("is-inline-reply")
      && editingRecordMode === "reply"
      ? editingRecordId
      : "";
    if (inlineReplyRecordId) {
      if (visibleRecords.some((record) => record.id === inlineReplyRecordId)) {
        editPopover.remove();
      } else {
        closeRecordEditor();
      }
    }
    threadList.replaceChildren();
    if (!visibleRecords.length) {
      const empty = document.createElement("div");
      empty.className = "vfs-empty";
      const title = document.createElement("strong");
      title.textContent = "暂无批注";
      const body = document.createElement("span");
      body.textContent = "选择 DOM 元素或截取页面区域后，记录会在这里排列。";
      empty.append(title, body);
      threadList.append(empty);
      restoreThreadListScroll(previousScrollTop, previousScrollLeft);
      return;
    }

    visibleRecords.forEach((record, index) => {
      const item = document.createElement("div");
      item.className = "vfs-thread";
      item.classList.toggle("is-dom", record.type === "dom");
      item.classList.toggle("is-shot", record.type === "screenshot");
      item.classList.toggle("is-adjustment", record.annotationKind === "adjustment");
      item.classList.toggle("is-resolved", record.collab?.status === "resolved");
      item.classList.toggle("is-deep-linked", deepLinkHighlightThreadId === (record.collab?.threadId || record.id));

      const indexNode = document.createElement("div");
      indexNode.className = "vfs-index";
      indexNode.classList.toggle("is-dom", record.type === "dom");
      indexNode.classList.toggle("is-shot", record.type === "screenshot");
      indexNode.textContent = String(index + 1);

      const card = document.createElement("div");
      card.className = "vfs-card";
      card.dataset.recordId = record.id;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.classList.toggle("is-dom", record.type === "dom");
      card.classList.toggle("is-shot", record.type === "screenshot");
      card.classList.toggle("is-active", record.id === activeId);
      card.classList.toggle("has-collab-actions", Boolean(activeTeamChatId()));
      const savedEdits = savedStyleEdits(record);
      const canCompareSavedStyle = mode === "read" && savedEdits.length > 0;
      card.classList.toggle("has-style-compare", canCompareSavedStyle);
      const focus = () => {
        clearConfirmState();
        focusRecord(record.id);
      };
      const activateCard = (event) => {
        const target = event?.target instanceof Element ? event.target : card;
        if (target !== card && target.closest("button,a,input,textarea,select,[contenteditable='true'],.vfs-shot-thumb")) {
          return;
        }
        focus();
        if (activeTeamChatId()) {
          openRecordReply(record.id, recordCard(record.id) || card);
        }
      };
      card.addEventListener("click", activateCard);
      card.addEventListener("keydown", (event) => {
        if (event.target === card && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          activateCard(event);
        }
      });

      const meta = document.createElement("div");
      meta.className = "vfs-thread-meta";
      const authorName = record.collab?.authorName || record.author || DEFAULT_AUTHOR;
      const avatar = commentAvatarNode(authorName, memberAvatarUrl(record.collab?.authorOpenId, record.collab?.authorAvatarUrl));
      const identity = document.createElement("div");
      identity.className = "vfs-comment-identity";
      const author = document.createElement("strong");
      author.textContent = authorName;
      const time = document.createElement("span");
      time.textContent = formatTime(record.createdAt);
      identity.append(author, time);
      meta.append(avatar, identity);
      const replyCount = Math.max(0, Number(record.collab?.messages?.length || 0) - 1);
      if (replyCount) {
        const replies = document.createElement("span");
        replies.textContent = `${replyCount} 条回复`;
        identity.append(replies);
      }

      const body = document.createElement("p");
      renderTextWithMentions(body,
        record.text || styleEditSummary(record.styleEdits),
        record.mentions || record.collab?.mentions
      );

      if (record.previewImage) {
        const preview = document.createElement("img");
        preview.className = "vfs-shot-thumb";
        preview.src = record.previewImage;
        preview.alt = record.type === "dom" ? "DOM 批注预览" : "截图批注预览";
        preview.title = "点击查看大图";
        preview.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          openImageViewer(record.previewImage, preview.alt);
        });
        card.append(meta, body, preview);
      } else {
        card.append(meta, body);
      }

      const target = document.createElement("div");
      target.className = "vfs-thread-target";
      target.textContent = targetLabel(record);

      card.append(target);
      const replyMessages = Array.isArray(record.collab?.messages)
        ? record.collab.messages.slice(1).filter((message) => message?.text)
        : [];
      if (replyMessages.length) {
        const replyList = document.createElement("div");
        replyList.className = "vfs-thread-replies";
        replyList.dataset.vfsReplyLevel = "2";
        replyList.setAttribute("role", "list");
        replyList.setAttribute("aria-label", "回复");
        replyMessages.forEach((message) => {
          const reply = document.createElement("div");
          reply.className = "vfs-thread-reply";
          reply.setAttribute("role", "listitem");
          const replyAvatar = commentAvatarNode(message.authorName || "协作者", memberAvatarUrl(message.authorOpenId, message.authorAvatarUrl));
          const replyMeta = document.createElement("div");
          replyMeta.className = "vfs-thread-reply-meta";
          const replyAuthor = document.createElement("strong");
          replyAuthor.textContent = message.authorName || "协作者";
          const replyTime = document.createElement("span");
          replyTime.textContent = formatTime(message.createdAt || message.updatedAt);
          replyMeta.append(replyAuthor, replyTime);
          const replyBody = document.createElement("p");
          renderTextWithMentions(replyBody, message.text, message.mentions);
          const replyContent = document.createElement("div");
          replyContent.className = "vfs-thread-reply-content";
          replyContent.append(replyMeta, replyBody);
          reply.append(replyAvatar, replyContent);
          replyList.append(reply);
        });
        card.append(replyList);
      }
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "vfs-edit";
      editButton.dataset.vfsAction = "edit-record";
      editButton.dataset.recordId = record.id;
      editButton.title = "编辑这条批注";
      editButton.setAttribute("aria-label", "编辑这条批注");
      editButton.insertAdjacentHTML("afterbegin", iconSvg("edit"));
      editButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
      });

      let compareButton = null;
      if (canCompareSavedStyle) {
        const comparisonSide = savedStyleComparison?.recordId === record.id
          ? savedStyleComparison.side
          : "";
        compareButton = document.createElement("button");
        compareButton.type = "button";
        compareButton.className = "vfs-card-corner-button vfs-compare";
        compareButton.classList.toggle("is-before", comparisonSide === "before");
        compareButton.classList.toggle("is-after", comparisonSide === "after");
        compareButton.dataset.vfsAction = "compare-record-style";
        compareButton.dataset.recordId = record.id;
        compareButton.dataset.comparisonSide = comparisonSide;
        compareButton.title = comparisonSide === "before"
          ? "当前显示 Before，点击查看 After"
          : comparisonSide === "after"
            ? "当前显示 After，点击查看 Before"
            : "查看试改前后（先显示 Before）";
        compareButton.setAttribute("aria-label", compareButton.title);
        compareButton.setAttribute("aria-pressed", String(Boolean(comparisonSide)));
        compareButton.innerHTML = toolbarIcon("compare");
        compareButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
      }

      const replyButton = document.createElement("button");
      replyButton.type = "button";
      replyButton.className = "vfs-reply vfs-reply-glyph";
      replyButton.dataset.vfsAction = "reply-record";
      replyButton.dataset.recordId = record.id;
      replyButton.title = "回复这条批注";
      replyButton.setAttribute("aria-label", "回复这条批注");
      replyButton.innerHTML = iconSvg("reply");

      const resolveButton = document.createElement("button");
      resolveButton.type = "button";
      resolveButton.className = "vfs-resolve-corner";
      resolveButton.dataset.vfsAction = "resolve-record";
      resolveButton.dataset.recordId = record.id;
      const resolved = record.collab?.status === "resolved";
      resolveButton.classList.toggle("is-resolved", resolved);
      resolveButton.title = resolved ? "恢复为待处理" : "标记为已解决";
      resolveButton.setAttribute("aria-label", resolveButton.title);
      resolveButton.setAttribute("aria-pressed", String(resolved));
      resolveButton.innerHTML = toolbarIcon(resolved ? "refresh" : "checkCircle");

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "vfs-delete vfs-delete-glyph";
      const confirmingDelete = isConfirming("delete", record.id);
      deleteButton.classList.toggle("is-confirming", confirmingDelete);
      deleteButton.title = confirmingDelete ? "再次点击确认删除" : "删除该条批注";
      deleteButton.setAttribute("aria-label", confirmingDelete ? "确认删除该条批注" : "删除该条批注");
      deleteButton.textContent = confirmingDelete ? "删除" : "";
      deleteButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        requestDeleteRecord(record.id);
      });

      const actionToolbar = document.createElement("div");
      actionToolbar.className = "vfs-comment-toolbar";
      const cornerActions = document.createElement("div");
      cornerActions.className = "vfs-card-corner-actions";
      if (compareButton) {
        cornerActions.append(compareButton);
      }
      if (activeTeamChatId()) {
        cornerActions.append(resolveButton);
        actionToolbar.append(replyButton);
      }
      const canEdit = !activeTeamChatId() || !record.collab?.authorOpenId || record.collab.authorOpenId === feishuOpenId(feishuUser);
      if (canEdit) {
        actionToolbar.append(editButton, deleteButton);
      }
      if (cornerActions.childElementCount) {
        card.append(cornerActions);
      }
      if (actionToolbar.childElementCount) {
        card.append(actionToolbar);
      }
      if (inlineReplyRecordId === record.id) {
        attachInlineReplyEditor(card);
      }
      item.append(indexNode, card);
      threadList.append(item);
    });
    restoreThreadListScroll(previousScrollTop, previousScrollLeft);
  }

  function restoreThreadListScroll(scrollTop, scrollLeft) {
    threadList.scrollTop = Math.min(Math.max(0, scrollTop), Math.max(0, threadList.scrollHeight - threadList.clientHeight));
    threadList.scrollLeft = Math.max(0, scrollLeft);
  }

  function recordCard(recordId) {
    return Array.from(threadList?.querySelectorAll(".vfs-card[data-record-id]") || [])
      .find((card) => card.dataset.recordId === recordId) || null;
  }

  function attachInlineReplyEditor(card) {
    if (!card || !editPopover) {
      return;
    }
    editPopover.classList.add("is-inline-reply");
    editPopover.style.removeProperty("left");
    editPopover.style.removeProperty("top");
    editPopover.style.removeProperty("width");
    card.append(editPopover);
  }

  function moveRecordEditorToRoot() {
    if (!editPopover) {
      return;
    }
    editPopover.classList.remove("is-inline-reply");
    editPopover.style.removeProperty("left");
    editPopover.style.removeProperty("top");
    editPopover.style.removeProperty("width");
    if (editPopover.parentElement !== root) {
      root.append(editPopover);
    }
  }

  function setRecordEditorPresentation(modeName) {
    const replying = modeName === "reply";
    const placeholder = replying ? "回复，键入 @ 提及成员" : "编辑批注";
    if (editLabel) {
      editLabel.textContent = replying ? "回复" : "编辑批注";
    }
    if (editInput) {
      editInput.dataset.placeholder = placeholder;
      editInput.setAttribute("aria-label", placeholder);
      updateMentionEditorEmptyState(editInput);
    }
    const saveButton = editPopover?.querySelector("[data-vfs-action='save-edit']");
    if (saveButton) {
      saveButton.textContent = replying ? "回复" : "保存";
    }
  }

  function openRecordEditor(recordId, anchor) {
    const record = records.find((item) => item.id === recordId);
    if (!record || !editPopover || !editInput || !editLabel) {
      return;
    }
    editingRecordId = record.id;
    editingRecordMode = "edit";
    moveRecordEditorToRoot();
    resetMentionSelection("reply");
    activeId = record.id;
    setRecordEditorPresentation("edit");
    editLabel.textContent = record.type === "screenshot" ? "编辑截图批注" : "编辑 DOM 批注";
    editInput.value = record.text || "";
    editPopover.classList.add("is-visible");
    positionRecordEditor(anchor);
    editInput.focus();
    selectMentionEditorContents(editInput);
  }

  function openRecordReply(recordId, anchor) {
    const record = records.find((item) => item.id === recordId);
    if (!record || !editPopover || !editInput || !editLabel) {
      return;
    }
    const sameReply = editingRecordId === record.id
      && editingRecordMode === "reply"
      && editPopover.classList.contains("is-visible");
    activeId = record.id;
    const card = anchor?.closest?.(".vfs-card") || recordCard(record.id);
    if (sameReply) {
      attachInlineReplyEditor(card);
      editInput.focus({ preventScroll: true });
      return;
    }
    editingRecordId = record.id;
    editingRecordMode = "reply";
    resetMentionSelection("reply");
    const authorOpenId = String(record.collab?.authorOpenId || "").trim();
    const currentOpenId = feishuOpenId(feishuUser);
    const author = authorOpenId && authorOpenId !== currentOpenId
      ? teamMentionCandidates().find((member) => member.openId === authorOpenId)
      : null;
    setRecordEditorPresentation("reply");
    editInput.value = "";
    editPopover.classList.add("is-visible");
    attachInlineReplyEditor(card);
    if (author) {
      mentionSelections.reply.set(author.openId, author);
      insertMentionIntoInput("reply", author);
    }
    renderMentionPickers();
    positionRecordEditor(anchor);
    editInput.focus({ preventScroll: true });
  }

  function positionRecordEditor(anchor) {
    if (!editPopover?.classList.contains("is-visible") || editPopover.classList.contains("is-inline-reply")) {
      return;
    }
    const panelRect = sidebar?.getBoundingClientRect?.() || {
      left: Math.max(0, window.innerWidth - sidebarWidth()),
      top: 0,
      width: sidebarWidth(),
      right: window.innerWidth
    };
    const threadRect = anchor?.closest?.(".vfs-thread")?.getBoundingClientRect?.() || panelRect;
    const width = Math.max(280, Math.min(360, panelRect.width - 24));
    const height = editPopover.offsetHeight || 172;
    const top = clamp(threadRect.top + 4, panelRect.top + 12, window.innerHeight - height - 14);
    editPopover.style.left = `${Math.round(panelRect.left + 12)}px`;
    editPopover.style.top = `${Math.round(top)}px`;
    editPopover.style.width = `${Math.round(width)}px`;
  }

  function closeRecordEditor() {
    editingRecordId = "";
    editingRecordMode = "edit";
    editPopover?.classList.remove("is-visible");
    moveRecordEditorToRoot();
    if (editInput) {
      editInput.value = "";
    }
    resetMentionSelection("reply");
  }

  async function saveRecordEdit() {
    const record = records.find((item) => item.id === editingRecordId);
    if (!record) {
      closeRecordEditor();
      showToast("这条批注已不存在。");
      return;
    }
    const savingReply = editingRecordMode === "reply";
    if (savingReply) {
      reconcileMentionSelectionFromInput("reply");
    }
    const mentions = savingReply ? selectedMentions("reply") : [];
    const text = (savingReply ? stripMentionTokens(editInput?.value, mentions) : editInput?.value || "").trim();
    if (!text) {
      showToast("批注内容不能为空。");
      return;
    }
    let savedMentions = [];
    const now = new Date().toISOString();
    if (savingReply) {
      savedMentions = mentions;
      const messages = Array.isArray(record.collab?.messages) ? record.collab.messages.slice() : [];
      if (!messages.length && record.text) {
        messages.push({
          messageId: `${record.collab?.threadId || record.id}:root`,
          text: record.text,
          authorOpenId: record.collab?.authorOpenId || "",
          authorName: record.collab?.authorName || record.author || "协作者",
          mentions: record.mentions || record.collab?.mentions || [],
          createdAt: record.createdAt || now,
          updatedAt: record.createdAt || now
        });
      }
      messages.push({
        messageId: createId(),
        text,
        authorOpenId: feishuOpenId(feishuUser),
        authorName: displayFeishuUserName(feishuUser),
        authorAvatarUrl: feishuUser?.avatarUrl || feishuUser?.avatar_url || "",
        mentions,
        createdAt: now,
        updatedAt: now
      });
      record.collab = { ...(record.collab || {}), messages };
    } else {
      record.text = text;
    }
    record.updatedAt = now;
    markRecordPendingCollabSync(record);
    activeId = record.id;
    closeRecordEditor();
    await persistRecords();
    broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
    renderAll();
    scheduleCollabSync();
    if (savingReply) {
      trackEvent("reply_created", {
        mention_count: savedMentions.length,
        has_mention: savedMentions.length > 0,
        comment_type: record.type === "screenshot" ? "screenshot" : "dom"
      });
      if (savedMentions.length) {
        trackEvent("mention_created", {
          source: "reply",
          mention_count: savedMentions.length,
          comment_type: record.type === "screenshot" ? "screenshot" : "dom"
        });
      }
    }
    showToast(savingReply ? "回复已保存，正在同步。" : "批注已更新。");
  }

  async function toggleRecordResolved(recordId) {
    const record = records.find((item) => item.id === recordId);
    if (!record || !activeTeamChatId()) {
      return;
    }
    const resolved = record.collab?.status === "resolved";
    const now = new Date().toISOString();
    record.collab = {
      ...(record.collab || {}),
      status: resolved ? "open" : "resolved",
      statusUpdatedAt: now
    };
    record.updatedAt = now;
    markRecordPendingCollabSync(record);
    updateCollabCountsFromRecords();
    renderAll();
    await persistRecords();
    scheduleCollabSync();
    trackEvent(resolved ? "comment_reopened" : "comment_resolved", {
      comment_type: record.type === "screenshot" ? "screenshot" : "dom"
    });
    showToast(resolved ? "已恢复为待处理。" : "批注已解决。");
  }

  function styleEditSummary(styleEdits) {
    const edits = Array.isArray(styleEdits) ? styleEdits : [];
    if (!edits.length) {
      return "";
    }
    return edits.map((edit) => `${edit.property} ${edit.before} -> ${edit.after}`).join("；");
  }

  function renderAgentDeliveryPanel() {
    if (!agentModal || !agentModalMarkdown) {
      return;
    }
    const sourceRecords = activeRecords();
    if (!agentDeliveryOpen || !sourceRecords.length) {
      agentModal.classList.remove("is-visible");
      agentModal.setAttribute("aria-hidden", "true");
      return;
    }
    const selectedRecords = currentAgentRecords();
    const shots = selectedRecords.filter((record) => record.type === "screenshot" && record.previewImage);
    const attachmentMap = buildAgentAttachmentMap(shots);
    const markdown = currentAgentMarkdown();
    agentModalMarkdown.value = markdown;
    agentModalMarkdown.placeholder = "";
    agentModal.querySelectorAll("[data-vfs-action='agent-format-compact'], [data-vfs-action='agent-format-full']").forEach((button) => {
      const active = button.dataset.vfsAction === `agent-format-${agentFormat}`;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    updateAgentDeliveryActions();
    const attachments = agentModal.querySelector(".vfs-agent-modal-attachments");
    attachments.replaceChildren();
    if (shots.length) {
      const label = document.createElement("span");
      label.className = "vfs-agent-attachment-label";
      label.textContent = `附件 ${shots.length}`;
      attachments.append(label);
    }
    shots.forEach((record) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "vfs-agent-modal-shot";
      item.dataset.vfsAction = "agent-copy-image";
      item.dataset.recordId = record.id;
      item.title = `复制 ${attachmentMap.get(record.id)} 图片`;
      item.setAttribute("aria-label", item.title);
      const image = document.createElement("img");
      image.src = record.previewImage;
      image.alt = attachmentMap.get(record.id) || "截图";
      item.append(image);
      attachments.append(item);
    });
    agentModal.classList.add("is-visible");
    agentModal.setAttribute("aria-hidden", "false");
    return;
  }

  function updateAgentDeliveryActions() {
    if (!agentModal) {
      return;
    }
    const disabled = !hasAgentDeliveryContent();
    agentModal.querySelectorAll("[data-vfs-action='agent-copy-md'], [data-vfs-action='agent-export-package'], [data-vfs-action='agent-send-trae']").forEach((button) => {
      button.disabled = disabled;
    });
  }

  function agentContentItems(record) {
    const rootText = displayTextWithMentions(record.text || "", record.mentions || record.collab?.mentions || []);
    const items = [{
      key: `${record.id}:root`,
      kind: "root",
      label: "初始批注",
      text: rootText
    }];
    const replies = Array.isArray(record.collab?.messages)
      ? record.collab.messages.slice(1).filter((message) => message?.text)
      : [];
    replies.forEach((message, index) => {
      items.push({
        key: `${record.id}:reply:${message.messageId || index}`,
        kind: "reply",
        label: [`回复 ${index + 1}`, message.authorName || ""].filter(Boolean).join(" · "),
        text: displayTextWithMentions(message.text, message.mentions)
      });
    });
    return items;
  }

  function agentContentText(item) {
    return String(agentContentDrafts.has(item.key) ? agentContentDrafts.get(item.key) : item.text || "").trim();
  }

  function selectedAgentRequirements(record) {
    return agentContentItems(record)
      .filter((item) => agentSelectedContentKeys.has(item.key))
      .map(agentContentText)
      .filter(Boolean);
  }

  function buildAgentRequirementMap(sourceRecords) {
    return new Map(sourceRecords.map((record) => [record.id, selectedAgentRequirements(record)]));
  }

  function hasAgentDeliveryContent() {
    return currentAgentRecords().some((record) => selectedAgentRequirements(record).length);
  }

  function agentMetric(label, value) {
    const node = document.createElement("div");
    node.className = "vfs-agent-metric";
    const valueNode = document.createElement("strong");
    valueNode.textContent = value;
    const labelNode = document.createElement("span");
    labelNode.textContent = label;
    node.append(valueNode, labelNode);
    return node;
  }

  function formatAgentTextCount(value) {
    return Number(value || 0).toLocaleString("zh-CN");
  }

  function agentActionButton(action, label, className = "", disabled = false, hint = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `vfs-button ${className}`.trim();
    button.dataset.vfsAction = action;
    button.disabled = disabled;
    if (hint) {
      button.setAttribute("aria-label", `${label}：${hint}`);
      const labelNode = document.createElement("span");
      labelNode.className = "vfs-button-label";
      labelNode.textContent = label;
      const hintNode = document.createElement("span");
      hintNode.className = "vfs-button-hint";
      hintNode.textContent = hint;
      button.append(labelNode, hintNode);
    } else {
      button.textContent = label;
    }
    return button;
  }

  function renderAgentSelectorList(sourceRecords = activeRecords()) {
    const box = document.createElement("div");
    box.className = "vfs-agent-select-list";
    const availableItems = sourceRecords
      .filter((record) => agentSelectedIds.has(record.id))
      .flatMap((record) => agentContentItems(record));
    if (!availableItems.some((item) => item.key === agentActiveContentKey && agentSelectedContentKeys.has(item.key))) {
      agentActiveContentKey = availableItems.find((item) => agentSelectedContentKeys.has(item.key))?.key || "";
    }
    sourceRecords.forEach((record, index) => {
      const selected = agentSelectedIds.has(record.id);
      const group = document.createElement("section");
      group.className = "vfs-agent-select-group";
      group.classList.toggle("is-selected", selected);
      group.classList.toggle("is-shot", record.type === "screenshot");
      const row = document.createElement("label");
      row.className = "vfs-agent-select-row";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selected;
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          agentSelectedIds.add(record.id);
          const items = agentContentItems(record);
          if (!items.some((item) => agentSelectedContentKeys.has(item.key))) {
            agentSelectedContentKeys.add(items[0].key);
            agentActiveContentKey = items[0].key;
          }
        } else {
          agentSelectedIds.delete(record.id);
        }
        agentBatchIndex = 0;
        agentMarkdownDraft = null;
        renderAll();
      });
      const indexNode = document.createElement("span");
      indexNode.className = "vfs-agent-row-index";
      indexNode.textContent = String(index + 1);
      const body = document.createElement("span");
      body.className = "vfs-agent-row-body";
      const title = document.createElement("strong");
      title.textContent = `${record.type === "dom" ? "DOM" : "截图"}：${truncate(record.text || targetLabel(record), 34)}`;
      const meta = document.createElement("span");
      const replyCount = Math.max(0, agentContentItems(record).length - 1);
      meta.textContent = [targetLabel(record), replyCount ? `${replyCount} 条回复` : ""].filter(Boolean).join(" · ");
      body.append(title, meta);
      row.append(checkbox, indexNode, body);
      group.append(row);

      const contentList = document.createElement("div");
      contentList.className = "vfs-agent-content-list";
      contentList.hidden = !selected;
      agentContentItems(record).forEach((item) => {
        const itemRow = document.createElement("div");
        itemRow.className = "vfs-agent-content-row";
        itemRow.classList.toggle("is-selected", agentSelectedContentKeys.has(item.key));
        itemRow.classList.toggle("is-active", item.key === agentActiveContentKey);
        const itemHead = document.createElement("label");
        itemHead.className = "vfs-agent-content-head";
        const itemCheckbox = document.createElement("input");
        itemCheckbox.type = "checkbox";
        itemCheckbox.checked = agentSelectedContentKeys.has(item.key);
        itemCheckbox.addEventListener("change", () => {
          if (itemCheckbox.checked) {
            agentSelectedContentKeys.add(item.key);
            agentSelectedIds.add(record.id);
            agentActiveContentKey = item.key;
          } else {
            agentSelectedContentKeys.delete(item.key);
            const hasSelectedItem = agentContentItems(record).some((content) => agentSelectedContentKeys.has(content.key));
            if (!hasSelectedItem) {
              agentSelectedIds.delete(record.id);
            }
          }
          agentBatchIndex = 0;
          agentMarkdownDraft = null;
          renderAll();
        });
        const itemLabel = document.createElement("span");
        itemLabel.textContent = item.label;
        itemHead.append(itemCheckbox, itemLabel);
        const preview = document.createElement("button");
        preview.type = "button";
        preview.className = "vfs-agent-content-preview";
        preview.textContent = agentContentText(item) || "未填写内容";
        preview.title = agentSelectedContentKeys.has(item.key) ? "编辑交付内容" : "加入交付并编辑";
        preview.addEventListener("click", () => {
          agentSelectedContentKeys.add(item.key);
          agentSelectedIds.add(record.id);
          agentActiveContentKey = item.key;
          agentBatchIndex = 0;
          agentMarkdownDraft = null;
          renderAll();
          queueMicrotask(() => {
            Array.from(agentModal?.querySelectorAll(".vfs-agent-content-row textarea") || [])
              .find((editor) => editor.dataset.agentContentKey === item.key)
              ?.focus();
          });
        });
        const input = document.createElement("textarea");
        input.rows = 2;
        input.value = agentContentText(item);
        input.disabled = !agentSelectedContentKeys.has(item.key);
        input.dataset.agentContentKey = item.key;
        input.setAttribute("aria-label", `编辑${item.label}的交付内容`);
        input.addEventListener("input", () => {
          agentContentDrafts.set(item.key, input.value);
          agentMarkdownDraft = null;
          const markdown = currentAgentMarkdown();
          agentModalMarkdown.value = markdown;
          const meta = agentModal?.querySelector(".vfs-agent-markdown-meta");
          if (meta) {
            meta.textContent = markdown ? `${formatAgentTextCount(markdown.length)} 字符` : "暂无内容";
          }
          updateAgentDeliveryActions();
        });
        itemRow.append(itemHead, preview, input);
        contentList.append(itemRow);
      });
      group.append(contentList);
      box.append(group);
    });
    return box;
  }

  function renderAgentBatchTabs(batches) {
    const tabs = document.createElement("div");
    tabs.className = "vfs-agent-batches";
    batches.forEach((batch, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "vfs-button";
      button.classList.toggle("is-primary", index === agentBatchIndex);
      button.dataset.vfsAction = "agent-batch";
      button.dataset.batch = String(index);
      button.textContent = `第 ${index + 1} 批 ${batch.length} 张`;
      tabs.append(button);
    });
    return tabs;
  }

  function renderAgentAttachments(batchShots, attachmentMap, batchCount) {
    if (!batchShots.length) {
      return document.createDocumentFragment();
    }
    const box = document.createElement("div");
    box.className = "vfs-agent-attachments";
    const title = document.createElement("div");
    title.className = "vfs-agent-section-title";
    title.textContent = batchShots.length ? "截图附件队列" : "截图附件";
    box.append(title);
    if (batchCount > 1) {
      const note = document.createElement("div");
      note.className = "vfs-agent-small-note";
      note.textContent = "当前只显示本批截图，单批最多 9 张。";
      box.append(note);
    }
    batchShots.forEach((record) => {
      const item = document.createElement("div");
      item.className = "vfs-agent-attachment";
      const img = document.createElement("img");
      img.src = record.previewImage;
      img.alt = `${attachmentMap.get(record.id)} 截图批注`;
      img.addEventListener("click", () => openImageViewer(record.previewImage, img.alt));
      const meta = document.createElement("div");
      meta.className = "vfs-agent-attachment-meta";
      const label = document.createElement("strong");
      label.textContent = attachmentMap.get(record.id) || "截图";
      const text = document.createElement("span");
      text.textContent = truncate(record.text || targetLabel(record), 42);
      meta.append(label, text);
      const buttons = document.createElement("div");
      buttons.className = "vfs-agent-attachment-actions";
      const copy = agentActionButton("agent-copy-image", "", "is-icon-only");
      copy.dataset.recordId = record.id;
      setIconButton(copy, "copy", "复制图片");
      buttons.append(copy);
      item.append(img, meta, buttons);
      box.append(item);
    });
    return box;
  }

  async function openAgentDeliveryPanel() {
    const sourceRecords = activeRecords();
    if (!sourceRecords.length) {
      showToast("暂无可交付的批注。");
      return;
    }
    queueVisibleLegacyShotAnchors();
    const pendingTasks = Array.from(shotEnrichmentTasks.values());
    if (pendingTasks.length) {
      showToast("正在补全截图附近 DOM…");
      await Promise.allSettled(pendingTasks);
    }
    agentDeliveryOpen = true;
    agentFormat = "compact";
    agentSelectedIds = new Set(sourceRecords.map((record) => record.id));
    agentSelectedContentKeys = new Set(sourceRecords.map((record) => `${record.id}:root`));
    agentContentDrafts = new Map();
    agentActiveContentKey = `${sourceRecords[0].id}:root`;
    agentMobilePane = "selection";
    agentBatchIndex = 0;
    agentMarkdownDraft = null;
    renderAll();
    trackEvent("agent_delivery_opened", { record_count: sourceRecords.length });
  }

  function closeAgentDeliveryPanel() {
    agentDeliveryOpen = false;
    agentBatchIndex = 0;
    agentSelectedContentKeys = new Set();
    agentContentDrafts = new Map();
    agentActiveContentKey = "";
    agentMobilePane = "selection";
    agentMarkdownDraft = null;
    renderAll();
  }

  function currentAgentRecords() {
    return activeRecords();
  }

  function currentAgentMarkdown() {
    if (agentMarkdownDraft !== null) {
      return agentMarkdownDraft;
    }
    const selectedRecords = currentAgentRecords();
    const requirementMap = buildAgentRequirementMap(selectedRecords);
    const sourceRecords = selectedRecords.filter((record) => requirementMap.get(record.id)?.length);
    const shots = sourceRecords.filter((record) => record.type === "screenshot" && record.previewImage);
    const attachmentMap = buildAgentAttachmentMap(shots);
    return agentFormat === "full"
      ? exportAgentMarkdownDetailed(sourceRecords, { attachmentMap, requirementMap })
      : exportAgentMarkdown(sourceRecords, { attachmentMap, requirementMap });
  }

  function ensureAgentSelection() {
    const validIds = new Set(records.map((record) => record.id));
    agentSelectedIds = new Set(Array.from(agentSelectedIds).filter((id) => validIds.has(id)));
    if (!agentSelectedIds.size && records.length) {
      agentSelectedIds = new Set(records.map((record) => record.id));
    }
    ensureSelectedRecordContent(records);
  }

  function applyPanelAgentSelection(selectedIds) {
    const validIds = new Set(records.map((record) => record.id));
    const nextIds = Array.isArray(selectedIds)
      ? selectedIds.filter((id) => validIds.has(id))
      : [];
    agentSelectedIds = new Set(nextIds.length ? nextIds : Array.from(validIds));
    ensureSelectedRecordContent(records);
    agentBatchIndex = 0;
    agentMarkdownDraft = null;
  }

  function ensureSelectedRecordContent(sourceRecords) {
    agentSelectedIds.forEach((recordId) => {
      const record = sourceRecords.find((item) => item.id === recordId);
      const items = record ? agentContentItems(record) : [];
      if (items.length && !items.some((item) => agentSelectedContentKeys.has(item.key))) {
        agentSelectedContentKeys.add(items[0].key);
      }
    });
  }

  function selectAgentRecords(scope) {
    const sourceRecords = activeRecords();
    if (scope === "none") {
      agentSelectedIds = new Set();
    } else if (scope === "shots") {
      agentSelectedIds = new Set(sourceRecords.filter((record) => record.type === "screenshot").map((record) => record.id));
    } else {
      agentSelectedIds = new Set(sourceRecords.map((record) => record.id));
    }
    ensureSelectedRecordContent(sourceRecords);
    agentBatchIndex = 0;
    agentMarkdownDraft = null;
    renderAll();
  }

  function setAgentBatch(index) {
    const selectedShots = getAgentSelectedRecords().filter((record) => record.type === "screenshot" && record.previewImage);
    const batches = chunkRecords(selectedShots, 9);
    agentBatchIndex = batches.length ? clamp(index, 0, batches.length - 1) : 0;
    renderAll();
  }

  function getAgentSelectedRecords() {
    return activeRecords().filter((record) => agentSelectedIds.has(record.id));
  }

  function getAgentCurrentBatchRecords() {
    const selectedRecords = getAgentSelectedRecords();
    const selectedShots = selectedRecords.filter((record) => record.type === "screenshot" && record.previewImage);
    if (selectedShots.length <= 9) {
      return selectedRecords;
    }
    const currentBatch = chunkRecords(selectedShots, 9)[agentBatchIndex] || [];
    const currentShotIds = new Set(currentBatch.map((record) => record.id));
    return activeRecords().filter((record) => agentSelectedIds.has(record.id) && (record.type !== "screenshot" || currentShotIds.has(record.id)));
  }

  function buildAgentAttachmentMap(shots) {
    return new Map(shots.map((record, index) => [record.id, `A${index + 1}`]));
  }

  function chunkRecords(items, size) {
    const chunks = [];
    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }
    return chunks;
  }

  async function copyAgentMarkdownSelection() {
    const selectedRecords = currentAgentRecords();
    if (!selectedRecords.length || !hasAgentDeliveryContent()) {
      showToast("请至少选择一条交付内容。");
      return;
    }
    const markdown = currentAgentMarkdown();
    await copyTextToClipboard(markdown);
    showToast("修改清单已复制。");
  }

  function downloadAgentMarkdownSelection() {
    const selectedRecords = currentAgentRecords();
    if (!selectedRecords.length || !hasAgentDeliveryContent()) {
      showToast("请至少选择一条交付内容。");
      return;
    }
    const markdown = currentAgentMarkdown();
    downloadBlob(markdown, "text/markdown", `agent-feedback-${timestampForFile()}.md`);
    showToast("MD 已下载。");
  }

  async function exportAgentPackage() {
    const selectedRecords = currentAgentRecords().filter((record) => selectedAgentRequirements(record).length);
    if (!selectedRecords.length || !hasAgentDeliveryContent()) {
      showToast("请至少选择一条交付内容。");
      return;
    }
    try {
      const selectedShots = selectedRecords.filter((record) => record.type === "screenshot" && record.previewImage);
      const attachmentMap = buildAgentAttachmentMap(selectedShots);
      const packageRecords = selectedRecords.map((record) => recordForAgentPackage(record, selectedAgentRequirements(record)));
      const files = [{
        name: "feedback.md",
        bytes: utf8Bytes(currentAgentMarkdown())
      }, {
        name: "feedback.json",
        bytes: utf8Bytes(JSON.stringify({
          format: "vfs-agent-feedback-package",
          version: 1,
          exportedAt: new Date().toISOString(),
          page: {
            title: pageContext.title || document.title,
            url: currentPageUrl()
          },
          feedback: packageRecords
        }, null, 2))
      }];
      selectedShots.forEach((record) => {
        files.push({
          name: `images/${attachmentMap.get(record.id)}.jpg`,
          bytes: dataUrlToBytes(record.previewImage)
        });
      });
      const zip = createZipBlob(files);
      downloadBlob(zip, "application/zip", `agent-feedback-${timestampForFile()}.zip`);
      trackEvent("agent_exported", {
        export_format: "zip",
        record_count: selectedRecords.length
      }, { success: true });
      showToast("Agent 包已导出。");
    } catch (error) {
      console.warn("[VFS] export agent package failed", error);
      showToast("导出 Agent 包失败。");
    }
  }

  async function deliverAgentToTrae() {
    const selectedRecords = currentAgentRecords().filter((record) => selectedAgentRequirements(record).length);
    if (!selectedRecords.length || !hasAgentDeliveryContent()) {
      showToast("请至少选择一条交付内容。");
      return;
    }
    const button = agentModal?.querySelector("[data-vfs-action='agent-send-trae']");
    if (button) {
      button.disabled = true;
    }
    try {
      const selectedShots = selectedRecords.filter((record) => record.type === "screenshot" && record.previewImage);
      const attachmentMap = buildAgentAttachmentMap(selectedShots);
      const packageRecords = selectedRecords.map((record) => recordForAgentPackage(record, selectedAgentRequirements(record)));
      const markdown = currentAgentMarkdown();
      const payload = {
        markdown,
        feedback: {
          format: "vfs-agent-feedback-package",
          version: 1,
          exportedAt: new Date().toISOString(),
          page: {
            title: pageContext.title || document.title,
            url: currentPageUrl()
          },
          feedback: packageRecords
        },
        images: selectedShots.map((record) => ({
          name: `${attachmentMap.get(record.id)}.jpg`,
          base64: String(record.previewImage || "").split(",")[1] || ""
        }))
      };
      showToast("正在发送到 Trae…");
      const response = await chrome.runtime.sendMessage({
        source: CONTENT_SOURCE,
        type: "VFS_DELIVER_TO_TRAE",
        payload
      });
      if (response?.ok) {
        const inject = response.result?.result?.inject || {};
        showToast(inject.submitted
          ? "已发送到 Trae:内容已自动送入 AI 会话。"
          : inject.focusedCommand
            ? "已发送到 Trae:已打开 AI 会话并填入,请回车发送。"
            : "已发送到 Trae:内容已落盘并复制到剪贴板。");
        trackEvent("agent_exported", { export_format: "trae-bridge", record_count: selectedRecords.length }, { success: true });
      } else if (response?.error === "BRIDGE_UNREACHABLE") {
        showToast("未连接到 Trae Bridge,请确认 Trae 已安装并运行飞标 Bridge 扩展。");
      } else if (response?.error === "NO_WORKSPACE") {
        showToast("请先在 Trae 打开一个工作区文件夹。");
      } else {
        showToast(`发送到 Trae 失败:${response?.error || "未知错误"}`);
      }
    } catch (error) {
      console.warn("[VFS] deliver to Trae failed", error);
      showToast("发送到 Trae 失败。");
    } finally {
      if (button) {
        button.disabled = false;
      }
    }
  }

  function recordForAgentPackage(record, requirements = []) {
    const copy = clonePlainObject(record);
    copy.agentInstructions = requirements;
    if (copy.collab) {
      delete copy.collab.messages;
    }
    if (copy?.type === "dom") {
      delete copy.previewImage;
      delete copy.previewImageWidth;
      delete copy.previewImageHeight;
      delete copy.previewImageAspectRatio;
    }
    return copy;
  }

  async function copyAgentImage(recordId) {
    const record = records.find((item) => item.id === recordId);
    if (!record?.previewImage) {
      showToast("未找到截图。");
      return;
    }
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      showToast("当前浏览器不支持复制图片。");
      return;
    }
    try {
      const blob = await dataUrlToPngBlob(record.previewImage);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      showToast("图片已复制，可粘贴到 Agent 对话框。");
    } catch (error) {
      console.warn("[VFS] copy image failed", error);
      showToast("复制图片失败，可改用导出完整包。");
    }
  }

  function previewAgentImage(recordId) {
    const record = records.find((item) => item.id === recordId);
    if (!record?.previewImage) {
      return;
    }
    openImageViewer(record.previewImage, "截图附件预览");
  }

  async function dataUrlToPngBlob(dataUrl) {
    const image = await loadImage(dataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d");
    if (!context || !canvas.width || !canvas.height) {
      throw new Error("图片转换失败");
    }
    context.drawImage(image, 0, 0);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        blob ? resolve(blob) : reject(new Error("图片转换失败"));
      }, "image/png");
    });
  }

  function downloadBlob(content, type, filename) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function timestampForFile() {
    return new Date().toISOString().replace(/[:.]/g, "-");
  }

  function utf8Bytes(text) {
    return new TextEncoder().encode(String(text || ""));
  }

  function dataUrlToBytes(dataUrl) {
    const parts = String(dataUrl || "").split(",");
    const body = parts[1] || "";
    const isBase64 = /;base64/i.test(parts[0] || "");
    const binary = isBase64 ? atob(body) : decodeURIComponent(body);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  function createZipBlob(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const now = new Date();
    const dosTime = ((now.getHours() & 31) << 11) | ((now.getMinutes() & 63) << 5) | (Math.floor(now.getSeconds() / 2) & 31);
    const dosDate = (((now.getFullYear() - 1980) & 127) << 9) | (((now.getMonth() + 1) & 15) << 5) | (now.getDate() & 31);

    files.forEach((file) => {
      const nameBytes = utf8Bytes(file.name);
      const bytes = file.bytes instanceof Uint8Array ? file.bytes : utf8Bytes(file.bytes);
      const crc = crc32(bytes);
      const localHeader = new Uint8Array(30 + nameBytes.length);
      const local = new DataView(localHeader.buffer);
      writeZipHeader(local, {
        signature: 0x04034b50,
        versionNeeded: 20,
        flags: 0x0800,
        method: 0,
        time: dosTime,
        date: dosDate,
        crc,
        size: bytes.length,
        nameLength: nameBytes.length
      });
      localHeader.set(nameBytes, 30);
      localParts.push(localHeader, bytes);

      const centralHeader = new Uint8Array(46 + nameBytes.length);
      const central = new DataView(centralHeader.buffer);
      central.setUint32(0, 0x02014b50, true);
      central.setUint16(4, 20, true);
      central.setUint16(6, 20, true);
      central.setUint16(8, 0x0800, true);
      central.setUint16(10, 0, true);
      central.setUint16(12, dosTime, true);
      central.setUint16(14, dosDate, true);
      central.setUint32(16, crc, true);
      central.setUint32(20, bytes.length, true);
      central.setUint32(24, bytes.length, true);
      central.setUint16(28, nameBytes.length, true);
      central.setUint16(30, 0, true);
      central.setUint16(32, 0, true);
      central.setUint16(34, 0, true);
      central.setUint16(36, 0, true);
      central.setUint32(38, 0, true);
      central.setUint32(42, offset, true);
      centralHeader.set(nameBytes, 46);
      centralParts.push(centralHeader);
      offset += localHeader.length + bytes.length;
    });

    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, offset, true);
    return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
  }

  function writeZipHeader(view, data) {
    view.setUint32(0, data.signature, true);
    view.setUint16(4, data.versionNeeded, true);
    view.setUint16(6, data.flags, true);
    view.setUint16(8, data.method, true);
    view.setUint16(10, data.time, true);
    view.setUint16(12, data.date, true);
    view.setUint32(14, data.crc, true);
    view.setUint32(18, data.size, true);
    view.setUint32(22, data.size, true);
    view.setUint16(26, data.nameLength, true);
    view.setUint16(28, 0, true);
  }

  function crc32(bytes) {
    const table = crc32.table || (crc32.table = createCrc32Table());
    let crc = -1;
    for (let index = 0; index < bytes.length; index += 1) {
      crc = (crc >>> 8) ^ table[(crc ^ bytes[index]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function createCrc32Table() {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      table[index] = value >>> 0;
    }
    return table;
  }

  function renderMarkers() {
    markerLayer.replaceChildren();
    markerLayer.hidden = markersHidden || mode === "off";
    if (markersHidden || mode === "off") {
      return;
    }
    const stackCounts = new Map();
    activeRecords().filter(canRenderMarker).forEach((record, index) => {
      const anchor = record.type === "screenshot"
        ? record.anchorSelector || record.selector || record.id
        : record.selector || record.id;
      const stackKey = `${record.type}:${recordFrameUrl(record)}:${anchor}`;
      const stackIndex = stackCounts.get(stackKey) || 0;
      stackCounts.set(stackKey, stackIndex + 1);
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = "vfs-marker";
      marker.classList.toggle("is-dom", record.type === "dom");
      marker.classList.toggle("is-shot", record.type === "screenshot");
      marker.classList.toggle("is-adjustment", record.annotationKind === "adjustment");
      const markerIcon = record.type === "screenshot"
        ? toolbarIcon("camera")
        : toolbarIcon(record.annotationKind === "adjustment" ? "commentPlus" : "comment");
      const markerVisual = record.type === "screenshot"
        ? `<span class="vfs-marker-symbol">${markerIcon}</span>`
        : `${feibiaoBubbleSvg("vfs-marker-shape")}<span class="vfs-marker-symbol">${markerIcon}</span>`;
      marker.innerHTML = `${markerVisual}<em>${index + 1}</em>`;
      marker.dataset.recordId = record.id;
      marker.dataset.stackIndex = String(stackIndex);
      const markerType = record.type === "screenshot" ? "截图批注" : record.annotationKind === "adjustment" ? "DOM 精准修改" : "DOM 评估";
      marker.title = `第 ${index + 1} 条 · ${markerType}`;
      marker.setAttribute("aria-label", marker.title);
      marker.addEventListener("click", () => focusRecord(record.id));
      markerLayer.append(marker);
    });
    updateMarkers();
  }

  function canRenderMarker(record) {
    return record.type === "dom" || record.type === "screenshot";
  }

  function scheduleMarkerUpdate() {
    cancelAnimationFrame(markerFrame);
    markerFrame = requestAnimationFrame(() => {
      updateMarkers();
      positionDomComposer();
      scheduleChildRecordRectPost();
    });
    scheduleFocusBoxUpdate();
  }

  function startMarkerTracking(duration = 950) {
    markerTrackingUntil = Math.max(markerTrackingUntil, performance.now() + duration);
    if (markerTrackingFrame) {
      return;
    }
    const tick = () => {
      markerTrackingFrame = 0;
      updateMarkers();
      positionDomComposer();
      updateFocusBox();
      scheduleChildRecordRectPost();
      if (performance.now() < markerTrackingUntil) {
        markerTrackingFrame = requestAnimationFrame(tick);
      }
    };
    markerTrackingFrame = requestAnimationFrame(tick);
  }

  function scheduleChildRecordRectPost() {
    if (isTopFrame()) {
      return;
    }
    cancelAnimationFrame(childRecordRectFrame);
    childRecordRectFrame = requestAnimationFrame(postChildRecordRects);
  }

  function postChildRecordRects() {
    childRecordRectFrame = 0;
    const items = records
      .filter((record) => record && (record.type === "dom" || record.type === "screenshot"))
      .map(childRecordRectPayload)
      .filter(Boolean);
    postToParent({
      type: "VFS_CHILD_RECORD_RECTS",
      frameUrl: location.href,
      viewport: viewportSize(),
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      rects: items
    });
  }

  function childRecordRectPayload(record) {
    if (!isRecordInThisFrame(record)) {
      return null;
    }
    const element = findElement(record);
    if (!element || element.tagName === "IFRAME") {
      return null;
    }
    const rect = rectToObject(element.getBoundingClientRect());
    return {
      id: record.id,
      type: record.type,
      rect,
      anchorElementRect: record.type === "screenshot" ? rect : null
    };
  }

  function isRecordInThisFrame(record) {
    const frameUrl = recordFrameUrl(record);
    if (!frameUrl) {
      return false;
    }
    return normalizeLocationKey(frameUrl) === normalizeLocationKey(location.href);
  }

  function updateChildRecordRects(message, sourceWindow) {
    if (!isTopFrame()) {
      return;
    }
    const frame = findMessageSourceFrame(sourceWindow);
    const frameRect = frame?.getBoundingClientRect?.();
    const rects = Array.isArray(message.rects) ? message.rects : [];
    if (!frame || !frameRect || !rects.length) {
      return;
    }
    const childViewport = message.viewport || {
      width: frame.clientWidth || frameRect.width || 1,
      height: frame.clientHeight || frameRect.height || 1
    };
    const scaleX = frameRect.width / Math.max(1, childViewport.width || frameRect.width || 1);
    const scaleY = frameRect.height / Math.max(1, childViewport.height || frameRect.height || 1);
    rects.forEach((item) => {
      if (!item?.id) {
        return;
      }
      const localRect = normalizeLooseRect(item.rect);
      if (!localRect) {
        childRecordRects.delete(item.id);
        return;
      }
      childRecordRects.set(item.id, {
        rect: mapChildRectToTopFrame(localRect, frameRect, scaleX, scaleY),
        localRect,
        frameUrl: message.frameUrl || "",
        updatedAt: Date.now()
      });
    });
    scheduleMarkerUpdate();
    startMarkerTracking(420);
  }

  function mapChildRectToTopFrame(localRect, frameRect, scaleX, scaleY) {
    const left = frameRect.left + localRect.x * scaleX;
    const top = frameRect.top + localRect.y * scaleY;
    const width = Math.max(1, localRect.width * scaleX);
    const height = Math.max(1, localRect.height * scaleY);
    return {
      x: left,
      y: top,
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height
    };
  }

  function updateMarkers() {
    if (!markerLayer || markersHidden) {
      return;
    }
    const rightLimit = sidebarOpen ? window.innerWidth - sidebarWidth() - 34 : window.innerWidth - 34;
    markerLayer.querySelectorAll(".vfs-marker").forEach((marker) => {
      const record = records.find((item) => item.id === marker.dataset.recordId);
      const element = record ? findElement(record) : null;
      const rect = markerRectForRecord(record, element);
      if (!record || !rect) {
        marker.hidden = true;
        return;
      }
      const visible = rect.bottom >= 0 && rect.top <= window.innerHeight && rect.right >= 0 && rect.left <= window.innerWidth;
      marker.hidden = !visible;
      marker.classList.toggle("is-active", record.id === activeId);
      const position = markerPosition(record, rect, element);
      const stackIndex = Math.max(0, Number(marker.dataset.stackIndex) || 0);
      const stackX = Math.min(stackIndex, 3) * 7;
      const stackY = stackIndex * 18;
      marker.style.left = `${Math.max(8, Math.min(position.x - 14 - stackX, rightLimit))}px`;
      marker.style.top = `${Math.max(8, Math.min(position.y - 14 + stackY, window.innerHeight - 36))}px`;
    });
  }

  function markerPosition(record, rect, element = null) {
    const offset = shouldUseAnchorOffsetForRecord(record, element)
      ? anchorOffsetForRect(record, rect)
      : null;
    if (offset) {
      return {
        x: rect.left + offset.x,
        y: rect.top + offset.y
      };
    }
    return {
      x: rect.right,
      y: rect.top + 20
    };
  }

  function shouldUseAnchorOffsetForRecord(record, element) {
    if (record?.type !== "screenshot") {
      return false;
    }
    if (isFrameFallbackForRecord(record, element)) {
      return Boolean(normalizeLooseRect(record.anchorElementRect));
    }
    return !isWeakAnchorElement(element);
  }

  function markerRectForRecord(record, element) {
    if (!record) {
      return null;
    }
    if (!element) {
      return fallbackMarkerRectForRecord(record);
    }
    if (isFrameFallbackForRecord(record, element)) {
      return liveChildMappedRecordRect(record, element) || frameMappedRecordRect(record, element) || element.getBoundingClientRect();
    }
    return element.getBoundingClientRect();
  }

  function fallbackMarkerRectForRecord(record) {
    const sourceRect = normalizeLooseRect(record.type === "screenshot"
      ? record.anchorRect || record.viewportRect || record.rect || record.bounds
      : record.viewportRect || record.rect);
    if (!sourceRect) {
      return null;
    }
    const scroll = recordScrollOrigin(record);
    const left = scroll.x + sourceRect.x - window.scrollX;
    const top = scroll.y + sourceRect.y - window.scrollY;
    const width = Math.max(1, sourceRect.width);
    const height = Math.max(1, sourceRect.height);
    return {
      x: left,
      y: top,
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height
    };
  }

  function recordScrollOrigin(record) {
    if (record?.type === "screenshot") {
      return {
        x: Number(record.viewport?.scrollX) || Number(record.pageX) || 0,
        y: Number(record.viewport?.scrollY) || Number(record.pageY) || 0
      };
    }
    return {
      x: Number(record?.pageX) || 0,
      y: Number(record?.pageY) || 0
    };
  }

  function liveChildMappedRecordRect(record, frame) {
    if (!record?.id || !frame || frame.tagName !== "IFRAME") {
      return null;
    }
    const live = childRecordRects.get(record.id);
    if (!live?.localRect) {
      return null;
    }
    const frameRect = frame.getBoundingClientRect();
    const frameWidth = Math.max(1, frame.clientWidth || frameRect.width || 1);
    const frameHeight = Math.max(1, frame.clientHeight || frameRect.height || 1);
    const scaleX = frameRect.width / frameWidth;
    const scaleY = frameRect.height / frameHeight;
    return mapChildRectToTopFrame(live.localRect, frameRect, scaleX, scaleY);
  }

  function frameMappedRecordRect(record, frame) {
    if (!record || !frame || frame.tagName !== "IFRAME") {
      return null;
    }
    const localRect = normalizeLooseRect(record.type === "screenshot"
      ? record.anchorElementRect || record.anchorLocalRect || record.anchorRect || record.rect
      : record.rect || record.viewportRect);
    if (!localRect) {
      return null;
    }
    const frameRect = frame.getBoundingClientRect();
    const frameWidth = Math.max(1, frame.clientWidth || frameRect.width || 1);
    const frameHeight = Math.max(1, frame.clientHeight || frameRect.height || 1);
    const scaleX = frameRect.width / frameWidth;
    const scaleY = frameRect.height / frameHeight;
    const left = frameRect.left + localRect.x * scaleX;
    const top = frameRect.top + localRect.y * scaleY;
    const width = Math.max(1, localRect.width * scaleX);
    const height = Math.max(1, localRect.height * scaleY);
    return {
      x: left,
      y: top,
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height
    };
  }

  function focusRecord(recordId) {
    const record = records.find((item) => item.id === recordId);
    if (!record) {
      return;
    }
    if (savedStyleComparison?.recordId && savedStyleComparison.recordId !== record.id) {
      restoreSavedStyleComparison();
    }
    activeId = record.id;
    sidebarOpen = true;
    if (isRecordFromDifferentFrame(record)) {
      const frame = findFrameElementForRecord(record);
      if (frame) {
        showElementFocus(frame, record);
      }
      broadcastToChildFrames({ type: "VFS_LOCATE_RECORD", record });
      showToast(record.type === "screenshot"
        ? "已在对应 iframe 中定位截图附近元素。"
        : "已在对应 iframe 中定位 DOM 批注。");
      renderAll();
      broadcastToChildFrames({ type: "VFS_MODE_CHANGED", mode, sidebarOpen, records });
      return;
    }
    if (record.type === "dom") {
      const element = findElement(record);
      if (element) {
        showElementFocus(element, record);
      } else {
        broadcastToChildFrames({ type: "VFS_LOCATE_RECORD", record });
        showToast("已尝试在对应 iframe 中定位批注。");
      }
    } else {
      const element = findElement(record);
      if (element) {
        showElementFocus(element, record);
        showToast("截图批注已选中，已定位到附近页面元素。");
      } else {
        broadcastToChildFrames({ type: "VFS_LOCATE_RECORD", record });
        if (scrollToScreenshotViewport(record)) {
          showToast("已回到截图记录时的页面位置，正在恢复附近页面元素…");
          scheduleScreenshotAnchorRecovery(record);
        } else if (record.anchorSelector) {
          showToast("已尝试在对应 iframe 中定位截图附近元素。");
        } else {
          showToast("截图批注已选中，右侧卡片包含截图预览。");
        }
      }
    }
    renderAll();
    broadcastToChildFrames({ type: "VFS_MODE_CHANGED", mode, sidebarOpen, records });
  }

  function scheduleScreenshotAnchorRecovery(record) {
    const request = ++screenshotRecoveryRequest;
    void (async () => {
      for (let attempt = 0; attempt < 6; attempt += 1) {
        await delay(attempt === 0 ? 280 : 160);
        if (request !== screenshotRecoveryRequest || activeId !== record.id) {
          return;
        }
        const element = await recoverScreenshotAnchor(record);
        if (!element) {
          continue;
        }
        showElementFocus(element, record);
        showToast("截图批注已选中，已恢复附近页面元素。");
        renderAll();
        broadcastToChildFrames({ type: "VFS_MODE_CHANGED", mode, sidebarOpen, records });
        return;
      }
      if (request === screenshotRecoveryRequest && activeId === record.id) {
        showToast("已回到截图记录时的页面位置，可在右侧查看截图。");
      }
    })();
  }

  async function recoverScreenshotAnchor(record) {
    const point = screenshotAnchorPointInCurrentViewport(record);
    if (!point || point.x < -24 || point.x > window.innerWidth + 24 || point.y < -24 || point.y > window.innerHeight + 24) {
      return null;
    }
    const targetRect = shotAnchorTargetRect(point, normalizeLooseRect(record.anchorRect));
    const candidate = findBestAnchorCandidate(targetRect);
    const element = candidate?.element || findNearestAnchorElement(point);
    if (!element || isWeakAnchorElement(element)) {
      return null;
    }
    const rect = element.getBoundingClientRect();
    const anchorOffset = {
      x: clamp(point.x - rect.left, 0, rect.width),
      y: clamp(point.y - rect.top, 0, rect.height)
    };
    Object.assign(record, {
      anchorSelector: cssPath(element),
      anchorLabel: elementLabel(element),
      anchorExcerpt: elementExcerpt(element),
      anchorOffset,
      anchorOffsetRatio: anchorOffsetRatio(anchorOffset, rect),
      anchorElementRect: roundRect(rect),
      anchorFrameUrl: location.href,
      locationConfidence: candidate ? "可精确定位" : "近似定位"
    });
    await persistRecordEnrichment(record);
    return element;
  }

  function screenshotAnchorPointInCurrentViewport(record) {
    const anchorRect = normalizeLooseRect(record?.anchorRect || record?.viewportRect || record?.rect);
    const point = normalizePoint(record?.anchorPoint) || (anchorRect ? rectCenter(anchorRect) : null);
    if (!point) {
      return null;
    }
    const origin = recordScrollOrigin(record);
    return {
      x: origin.x + point.x - window.scrollX,
      y: origin.y + point.y - window.scrollY
    };
  }

  function showElementFocus(element, record = null) {
    if (!element) {
      return;
    }
    ensureFocusBox();
    activeFocusElement?.classList.remove("vfs-focus");
    activeFocusElement = element;
    activeFocusRecord = record;
    scrollElementForRecordFocus(element, record);
    startMarkerTracking(1200);
    scheduleChildRecordRectPost();
    element.classList.add("vfs-focus");
    updateFocusBox();
    setTimeout(updateFocusBox, 260);
    clearTimeout(focusTimer);
    focusTimer = setTimeout(() => {
      activeFocusElement?.classList.remove("vfs-focus");
      activeFocusElement = null;
      activeFocusRecord = null;
      focusBox?.classList.remove("is-visible");
    }, 1800);
  }

  function scrollElementForRecordFocus(element, record = null) {
    if (!element) {
      return;
    }
    const visibleRect = markerRectForRecord(record, element) || element.getBoundingClientRect();
    const visibleRight = sidebarOpen ? window.innerWidth - sidebarWidth() - 12 : window.innerWidth - 12;
    if (visibleRect.top >= 12 && visibleRect.bottom <= window.innerHeight - 12 && visibleRect.left >= 0 && visibleRect.right <= visibleRight) {
      return;
    }
    if (isFrameFallbackForRecord(record, element)) {
      const rect = markerRectForRecord(record, element);
      const targetX = window.scrollX + rect.left + rect.width / 2 - window.innerWidth / 2;
      const targetY = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
      window.scrollTo({
        left: Math.max(0, targetX),
        top: Math.max(0, targetY),
        behavior: "smooth"
      });
      return;
    }
    element.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
  }

  function scrollToScreenshotViewport(record) {
    const rect = normalizeLooseRect(record?.anchorRect || record?.viewportRect || record?.rect);
    if (!rect) {
      return false;
    }
    const origin = recordScrollOrigin(record);
    const targetX = origin.x + rect.x + rect.width / 2 - window.innerWidth / 2;
    const targetY = origin.y + rect.y + rect.height / 2 - window.innerHeight / 2;
    window.scrollTo({
      left: Math.max(0, targetX),
      top: Math.max(0, targetY),
      behavior: "smooth"
    });
    return true;
  }

  function scheduleFocusBoxUpdate() {
    if (!activeFocusElement || !focusBox) {
      return;
    }
    cancelAnimationFrame(focusFrame);
    focusFrame = requestAnimationFrame(updateFocusBox);
  }

  function updateFocusBox() {
    if (!activeFocusElement || !focusBox) {
      return;
    }
    const rect = markerRectForRecord(activeFocusRecord, activeFocusElement);
    const visible = rect.bottom >= 0 && rect.top <= window.innerHeight && rect.right >= 0 && rect.left <= window.innerWidth;
    focusBox.classList.toggle("is-visible", visible);
    if (!visible) {
      return;
    }
    const pad = 6;
    const offset = shouldUseAnchorOffsetForRecord(activeFocusRecord, activeFocusElement)
      ? anchorOffsetForRect(activeFocusRecord, rect)
      : null;
    if (offset) {
      const point = {
        x: rect.left + offset.x,
        y: rect.top + offset.y
      };
      const size = Math.max(36, Math.min(86, Math.max(
        Number(activeFocusRecord.anchorRect?.width) || 0,
        Number(activeFocusRecord.anchorRect?.height) || 0,
        44
      )));
      const half = size / 2;
      focusBox.style.left = `${Math.max(6, Math.min(point.x - half, window.innerWidth - size - 6))}px`;
      focusBox.style.top = `${Math.max(6, Math.min(point.y - half, window.innerHeight - size - 6))}px`;
      focusBox.style.width = `${size}px`;
      focusBox.style.height = `${size}px`;
      return;
    }
    focusBox.style.left = `${Math.max(6, rect.left - pad)}px`;
    focusBox.style.top = `${Math.max(6, rect.top - pad)}px`;
    focusBox.style.width = `${Math.max(12, Math.min(rect.width + pad * 2, window.innerWidth - 12))}px`;
    focusBox.style.height = `${Math.max(12, Math.min(rect.height + pad * 2, window.innerHeight - 12))}px`;
  }

  function openShotOverlay() {
    closeImageViewer();
    shotOverlay.classList.add("is-visible");
    shotStage.classList.remove("is-captured");
    shotRegion = null;
    shotAnnotations = [];
    shotDraft = null;
    shotDrawing = false;
    shotCaptureArea = null;
    shotImage.removeAttribute("src");
    shotTitle.textContent = "正在准备截图...";
    root?.classList.remove("is-shot-composing");
    shotPopover.classList.remove("is-visible");
    shotComposerDraft = null;
    if (shotCommentInput) {
      shotCommentInput.value = "";
    }
    setShotTool("box");
    requestAnimationFrame(() => positionShotbarFromWorkbar({ ensureAbove: true }));
  }

  function closeShotOverlay() {
    shotOverlay?.classList.remove("is-visible");
    shotPopover?.classList.remove("is-visible");
    root?.classList.remove("is-shot-composing");
    shotComposerDraft = null;
    clearTimeout(shotScrollTimer);
    shotScrollTimer = null;
    shotRegion = null;
    shotAnnotations = [];
    shotDraft = null;
    shotDrawing = false;
    restoreWorkbarAfterShot();
  }

  async function captureViewport() {
    if (captureInProgress) {
      return;
    }
    captureInProgress = true;
    ensureUi();
    root?.classList.remove("is-shot-composing");
    shotPopover?.classList.remove("is-visible");
    shotComposerDraft = null;
    shotRegion = null;
    shotAnnotations = [];
    shotDraft = null;
    shotDrawing = false;
    drawShotAnnotations();
    shotTitle.textContent = "正在截取当前视口...";
    shotStage.classList.remove("is-captured");
    shotOverlay.classList.remove("is-visible");
    root.classList.add("vfs-capturing");
    markerLayer.classList.add("vfs-capturing");

    try {
      await nextPaint();
      await delay(90);
      let response = await requestShotCapture();
      if (mode !== "shot") {
        return;
      }
      if (!response?.ok || !response.image) {
        await delay(220);
        response = await requestShotCapture();
      }
      if (mode !== "shot") {
        return;
      }
      if (!response?.ok || !response.image) {
        throw new Error(response?.error || "截图失败，请重试。");
      }
      const cropped = await cropCapturedImageToShotWorkspace(response.image);
      shotImage.src = cropped.image;
      shotCaptureArea = cropped.area;
      shotStage.classList.add("is-captured");
      shotOverlay.classList.add("is-visible");
      requestAnimationFrame(() => positionShotbarFromWorkbar({ ensureAbove: true }));
      shotTitle.textContent = "先框选截图区域，再添加箭头或画笔。";
      shotRegion = null;
      shotAnnotations = [];
      shotComposerDraft = null;
      shotDraft = null;
      setShotTool("box");
      showToast("截图已准备好，可以开始标注。");
    } catch (error) {
      console.warn("[VFS] screenshot capture failed", error);
      shotStage.classList.remove("is-captured");
      shotImage.removeAttribute("src");
      shotOverlay.classList.add("is-visible");
      requestAnimationFrame(() => positionShotbarFromWorkbar({ ensureAbove: true }));
      shotTitle.textContent = "截图失败，可以点击重新截屏。";
      setShotTool("box");
      showToast("截图失败，请重新进入截图标注。");
    } finally {
      root.classList.remove("vfs-capturing");
      markerLayer.classList.remove("vfs-capturing");
      captureInProgress = false;
      updateToolButtons();
    }
  }

  function requestShotCapture() {
    return chrome.runtime.sendMessage({
      source: CONTENT_SOURCE,
      type: "VFS_CAPTURE_VISIBLE_TAB"
    });
  }

  function setShotTool(tool) {
    const nextTool = Object.prototype.hasOwnProperty.call(TOOL_LABELS, tool) ? tool : "box";
    if (!shotRegion && nextTool !== "box" && shotStage?.classList.contains("is-captured")) {
      shotTool = "box";
      updateToolButtons();
      shotTitle.textContent = "第 1 步：拖拽框选需要说明的区域。";
      showToast("请先用框选区域确定截图范围。");
      return;
    }
    shotTool = nextTool;
    if (shotStage?.classList.contains("is-captured")) {
      shotTitle.textContent = nextTool === "box"
        ? "第 1 步：拖拽框选需要说明的区域。"
        : nextTool === "arrow"
          ? "第 2 步：拖拽绘制箭头，可延伸到框选区域外。"
          : "第 2 步：拖拽画笔，可延伸到框选区域外。";
    }
    updateToolButtons();
  }

  function updateToolButtons() {
    root?.querySelectorAll("[data-vfs-tool]").forEach((button) => {
      const active = button.dataset.vfsTool === shotTool;
      button.classList.toggle("is-primary", active);
    });
    root?.querySelectorAll("[data-vfs-action='finish-shot']").forEach((button) => {
      const enabled = mode === "shot" && Boolean(shotRegion);
      button.disabled = !enabled;
      button.classList.toggle("is-primary", enabled);
    });
    root?.querySelectorAll("[data-vfs-action='read-mode'], [data-vfs-action='dom-mode'], [data-vfs-action='shot-mode']").forEach((button) => {
      const actionMode = button.dataset.vfsAction === "dom-mode" ? "dom" : button.dataset.vfsAction === "shot-mode" ? "shot" : "read";
      button.classList.toggle("is-primary", mode === actionMode);
    });
    root?.querySelectorAll("[data-vfs-action='toggle-style-compare']").forEach((button) => {
      const enabled = Boolean(styleDraftAvailable(styleDraft) && Object.keys(styleDraft.values || {}).length);
      button.disabled = !enabled;
      button.classList.toggle("is-active", enabled && styleComparisonActive);
      const label = !enabled ? "试改前后" : styleComparisonActive ? "查看试改后" : "查看试改前";
      button.title = label;
      button.setAttribute("aria-label", label);
    });
  }

  function syncShotCanvasToImage() {
    if (!shotImage?.src) {
      return;
    }
    requestAnimationFrame(() => {
      const imageRect = shotImage.getBoundingClientRect();
      const stageRect = shotStage.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      shotCanvas.style.left = `${imageRect.left - stageRect.left}px`;
      shotCanvas.style.top = `${imageRect.top - stageRect.top}px`;
      shotCanvas.style.width = `${imageRect.width}px`;
      shotCanvas.style.height = `${imageRect.height}px`;
      shotCanvas.width = Math.max(1, Math.floor(imageRect.width * ratio));
      shotCanvas.height = Math.max(1, Math.floor(imageRect.height * ratio));
      shotCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      drawShotAnnotations();
    });
  }

  function handleResize() {
    syncShotCanvasToImage();
    positionShotbarFromWorkbar({ ensureAbove: true });
    scheduleMarkerUpdate();
  }

  function handleShotWheel(event) {
    if (mode !== "shot" || !shotOverlay?.classList.contains("is-visible") || event.ctrlKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (captureInProgress || shotDrawing || shotPopover?.classList.contains("is-visible")) {
      return;
    }

    const factor = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? window.innerHeight : 1;
    const left = event.deltaX * factor;
    const top = event.deltaY * factor;
    if (!left && !top) {
      return;
    }

    const beforeX = window.scrollX;
    const beforeY = window.scrollY;
    window.scrollBy({ left, top, behavior: "auto" });
    if (window.scrollX === beforeX && window.scrollY === beforeY) {
      return;
    }

    const hadShotDraft = Boolean(shotRegion || shotAnnotations.length || shotDraft);
    shotRegion = null;
    shotAnnotations = [];
    shotComposerDraft = null;
    shotDraft = null;
    shotDrawing = false;
    shotPopover?.classList.remove("is-visible");
    drawShotAnnotations();
    setShotTool("box");
    shotTitle.textContent = "滚动后正在更新当前视口截图...";

    clearTimeout(shotScrollTimer);
    shotScrollTimer = setTimeout(() => {
      shotScrollTimer = null;
      if (mode === "shot" && !captureInProgress) {
        void captureViewport();
      }
    }, 180);

    if (hadShotDraft) {
      showToast("已切换视口，请重新框选截图区域。");
    }
  }

  function handleShotPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }
    if (shotPopover?.classList.contains("is-visible")) {
      return;
    }
    if (!shotStage.classList.contains("is-captured")) {
      showToast("请先完成截屏。");
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const selectingRegion = !shotRegion || shotTool === "box";
    const point = shotPoint(event);
    shotDrawing = true;
    shotDraft = {
      id: createId(),
      tool: selectingRegion ? "region" : shotTool,
      start: point,
      end: point,
      points: [point]
    };
    if (selectingRegion) {
      shotRegion = null;
      shotAnnotations = [];
      shotPopover.classList.remove("is-visible");
    }
    shotCanvas.setPointerCapture(event.pointerId);
  }

  function handleShotPointerMove(event) {
    if (!shotDrawing || !shotDraft) {
      return;
    }
    const point = shotPoint(event);
    shotDraft.end = point;
    if (shotDraft.tool === "pen") {
      shotDraft.points.push(point);
    }
    drawShotAnnotations();
  }

  function handleShotPointerUp(event) {
    if (!shotDrawing || !shotDraft) {
      return;
    }
    event.preventDefault();
    const point = shotPoint(event);
    shotDrawing = false;
    shotDraft.end = point;
    if (shotDraft.tool === "pen") {
      shotDraft.points.push(point);
    }
    if (!hasMeaningfulShotDraft(shotDraft)) {
      cancelShotDraft();
      return;
    }
    if (shotDraft.tool === "region") {
      shotRegion = shotBounds(shotDraft);
      shotDraft = null;
      setShotTool("arrow");
      drawShotAnnotations();
      shotTitle.textContent = "第 2 步：拖拽箭头或画笔，可延伸到框选区域外。";
      showToast("区域已框选，可在区域内外继续添加箭头或画笔。");
      return;
    }
    shotAnnotations.push(shotDraft);
    shotDraft = null;
    drawShotAnnotations();
    showToast("标注已加入，可继续绘制或点击写批注。");
  }

  function cancelShotDraft() {
    shotDrawing = false;
    shotDraft = null;
    cancelShotComposer();
    drawShotAnnotations();
  }

  function cancelShotComposer() {
    shotComposerDraft = null;
    root?.classList.remove("is-shot-composing");
    shotPopover?.classList.remove("is-visible");
    if (shotCommentInput) {
      if (document.activeElement === shotCommentInput) {
        shotCommentInput.blur();
      }
      shotCommentInput.value = "";
    }
    resetMentionSelection("shot");
  }

  function finishShotAnnotation() {
    if (!shotStage?.classList.contains("is-captured")) {
      setMode("read");
      return;
    }
    if (!shotRegion) {
      showToast("请先框选截图区域。");
      setShotTool("box");
      return;
    }
    shotDrawing = false;
    shotDraft = null;
    drawShotAnnotations();
    openShotComposer({
      x: shotRegion.x + shotRegion.width,
      y: shotRegion.y + shotRegion.height
    });
  }

  function openShotComposer(point) {
    const sidebar = sidebarWidth();
    const width = Math.min(320, window.innerWidth - sidebar - 36);
    const canvasRect = shotCanvas.getBoundingClientRect();
    const left = Math.min(canvasRect.left + point.x + 16, window.innerWidth - sidebar - width - 16);
    const top = Math.min(canvasRect.top + point.y + 16, window.innerHeight - 200);
    shotPopover.style.left = `${Math.max(16, left)}px`;
    shotPopover.style.top = `${Math.max(70, top)}px`;
    shotComposerDraft = {
      bounds: { ...shotRegion },
      annotations: shotAnnotations.map(clonePlainObject)
    };
    resetMentionSelection("shot");
    root?.classList.add("is-shot-composing");
    shotPopover.classList.add("is-visible");
    shotCommentInput.value = "";
    shotCommentInput.focus();
  }

  async function saveShotRecord() {
    if (shotSaveInProgress) {
      return;
    }
    reconcileMentionSelectionFromInput("shot");
    const mentions = selectedMentions("shot");
    const text = stripMentionTokens(shotCommentInput.value, mentions).trim();
    const bounds = shotComposerDraft?.bounds || shotRegion;
    if (!bounds || !text) {
      showToast("请先框选截图区域并输入批注。");
      return;
    }
    shotSaveInProgress = true;
    const savedBounds = { ...bounds };
    const annotations = (shotComposerDraft?.annotations || shotAnnotations).map(clonePlainObject);
    const preview = createShotPreview(savedBounds, annotations);
    cancelShotComposer();
    try {
      const fallbackAnchor = buildShotFallbackAnchor(savedBounds, annotations);
      await setMode("read", { silent: true });
      let resolvedAnchor = null;
      try {
        resolvedAnchor = await buildShotAnchor(savedBounds, annotations, fallbackAnchor);
      } catch (error) {
        console.warn("[VFS] screenshot anchor fallback", error);
      }
      const record = {
        id: createId(),
        type: "screenshot",
        author: currentAuthor,
        text,
        mentions,
        tool: "region",
        toolLabel: annotations.length ? "区域标注" : "区域",
        bounds: savedBounds,
        annotations: annotations.map(serializeShotAnnotation),
        previewImage: preview.dataUrl,
        previewImageWidth: preview.width,
        previewImageHeight: preview.height,
        previewImageAspectRatio: preview.aspectRatio,
        ...fallbackAnchor,
        ...(resolvedAnchor || {}),
        viewport: {
          width: shotCaptureArea?.width || window.innerWidth,
          height: shotCaptureArea?.height || window.innerHeight,
          devicePixelRatio: window.devicePixelRatio || 1,
          scrollX: window.scrollX,
          scrollY: window.scrollY
        },
        createdAt: new Date().toISOString(),
        url: currentPageUrl()
      };
      shotRegion = null;
      shotAnnotations = [];
      shotDraft = null;
      setShotTool("box");
      const committed = await commitRecord(record);
      if (!committed) {
        showToast("截图批注保存失败，请检查插件存储空间后重试。");
        return;
      }
      showToast("截图批注已保存。");
      if (!record.anchorSelector) {
        void queueShotEnrichment(record.id, savedBounds, annotations, fallbackAnchor);
      }
    } catch (error) {
      console.warn("[VFS] screenshot record save failed", error);
      showToast("截图批注保存失败，请重试。");
    } finally {
      shotSaveInProgress = false;
    }
  }

  async function enrichShotRecord(recordId, bounds, annotations, capturedAnchor = null) {
    let anchor = null;
    let preview = emptyShotPreview();
    try {
      anchor = await buildShotAnchor(bounds, annotations, capturedAnchor);
    } catch (error) {
      console.warn("[VFS] screenshot anchor fallback", error);
    }
    try {
      preview = createShotPreview(bounds, annotations);
    } catch (error) {
      console.warn("[VFS] screenshot preview fallback", error);
    }
    const record = records.find((item) => item.id === recordId);
    if (!record) {
      return;
    }
    Object.assign(record, anchor || {});
    if (preview.dataUrl) {
      record.previewImage = preview.dataUrl;
      record.previewImageWidth = preview.width;
      record.previewImageHeight = preview.height;
      record.previewImageAspectRatio = preview.aspectRatio;
    }
    await persistRecordEnrichment(record);
    broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
    renderAll();
    scheduleMarkerUpdate();
    forcePanelStateChanged();
  }

  function queueShotEnrichment(recordId, bounds, annotations, capturedAnchor = null) {
    if (shotEnrichmentTasks.has(recordId)) {
      return shotEnrichmentTasks.get(recordId);
    }
    const enrichment = enrichShotRecord(recordId, bounds, annotations, capturedAnchor)
      .finally(() => shotEnrichmentTasks.delete(recordId));
    shotEnrichmentTasks.set(recordId, enrichment);
    return enrichment;
  }

  function queueVisibleLegacyShotAnchors() {
    records
      .filter((record) => record.type === "screenshot" && !record.anchorSelector && record.bounds)
      .filter((record) => {
        const point = screenshotAnchorPointInCurrentViewport(record);
        return point && point.x >= -24 && point.x <= window.innerWidth + 24 && point.y >= -24 && point.y <= window.innerHeight + 24;
      })
      .forEach((record) => {
        if (shotEnrichmentTasks.has(record.id)) {
          return;
        }
        const enrichment = recoverScreenshotAnchor(record)
          .finally(() => shotEnrichmentTasks.delete(record.id));
        shotEnrichmentTasks.set(record.id, enrichment);
      });
  }

  async function persistRecordEnrichment(record) {
    markRecordPendingCollabSync(record);
    const persisted = await persistRecordsSafely();
    if (!persisted) {
      record.previewImage = "";
      if (record.type === "screenshot") {
        record.previewImageWidth = 0;
        record.previewImageHeight = 0;
        record.previewImageAspectRatio = 0;
      }
      await persistRecordsSafely();
    }
    scheduleCollabSync(500);
  }

  async function createDomPreview(selection) {
    const rect = selection.viewportRect || (selection.topFrame ? selection.rect : null);
    if (!rect || rect.width < 2 || rect.height < 2) {
      return "";
    }
    if (isTopFrame() && sidebarOpen && window.matchMedia("(max-width: 860px)").matches) {
      return "";
    }
    root?.classList.add("vfs-dom-preview-capturing");
    markerLayer?.classList.add("vfs-dom-preview-capturing");
    focusBox?.classList.add("vfs-dom-preview-capturing");
    try {
      await delay(80);
      const image = await captureVisibleTabImage();
      return image ? createCapturedPreview(image, rect, domPreviewArea()) : "";
    } catch {
      return "";
    } finally {
      root?.classList.remove("vfs-dom-preview-capturing");
      markerLayer?.classList.remove("vfs-dom-preview-capturing");
      focusBox?.classList.remove("vfs-dom-preview-capturing");
    }
  }

  async function captureVisibleTabImage() {
    const response = await chrome.runtime.sendMessage({
      source: CONTENT_SOURCE,
      type: "VFS_CAPTURE_VISIBLE_TAB"
    });
    if (!response?.ok || !response.image) {
      return "";
    }
    return response.image;
  }

  async function cropCapturedImageToShotWorkspace(imageSrc) {
    const area = shotWorkspaceArea();
    if (area.width >= window.innerWidth - 1 && area.height >= window.innerHeight - 1) {
      return { image: imageSrc, area };
    }
    try {
      const image = await loadImage(imageSrc);
      const sourceScaleX = image.naturalWidth / Math.max(1, window.innerWidth);
      const sourceScaleY = image.naturalHeight / Math.max(1, window.innerHeight);
      const sourceX = Math.round(area.x * sourceScaleX);
      const sourceY = Math.round(area.y * sourceScaleY);
      const sourceWidth = Math.max(1, Math.round(area.width * sourceScaleX));
      const sourceHeight = Math.max(1, Math.round(area.height * sourceScaleY));
      const canvas = document.createElement("canvas");
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        return { image: imageSrc, area: shotFullViewportArea() };
      }
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
      return {
        image: canvas.toDataURL("image/jpeg", 0.95),
        area
      };
    } catch {
      return {
        image: imageSrc,
        area: shotFullViewportArea()
      };
    }
  }

  function shotWorkspaceArea() {
    const full = shotFullViewportArea();
    if (!sidebarOpen || window.matchMedia("(max-width: 860px)").matches) {
      return full;
    }
    return {
      x: 0,
      y: 0,
      width: Math.max(1, window.innerWidth - sidebarWidth()),
      height: full.height
    };
  }

  function shotFullViewportArea() {
    return {
      x: 0,
      y: 0,
      width: Math.max(1, window.innerWidth || 1),
      height: Math.max(1, window.innerHeight || 1)
    };
  }

  function domPreviewArea() {
    if (!isTopFrame() || !sidebarOpen || window.matchMedia("(max-width: 860px)").matches) {
      return shotFullViewportArea();
    }
    return {
      x: 0,
      y: 0,
      width: Math.max(1, window.innerWidth - sidebarWidth()),
      height: Math.max(1, window.innerHeight || 1)
    };
  }

  async function createCapturedPreview(imageSrc, rect, area = shotFullViewportArea()) {
    const image = await loadImage(imageSrc);
    const viewportWidth = Math.max(1, area.width || window.innerWidth || 1);
    const viewportHeight = Math.max(1, area.height || window.innerHeight || 1);
    const pad = Math.max(56, Math.min(160, Math.max(rect.width, rect.height) * 0.75));
    const minCropWidth = Math.min(viewportWidth, Math.max(420, rect.width + pad * 2));
    const minCropHeight = Math.min(viewportHeight, Math.max(240, rect.height + pad * 2));
    const cropWidth = Math.min(viewportWidth, Math.max(rect.width + pad * 2, minCropWidth));
    const cropHeight = Math.min(viewportHeight, Math.max(rect.height + pad * 2, minCropHeight));
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const sxCss = clamp(centerX - cropWidth / 2, area.x || 0, Math.max(area.x || 0, (area.x || 0) + viewportWidth - cropWidth));
    const syCss = clamp(centerY - cropHeight / 2, area.y || 0, Math.max(area.y || 0, (area.y || 0) + viewportHeight - cropHeight));
    const swCss = Math.max(1, cropWidth);
    const shCss = Math.max(1, cropHeight);
    const sourceScaleX = image.naturalWidth / window.innerWidth;
    const sourceScaleY = image.naturalHeight / window.innerHeight;
    const targetScale = Math.min(sourceScaleX, sourceScaleY, 900 / swCss, 560 / shCss);
    const targetWidth = Math.max(120, Math.round(swCss * targetScale));
    const targetHeight = Math.max(64, Math.round(shCss * targetScale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      return "";
    }
    context.drawImage(
      image,
      sxCss * sourceScaleX,
      syCss * sourceScaleY,
      swCss * sourceScaleX,
      shCss * sourceScaleY,
      0,
      0,
      targetWidth,
      targetHeight
    );
    context.save();
    context.strokeStyle = "#7d6ef0";
    context.fillStyle = "rgba(169, 149, 255, 0.12)";
    context.lineWidth = 2;
    context.strokeRect((rect.x - sxCss) * targetScale, (rect.y - syCss) * targetScale, rect.width * targetScale, rect.height * targetScale);
    context.fillRect((rect.x - sxCss) * targetScale, (rect.y - syCss) * targetScale, rect.width * targetScale, rect.height * targetScale);
    context.restore();
    return canvas.toDataURL("image/jpeg", 0.93);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("图片加载失败"));
      image.src = src;
    });
  }

  function serializeShotAnnotation(item) {
    return {
      tool: item.tool,
      start: item.start,
      end: item.end,
      points: item.points || []
    };
  }

  function createShotPreview(bounds, annotations = []) {
    if (!shotImage?.src || !shotImage.naturalWidth || !shotImage.naturalHeight) {
      return emptyShotPreview();
    }
    const imageRect = shotImage.getBoundingClientRect();
    if (!imageRect.width || !imageRect.height) {
      return emptyShotPreview();
    }
    const previewBounds = shotPreviewBounds(bounds, annotations);
    const pad = Math.max(72, Math.min(200, Math.max(previewBounds.width, previewBounds.height) * 0.45));
    const sxCss = clamp(previewBounds.x - pad, 0, imageRect.width);
    const syCss = clamp(previewBounds.y - pad, 0, imageRect.height);
    const exCss = clamp(previewBounds.x + previewBounds.width + pad, 0, imageRect.width);
    const eyCss = clamp(previewBounds.y + previewBounds.height + pad, 0, imageRect.height);
    const swCss = Math.max(1, exCss - sxCss);
    const shCss = Math.max(1, eyCss - syCss);
    const sourceScaleX = shotImage.naturalWidth / imageRect.width;
    const sourceScaleY = shotImage.naturalHeight / imageRect.height;
    const targetScale = Math.min(sourceScaleX, sourceScaleY, SHOT_PREVIEW_MAX_WIDTH / swCss, SHOT_PREVIEW_MAX_HEIGHT / shCss);
    const targetWidth = Math.max(96, Math.round(swCss * targetScale));
    const targetHeight = Math.max(58, Math.round(shCss * targetScale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      return emptyShotPreview();
    }
    try {
      context.drawImage(
        shotImage,
        sxCss * sourceScaleX,
        syCss * sourceScaleY,
        swCss * sourceScaleX,
        shCss * sourceScaleY,
        0,
        0,
        targetWidth,
        targetHeight
      );
      annotations.forEach((item) => drawPreviewShape(context, item, sxCss, syCss, targetScale));
      return {
        dataUrl: canvas.toDataURL("image/jpeg", SHOT_PREVIEW_JPEG_QUALITY),
        width: targetWidth,
        height: targetHeight,
        aspectRatio: roundNumber(targetWidth / Math.max(1, targetHeight), 4)
      };
    } catch {
      return emptyShotPreview();
    }
  }

  function emptyShotPreview() {
    return {
      dataUrl: "",
      width: 0,
      height: 0,
      aspectRatio: 0
    };
  }

  function shotPreviewBounds(bounds, annotations = []) {
    const items = [bounds, ...annotations.map(shotBounds)].filter(Boolean);
    const left = Math.min(...items.map((item) => item.x));
    const top = Math.min(...items.map((item) => item.y));
    const right = Math.max(...items.map((item) => item.x + item.width));
    const bottom = Math.max(...items.map((item) => item.y + item.height));
    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top)
    };
  }

  function drawPreviewShape(context, item, offsetX, offsetY, scale) {
    const mapPoint = (point) => ({
      x: (point.x - offsetX) * scale,
      y: (point.y - offsetY) * scale
    });
    context.save();
    context.strokeStyle = "#df7959";
    context.fillStyle = "rgba(223, 121, 89, 0.10)";
    context.lineWidth = Math.max(1.5, Math.min(3, 2 * scale));
    context.lineCap = "round";
    context.lineJoin = "round";
    if (item.tool === "box") {
      const bounds = shotBounds(item);
      context.strokeRect((bounds.x - offsetX) * scale, (bounds.y - offsetY) * scale, bounds.width * scale, bounds.height * scale);
      context.fillRect((bounds.x - offsetX) * scale, (bounds.y - offsetY) * scale, bounds.width * scale, bounds.height * scale);
    } else if (item.tool === "arrow") {
      drawPreviewArrow(context, mapPoint(item.start), mapPoint(item.end));
    } else {
      drawPreviewPen(context, (item.points || []).map(mapPoint));
    }
    context.restore();
  }

  function drawPreviewArrow(context, start, end) {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const head = 9;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.beginPath();
    context.moveTo(end.x, end.y);
    context.lineTo(end.x - head * Math.cos(angle - Math.PI / 6), end.y - head * Math.sin(angle - Math.PI / 6));
    context.moveTo(end.x, end.y);
    context.lineTo(end.x - head * Math.cos(angle + Math.PI / 6), end.y - head * Math.sin(angle + Math.PI / 6));
    context.stroke();
  }

  function drawPreviewPen(context, points) {
    if (!points.length) {
      return;
    }
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.stroke();
  }

  async function buildShotAnchor(bounds, annotations = [], capturedAnchor = null) {
    const anchorRect = normalizeViewportRect(capturedAnchor?.anchorRect) || shotViewportRect(bounds);
    const point = normalizePoint(capturedAnchor?.anchorPoint) || shotAnnotationAnchorPoint(bounds, annotations) || rectCenter(anchorRect);
    const targetRect = shotAnchorTargetRect(point, anchorRect);
    const childAnchor = await queryChildShotAnchor(targetRect);
    if (childAnchor) {
      return {
        ...childAnchor,
        anchorPoint: point,
        anchorRect: roundRect(anchorRect),
        anchorCoordinateViewport: viewportSize()
      };
    }
    const candidate = findBestAnchorCandidate(targetRect);
    const element = candidate?.element || findNearestAnchorElement(point);
    if (!element) {
      return {
        anchorPoint: point,
        anchorRect: roundRect(anchorRect),
        locationConfidence: "仅截图证据"
      };
    }
    const rect = element.getBoundingClientRect();
    const anchorOffset = {
      x: clamp(point.x - rect.left, 0, rect.width),
      y: clamp(point.y - rect.top, 0, rect.height)
    };
    return {
      anchorSelector: cssPath(element),
      anchorLabel: elementLabel(element),
      anchorExcerpt: elementExcerpt(element),
      anchorPoint: point,
      anchorRect: roundRect(anchorRect),
      anchorOffset,
      anchorOffsetRatio: anchorOffsetRatio(anchorOffset, rect),
      anchorElementRect: roundRect(rect),
      anchorFrameUrl: location.href,
      anchorCoordinateViewport: viewportSize(),
      locationConfidence: candidate ? "可精确定位" : "近似定位"
    };
  }

  function buildShotFallbackAnchor(bounds, annotations = []) {
    const anchorRect = shotViewportRect(bounds);
    const point = shotAnnotationAnchorPoint(bounds, annotations) || rectCenter(anchorRect);
    return {
      anchorPoint: point,
      anchorRect: roundRect(anchorRect),
      anchorFrameUrl: location.href,
      anchorCoordinateViewport: viewportSize(),
      coordinateViewport: viewportSize(),
      pageX: window.scrollX,
      pageY: window.scrollY,
      locationConfidence: "仅截图证据"
    };
  }

  function buildViewportAnchor(viewportRect) {
    const rect = normalizeViewportRect(viewportRect);
    if (!rect) {
      return null;
    }
    const point = rectCenter(rect);
    const candidate = findBestAnchorCandidate(rect);
    const element = candidate?.element || findNearestAnchorElement(point);
    if (!element) {
      return null;
    }
    const elementRect = element.getBoundingClientRect();
    const anchorOffset = {
      x: clamp(point.x - elementRect.left, 0, elementRect.width),
      y: clamp(point.y - elementRect.top, 0, elementRect.height)
    };
    return {
      anchorSelector: cssPath(element),
      anchorLabel: elementLabel(element),
      anchorExcerpt: elementExcerpt(element),
      anchorOffset,
      anchorOffsetRatio: anchorOffsetRatio(anchorOffset, elementRect),
      anchorElementRect: roundRect(elementRect),
      anchorPoint: point,
      anchorRect: roundRect(rect),
      anchorFrameUrl: location.href,
      anchorScore: candidate?.score || 0,
      anchorCoordinateViewport: viewportSize(),
      coordinateViewport: viewportSize(),
      locationConfidence: candidate ? "可精确定位" : "近似定位"
    };
  }

  async function queryChildShotAnchor(anchorRect) {
    if (!isTopFrame()) {
      return null;
    }
    const frameQueries = childFrameAnchorQueries(anchorRect);
    if (!frameQueries.length) {
      return null;
    }
    const results = await Promise.all(frameQueries.map((query) => requestChildShotAnchor(query)));
    return results
      .filter(Boolean)
      .sort((a, b) => (b.anchorScore || 0) - (a.anchorScore || 0))[0] || null;
  }

  function childFrameAnchorQueries(anchorRect) {
    return Array.from(document.querySelectorAll("iframe"))
      .map((frame) => {
        const rect = frame.getBoundingClientRect();
        const overlap = rectOverlapArea(rect, anchorRect);
        if (overlap <= 0 || rect.width < 8 || rect.height < 8 || isVfsUi(frame)) {
          return null;
        }
        const frameViewport = {
          width: frame.clientWidth || rect.width || 1,
          height: frame.clientHeight || rect.height || 1
        };
        const scaleX = frameViewport.width / Math.max(1, rect.width || 1);
        const scaleY = frameViewport.height / Math.max(1, rect.height || 1);
        const left = clamp((anchorRect.x - rect.x) * scaleX, 0, frameViewport.width);
        const top = clamp((anchorRect.y - rect.y) * scaleY, 0, frameViewport.height);
        const right = clamp((anchorRect.x + anchorRect.width - rect.x) * scaleX, 0, frameViewport.width);
        const bottom = clamp((anchorRect.y + anchorRect.height - rect.y) * scaleY, 0, frameViewport.height);
        return {
          frame,
          frameRect: rectToObject(rect),
          frameViewport,
          overlap,
          rect: {
            x: left,
            y: top,
            width: Math.max(1, right - left),
            height: Math.max(1, bottom - top)
          }
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 4);
  }

  function requestChildShotAnchor(query) {
    return new Promise((resolve) => {
      const requestId = `shot_anchor_${Date.now().toString(36)}_${++shotAnchorRequestIndex}`;
      const timer = setTimeout(() => {
        shotAnchorRequests.delete(requestId);
        resolve(null);
      }, 180);
      shotAnchorRequests.set(requestId, {
        frame: query.frame,
        frameRect: query.frameRect,
        frameViewport: query.frameViewport,
        rect: query.rect,
        resolve,
        timer
      });
      try {
        query.frame.contentWindow?.postMessage({
          source: INTERNAL_SOURCE,
          type: "VFS_SHOT_ANCHOR_QUERY",
          requestId,
          rect: query.rect
        }, "*");
      } catch {
        clearTimeout(timer);
        shotAnchorRequests.delete(requestId);
        resolve(null);
      }
    });
  }

  function resolveChildShotAnchor(message, sourceWindow) {
    const request = shotAnchorRequests.get(message.requestId);
    if (!request) {
      return;
    }
    const frame = findMessageSourceFrame(sourceWindow);
    if (frame && frame !== request.frame) {
      return;
    }
    clearTimeout(request.timer);
    shotAnchorRequests.delete(message.requestId);
    request.resolve(translateChildShotAnchor(message.anchor, request));
  }

  function translateChildShotAnchor(anchor, request) {
    if (!anchor?.anchorSelector) {
      return null;
    }
    const childViewport = anchor.coordinateViewport || request.frameViewport || {
      width: request.frameRect.width || 1,
      height: request.frameRect.height || 1
    };
    const scaleX = request.frameRect.width / Math.max(1, childViewport.width || 1);
    const scaleY = request.frameRect.height / Math.max(1, childViewport.height || 1);
    const point = anchor.anchorPoint || { x: 0, y: 0 };
    return {
      anchorSelector: anchor.anchorSelector,
      anchorFrameSelector: cssPath(request.frame),
      anchorLabel: anchor.anchorLabel || "",
      anchorExcerpt: anchor.anchorExcerpt || "",
      anchorOffset: anchor.anchorOffset || null,
      anchorOffsetRatio: anchor.anchorOffsetRatio || null,
      anchorElementRect: anchor.anchorElementRect || null,
      anchorLocalRect: anchor.anchorRect || request.rect || null,
      anchorCoordinateViewport: childViewport,
      anchorPoint: {
        x: request.frameRect.x + point.x * scaleX,
        y: request.frameRect.y + point.y * scaleY
      },
      anchorFrameUrl: anchor.anchorFrameUrl || "",
      anchorScore: (anchor.anchorScore || 0) + 1000,
      locationConfidence: anchor.locationConfidence || "近似定位"
    };
  }

  function normalizeViewportRect(value) {
    if (!value) {
      return null;
    }
    const x = clamp(Number(value.x) || 0, 0, window.innerWidth);
    const y = clamp(Number(value.y) || 0, 0, window.innerHeight);
    const right = clamp(x + Math.max(1, Number(value.width) || 1), 0, window.innerWidth);
    const bottom = clamp(y + Math.max(1, Number(value.height) || 1), 0, window.innerHeight);
    return {
      x,
      y,
      width: Math.max(1, right - x),
      height: Math.max(1, bottom - y)
    };
  }

  function shotViewportPoint(bounds) {
    return rectCenter(shotViewportRect(bounds));
  }

  function shotAnnotationAnchorPoint(bounds, annotations = []) {
    const point = shotAnnotationCanvasPoint(bounds, annotations) || rectCenter(bounds);
    return point ? shotCanvasPointToViewport(point) : null;
  }

  function shotAnnotationCanvasPoint(bounds, annotations = []) {
    const items = Array.isArray(annotations) ? annotations.filter(Boolean) : [];
    for (let index = items.length - 1; index >= 0; index -= 1) {
      const item = items[index];
      if (item.tool === "arrow") {
        const end = normalizePoint(item.end);
        if (end) {
          return end;
        }
      }
    }
    for (let index = items.length - 1; index >= 0; index -= 1) {
      const item = items[index];
      if (item.tool === "pen" && Array.isArray(item.points) && item.points.length) {
        return rectCenter(pointsBounds(item.points));
      }
    }
    for (let index = items.length - 1; index >= 0; index -= 1) {
      const item = items[index];
      if (item.tool === "box" || item.tool === "region") {
        return rectCenter(shotBounds(item));
      }
    }
    return bounds ? rectCenter(bounds) : null;
  }

  function shotCanvasPointToViewport(point) {
    const imageRect = shotImage?.getBoundingClientRect();
    const area = shotCaptureArea || shotFullViewportArea();
    if (!imageRect?.width || !imageRect?.height) {
      return {
        x: clamp((area.x || 0) + point.x, 0, window.innerWidth),
        y: clamp((area.y || 0) + point.y, 0, window.innerHeight)
      };
    }
    return {
      x: clamp((area.x || 0) + point.x / imageRect.width * area.width, 0, window.innerWidth),
      y: clamp((area.y || 0) + point.y / imageRect.height * area.height, 0, window.innerHeight)
    };
  }

  function shotAnchorTargetRect(point, fallbackRect) {
    const size = 42;
    if (!point) {
      return fallbackRect;
    }
    return {
      x: clamp(point.x - size / 2, 0, window.innerWidth),
      y: clamp(point.y - size / 2, 0, window.innerHeight),
      width: size,
      height: size
    };
  }

  function shotViewportRect(bounds) {
    const imageRect = shotImage?.getBoundingClientRect();
    const area = shotCaptureArea || shotFullViewportArea();
    if (!imageRect?.width || !imageRect?.height) {
      return {
        x: clamp(area.x + bounds.x, 0, window.innerWidth),
        y: clamp(area.y + bounds.y, 0, window.innerHeight),
        width: Math.max(1, Math.min(bounds.width, window.innerWidth)),
        height: Math.max(1, Math.min(bounds.height, window.innerHeight))
      };
    }
    const x = area.x + bounds.x / imageRect.width * area.width;
    const y = area.y + bounds.y / imageRect.height * area.height;
    const width = bounds.width / imageRect.width * area.width;
    const height = bounds.height / imageRect.height * area.height;
    const left = clamp(x, 0, window.innerWidth);
    const top = clamp(y, 0, window.innerHeight);
    const right = clamp(x + width, 0, window.innerWidth);
    const bottom = clamp(y + height, 0, window.innerHeight);
    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top)
    };
  }

  function pointsBounds(points = []) {
    const normalized = points.map(normalizePoint).filter(Boolean);
    if (!normalized.length) {
      return { x: 0, y: 0, width: 1, height: 1 };
    }
    const xs = normalized.map((point) => point.x);
    const ys = normalized.map((point) => point.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return {
      x,
      y,
      width: Math.max(1, Math.max(...xs) - x),
      height: Math.max(1, Math.max(...ys) - y)
    };
  }

  function findBestAnchorElement(rect) {
    return findBestAnchorCandidate(rect)?.element || null;
  }

  function findBestAnchorCandidate(rect) {
    const candidates = new Map();
    shotAnchorSamplePoints(rect).forEach((point) => {
      document.elementsFromPoint(clamp(point.x, 0, window.innerWidth - 1), clamp(point.y, 0, window.innerHeight - 1))
        .forEach((element, depth) => {
          const anchor = normalizeAnchorTarget(element);
          if (anchor) {
            addAnchorCandidate(candidates, anchor, Math.max(1, 6 - depth));
          }
        });
    });
    collectNearbyAnchorCandidates(rect).forEach((element) => addAnchorCandidate(candidates, element, 0));
    let best = null;
    let bestScore = -Infinity;
    candidates.forEach(({ element, hits }) => {
      const score = scoreAnchorCandidate(element, rect, hits);
      if (score > bestScore) {
        best = element;
        bestScore = score;
      }
    });
    return best ? { element: best, score: bestScore } : null;
  }

  function shotAnchorSamplePoints(rect) {
    const insetX = Math.min(12, rect.width / 4);
    const insetY = Math.min(12, rect.height / 4);
    const left = rect.x + insetX;
    const right = rect.x + rect.width - insetX;
    const top = rect.y + insetY;
    const bottom = rect.y + rect.height - insetY;
    const center = rectCenter(rect);
    return [
      center,
      { x: left, y: top },
      { x: right, y: top },
      { x: left, y: bottom },
      { x: right, y: bottom },
      { x: center.x, y: top },
      { x: center.x, y: bottom },
      { x: left, y: center.y },
      { x: right, y: center.y }
    ];
  }

  function collectNearbyAnchorCandidates(rect) {
    const expanded = expandRect(rect, 72);
    return Array.from(document.querySelectorAll(anchorCandidateSelector()))
      .filter((element) => {
        const anchor = normalizeAnchorTarget(element);
        return anchor === element && isVisibleAnchorCandidate(element, expanded);
      })
      .slice(0, 900);
  }

  function addAnchorCandidate(candidates, element, weight) {
    if (!element || candidates.has(element)) {
      if (element && candidates.has(element)) {
        candidates.get(element).hits += weight;
      }
      return;
    }
    candidates.set(element, { element, hits: weight });
  }

  function scoreAnchorCandidate(element, shotRect, hits = 0) {
    const rect = element.getBoundingClientRect();
    if (!isVisibleAnchorCandidate(element, shotRect)) {
      return -Infinity;
    }
    const overlap = rectOverlapArea(rect, shotRect);
    const shotArea = rectArea(shotRect);
    const elementArea = rectArea(rect);
    const overlapRatio = overlap / Math.max(1, Math.min(shotArea, elementArea));
    const distance = rectDistance(rect, shotRect);
    const semantic = anchorSemanticWeight(element);
    const broadPenalty = Math.max(0, elementArea / Math.max(1, shotArea) - 4) * 18;
    return overlapRatio * 1000 + hits * 55 + semantic * 32 - Math.sqrt(distance) - broadPenalty;
  }

  function anchorCandidateSelector() {
    return "iframe,a,button,input,textarea,select,label,h1,h2,h3,h4,h5,h6,p,li,img,section,article,aside,main,header,footer,div,span";
  }

  function findNearestAnchorElement(point) {
    const sampleOffsets = [
      [0, 0],
      [0, -24],
      [24, 0],
      [0, 24],
      [-24, 0],
      [48, 0],
      [-48, 0],
      [0, 48],
      [0, -48]
    ];
    for (const [dx, dy] of sampleOffsets) {
      const element = anchorElementFromPoint(point.x + dx, point.y + dy);
      if (element) {
        return element;
      }
    }
    return nearestVisibleElement(point);
  }

  function anchorElementFromPoint(x, y) {
    const elements = document.elementsFromPoint(clamp(x, 0, window.innerWidth - 1), clamp(y, 0, window.innerHeight - 1));
    for (const element of elements) {
      const anchor = normalizeAnchorTarget(element);
      if (anchor) {
        return anchor;
      }
    }
    return null;
  }

  function normalizeAnchorTarget(target) {
    if (!(target instanceof Element) || isVfsUi(target) || isVfsGeneratedElement(target)) {
      return null;
    }
    const semantic = target.closest("iframe,a,button,input,textarea,select,label,h1,h2,h3,h4,h5,h6,p,li,img");
    const element = semantic || target.closest(anchorCandidateSelector());
    if (!element || isVfsUi(element) || isVfsGeneratedElement(element) || element === document.documentElement || element === document.body) {
      return null;
    }
    return element;
  }

  function isVfsGeneratedElement(element) {
    return Array.from(element.classList || []).some((name) => name.startsWith("vfs-"));
  }

  function nearestVisibleElement(point) {
    let best = null;
    let bestDistance = Infinity;
    const candidates = Array.from(document.querySelectorAll("iframe,a,button,input,textarea,select,label,h1,h2,h3,h4,h5,h6,p,li,img,section,article,aside,main,header,footer,div,span"));
    candidates.slice(0, 600).forEach((element) => {
      if (isVfsUi(element) || isVfsGeneratedElement(element)) {
        return;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4 || rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
        return;
      }
      const dx = Math.max(rect.left - point.x, 0, point.x - rect.right);
      const dy = Math.max(rect.top - point.y, 0, point.y - rect.bottom);
      const distance = dx * dx + dy * dy + Math.min(rect.width * rect.height, 120000) / 120000;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = element;
      }
    });
    return best;
  }

  function isVisibleAnchorCandidate(element, viewportRect) {
    if (isVfsUi(element) || isVfsGeneratedElement(element)) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width >= 4 &&
      rect.height >= 4 &&
      rect.bottom >= 0 &&
      rect.top <= window.innerHeight &&
      rect.right >= 0 &&
      rect.left <= window.innerWidth &&
      rectDistance(rect, viewportRect) <= 160 * 160;
  }

  function rectCenter(rect) {
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }

  function rectArea(rect) {
    return Math.max(0, Number(rect.width) || 0) * Math.max(0, Number(rect.height) || 0);
  }

  function rectOverlapArea(a, b) {
    const left = Math.max(a.left ?? a.x, b.left ?? b.x);
    const top = Math.max(a.top ?? a.y, b.top ?? b.y);
    const right = Math.min(a.right ?? (a.x + a.width), b.right ?? (b.x + b.width));
    const bottom = Math.min(a.bottom ?? (a.y + a.height), b.bottom ?? (b.y + b.height));
    return Math.max(0, right - left) * Math.max(0, bottom - top);
  }

  function rectDistance(a, b) {
    const aLeft = a.left ?? a.x;
    const aRight = a.right ?? (a.x + a.width);
    const aTop = a.top ?? a.y;
    const aBottom = a.bottom ?? (a.y + a.height);
    const bLeft = b.left ?? b.x;
    const bRight = b.right ?? (b.x + b.width);
    const bTop = b.top ?? b.y;
    const bBottom = b.bottom ?? (b.y + b.height);
    const dx = Math.max(aLeft - bRight, bLeft - aRight, 0);
    const dy = Math.max(aTop - bBottom, bTop - aBottom, 0);
    return dx * dx + dy * dy;
  }

  function expandRect(rect, padding) {
    return {
      x: Math.max(0, rect.x - padding),
      y: Math.max(0, rect.y - padding),
      width: Math.min(window.innerWidth, rect.width + padding * 2),
      height: Math.min(window.innerHeight, rect.height + padding * 2)
    };
  }

  function anchorSemanticWeight(element) {
    if (element.matches("button,a,input,textarea,select,label")) {
      return 6;
    }
    if (element.matches("h1,h2,h3,h4,h5,h6")) {
      return 5;
    }
    if (element.matches("img,li,p")) {
      return 4;
    }
    if (element.matches("section,article,aside,main,header,footer")) {
      return 2;
    }
    return 1;
  }

  function drawShotAnnotations() {
    if (!shotCtx || !shotCanvas) {
      return;
    }
    const rect = shotCanvas.getBoundingClientRect();
    shotCtx.clearRect(0, 0, rect.width, rect.height);
    if (shotRegion) {
      drawShotRegion(shotRegion);
    }
    [...shotAnnotations, shotDraft].filter(Boolean).forEach((item) => {
      if (item.tool === "region") {
        drawShotRegion(shotBounds(item), true);
      } else {
        drawShotShape(item);
      }
    });
  }

  function drawShotRegion(bounds, isDraft = false) {
    shotCtx.save();
    shotCtx.strokeStyle = "#df7959";
    shotCtx.fillStyle = isDraft ? "rgba(223, 121, 89, 0.05)" : "rgba(223, 121, 89, 0.07)";
    shotCtx.lineWidth = 1.5;
    shotCtx.setLineDash(isDraft ? [6, 4] : []);
    shotCtx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    shotCtx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    shotCtx.restore();
  }

  function drawShotShape(item) {
    shotCtx.save();
    shotCtx.strokeStyle = "#df7959";
    shotCtx.fillStyle = "rgba(223, 121, 89, 0.08)";
    shotCtx.lineWidth = 2;
    shotCtx.lineCap = "round";
    shotCtx.lineJoin = "round";
    if (item.tool === "box") {
      const bounds = shotBounds(item);
      shotCtx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      shotCtx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    } else if (item.tool === "arrow") {
      drawArrow(item.start, item.end);
    } else {
      drawPen(item.points || []);
    }
    shotCtx.restore();
  }

  function drawArrow(start, end) {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const head = 9;
    shotCtx.beginPath();
    shotCtx.moveTo(start.x, start.y);
    shotCtx.lineTo(end.x, end.y);
    shotCtx.stroke();
    shotCtx.beginPath();
    shotCtx.moveTo(end.x, end.y);
    shotCtx.lineTo(end.x - head * Math.cos(angle - Math.PI / 6), end.y - head * Math.sin(angle - Math.PI / 6));
    shotCtx.moveTo(end.x, end.y);
    shotCtx.lineTo(end.x - head * Math.cos(angle + Math.PI / 6), end.y - head * Math.sin(angle + Math.PI / 6));
    shotCtx.stroke();
  }

  function drawPen(points) {
    if (!points.length) {
      return;
    }
    shotCtx.beginPath();
    shotCtx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => shotCtx.lineTo(point.x, point.y));
    shotCtx.stroke();
  }

  function shotPoint(event) {
    const rect = shotCanvas.getBoundingClientRect();
    return {
      x: clamp(event.clientX - rect.left, 0, rect.width),
      y: clamp(event.clientY - rect.top, 0, rect.height)
    };
  }

  function shotBounds(item) {
    const points = item.tool === "pen" ? item.points : [item.start, item.end];
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return {
      x,
      y,
      width: Math.max(1, Math.max(...xs) - x),
      height: Math.max(1, Math.max(...ys) - y)
    };
  }

  function hasMeaningfulShotDraft(item) {
    const bounds = shotBounds(item);
    return bounds.width > 8 || bounds.height > 8 || (item.points || []).length > 3;
  }

  function findElement(record) {
    const selector = record.type === "screenshot" ? record.anchorSelector : record.selector;
    if (isRecordFromDifferentFrame(record)) {
      return findFrameElementForRecord(record);
    }
    if (!selector) {
      return findElementByRecordSignal(record);
    }
    try {
      const matches = document.querySelectorAll(selector);
      const selected = matches.length === 1 ? matches[0] : null;
      if (selected && !isWeakAnchorElement(selected) && !isVfsUi(selected)) {
        return selected;
      }
    } catch {
      // Fall through to high-confidence signal recovery.
    }
    return findElementByRecordSignal(record);
  }

  function findFrameElementForRecord(record) {
    if (!isTopFrame()) {
      return null;
    }
    const frameSelector = record.type === "screenshot"
      ? record.anchorFrameSelector || record.frameSelector || ""
      : record.frameSelector || "";
    if (frameSelector) {
      try {
        const selected = document.querySelector(frameSelector);
        if (selected?.tagName === "IFRAME") {
          return selected;
        }
      } catch {
        // Fall through to URL matching.
      }
    }
    const frameUrl = recordFrameUrl(record);
    if (!frameUrl) {
      return null;
    }
    const targetKey = normalizeLocationKey(frameUrl);
    const frames = Array.from(document.querySelectorAll("iframe"));
    return frames.find((frame) => normalizeLocationKey(frame.src || "") === targetKey) ||
      frames.find((frame) => frame.src && normalizeLocationKey(frame.src).includes(targetKey)) ||
      null;
  }

  function findElementByRecordSignal(record) {
    const searchText = recordSearchText(record);
    if (searchText.replace(/[^\p{L}\p{N}]/gu, "").length < 3) {
      return null;
    }
    const targetCenter = recordViewportCenter(record);
    let best = null;
    let bestScore = -Infinity;
    const candidates = Array.from(document.querySelectorAll(anchorCandidateSelector())).slice(0, 1400);
    candidates.forEach((element) => {
      if (isVfsUi(element) || isVfsGeneratedElement(element) || isWeakAnchorElement(element)) {
        return;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4 || rect.bottom < -80 || rect.top > window.innerHeight + 80 || rect.right < -80 || rect.left > window.innerWidth + 80) {
        return;
      }
      const score = recordElementScore(record, element, searchText, targetCenter);
      if (score > bestScore) {
        bestScore = score;
        best = element;
      }
    });
    if (best && bestScore >= 4) {
      return best;
    }
    return null;
  }

  function recordElementScore(record, element, searchText, targetCenter) {
    const haystack = elementMatchText(element);
    let score = 0;
    if (searchText && haystack) {
      if (haystack === searchText) {
        score += 5;
      } else if (haystack.includes(searchText) || searchText.includes(haystack)) {
        score += 4;
      } else {
        const tokens = searchText.split(/\s+/).filter((item) => item.length >= 2).slice(0, 8);
        score += tokens.filter((token) => haystack.includes(token)).length;
      }
    }
    const label = String(record.label || record.anchorLabel || "").trim().toLowerCase();
    if (label && haystack.includes(label)) {
      score += 2;
    }
    if (targetCenter) {
      const rect = element.getBoundingClientRect();
      const cx = clamp((rect.left + rect.width / 2) / Math.max(1, window.innerWidth), 0, 1);
      const cy = clamp((rect.top + rect.height / 2) / Math.max(1, window.innerHeight), 0, 1);
      const distance = Math.hypot(cx - targetCenter.x, cy - targetCenter.y);
      score += Math.max(0, 2 - distance * 4);
    }
    return score;
  }

  function recordSearchText(record) {
    return String(record.label || record.anchorLabel || record.excerpt || record.anchorExcerpt || record.text || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160)
      .toLowerCase();
  }

  function elementMatchText(element) {
    return String(
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      element.getAttribute("alt") ||
      element.value ||
      element.innerText ||
      element.textContent ||
      ""
    ).replace(/\s+/g, " ").trim().slice(0, 240).toLowerCase();
  }

  function recordViewportCenter(record) {
    const rect = record.viewportRect || record.rect || record.anchorRect || null;
    const viewport = record.coordinateViewport || record.anchorCoordinateViewport || null;
    if (!rect || !viewport) {
      return null;
    }
    const width = Math.max(1, Number(viewport.width) || 1);
    const height = Math.max(1, Number(viewport.height) || 1);
    return {
      x: clamp(((Number(rect.x) || 0) + (Number(rect.width) || 0) / 2) / width, 0, 1),
      y: clamp(((Number(rect.y) || 0) + (Number(rect.height) || 0) / 2) / height, 0, 1)
    };
  }

  function isWeakAnchorElement(element) {
    if (!element || element === document.documentElement || element === document.body) {
      return true;
    }
    const rect = element.getBoundingClientRect();
    return rect.width >= window.innerWidth * 0.96 && rect.height >= window.innerHeight * 0.9;
  }

  function isFrameFallbackForRecord(record, element) {
    if (!record || !element || element.tagName !== "IFRAME") {
      return false;
    }
    return isRecordFromDifferentFrame(record);
  }

  function isRecordFromDifferentFrame(record) {
    const frameUrl = recordFrameUrl(record);
    if (!frameUrl) {
      return false;
    }
    return normalizeLocationKey(frameUrl) !== normalizeLocationKey(location.href);
  }

  function handleChildSelection(selection) {
    if (!selection) {
      return;
    }
    ensureUi();
    clearSelection();
    pendingSelection = selection;
    sidebarOpen = true;
    mode = "dom";
    renderAll();
    openDomComposer(selection);
  }

  function locateRecordFromMessage(record) {
    if (!record || (record.type !== "dom" && record.type !== "screenshot")) {
      return;
    }
    const element = findElement(record);
    if (!element) {
      return;
    }
    activeId = record.id;
    showElementFocus(element, record);
    renderAll();
  }

  function buildElementSelection(element) {
    const rect = element.getBoundingClientRect();
    const topFrame = isTopFrame();
    const selection = {
      label: elementLabel(element),
      selector: cssPath(element),
      excerpt: elementExcerpt(element),
      rect: rectToObject(rect),
      viewportRect: rectToObject(rect),
      coordinateViewport: viewportSize(),
      pageX: window.scrollX,
      pageY: window.scrollY,
      frameUrl: location.href,
      topFrame
    };
    if (!topFrame) {
      selection.remoteStyle = createRemoteStyleSession(element);
    }
    return selection;
  }

  function translateChildSelection(selection, sourceWindow) {
    if (!selection) {
      return selection;
    }
    const rect = selection.viewportRect || selection.rect;
    const sourceViewport = selection.coordinateViewport || selection.frameViewport || null;
    const frame = findMessageSourceFrame(sourceWindow);
    if (!rect || !frame) {
      return {
        ...selection,
        coordinateViewport: viewportSize()
      };
    }
    try {
      const frameRect = frame.getBoundingClientRect();
      const frameViewport = sourceViewport || {
        width: frame.clientWidth || frameRect.width || 1,
        height: frame.clientHeight || frameRect.height || 1
      };
      const scaleX = frameRect.width / Math.max(1, frameViewport.width || frameRect.width || 1);
      const scaleY = frameRect.height / Math.max(1, frameViewport.height || frameRect.height || 1);
      return {
        ...selection,
        frameSelector: cssPath(frame),
        frameElementRect: rectToObject(frameRect),
        viewportRect: {
          x: frameRect.x + rect.x * scaleX,
          y: frameRect.y + rect.y * scaleY,
          width: rect.width * scaleX,
          height: rect.height * scaleY
        },
        coordinateViewport: viewportSize(),
        pageX: window.scrollX,
        pageY: window.scrollY
      };
    } catch {
      return {
        ...selection,
        coordinateViewport: viewportSize(),
        pageX: window.scrollX,
        pageY: window.scrollY
      };
    }
  }

  function findMessageSourceFrame(sourceWindow) {
    if (!sourceWindow) {
      return null;
    }
    const frames = Array.from(document.querySelectorAll("iframe"));
    for (const frame of frames) {
      try {
        if (frame.contentWindow === sourceWindow) {
          return frame;
        }
      } catch {
        // Cross-origin frames can still fail on some hosts; skip them.
      }
    }
    return null;
  }

  function viewportSize() {
    return {
      width: window.innerWidth || 1,
      height: window.innerHeight || 1
    };
  }

  function isTopFrame() {
    return window.top === window;
  }

  function postToParent(message) {
    if (isTopFrame()) {
      return;
    }
    window.parent.postMessage({ ...message, source: INTERNAL_SOURCE }, "*");
  }

  function postToChildFrames(message) {
    document.querySelectorAll("iframe").forEach((frame) => {
      try {
        frame.contentWindow?.postMessage({ ...message, source: INTERNAL_SOURCE }, "*");
      } catch {
        // Cross-origin frames that cannot receive messages are skipped.
      }
    });
  }

  function broadcastToChildFrames(message) {
    if (!isTopFrame()) {
      postToChildFrames(message);
      return;
    }
    postToChildFrames(message);
    relayToAllFrames({ ...message, type: relayType(message.type) });
  }

  function relayToAllFrames(message) {
    if (!isTopFrame()) {
      return;
    }
    try {
      chrome.runtime.sendMessage({
        source: CONTENT_SOURCE,
        type: "VFS_RELAY_ALL_FRAMES",
        payload: message
      }, () => {
        void chrome.runtime.lastError;
      });
    } catch {
      // Runtime relay is best-effort; window.postMessage remains the local fallback.
    }
  }

  function relayType(type) {
    return type === "VFS_MODE_CHANGED" ? "VFS_FRAME_SYNC" : type;
  }

  function updatePageScale() {
    if (!isTopFrame()) {
      return;
    }
    // The floating workbench overlays the page instead of shrinking or scaling the live viewport.
    document.documentElement.style.setProperty("--vfs-page-scale", "1");
  }

  function ensurePageFrame() {
    if (!isTopFrame() || document.body?.querySelector(":scope > .vfs-page-frame")) {
      return;
    }
    if (!document.body) {
      return;
    }
    const frame = document.createElement("div");
    frame.className = "vfs-page-frame";
    const nodes = Array.from(document.body.childNodes).filter((node) => node !== root && node !== markerLayer);
    nodes.forEach((node) => frame.append(node));
    document.body.append(frame);
  }

  async function handleFeishuLogin() {
    if (feishuBusy) {
      return;
    }
    const startedAt = performance.now();
    trackEvent("feishu_login_started", { source: "oauth" });
    feishuBusy = true;
    feishuBusyAction = "login";
    try {
      setFeishuPending("正在连接");
      await ensureSyncServiceAvailable();
      await storageRemove(FEISHU_LOGIN_CLIENT_STORAGE_KEY);
      await openUrlInNewTab(FEISHU_LOGIN_URL, { returnToOpener: true });
      setFeishuPending("等待授权");
      showToast("飞书授权页已打开。");
    } catch (error) {
      clearFeishuPending();
      showToast(normalizeFeishuLoginError(error));
      trackEvent("feishu_login_failed", { source: "oauth" }, {
        success: false,
        durationMs: performance.now() - startedAt,
        errorCode: error
      });
    } finally {
      feishuBusy = false;
      feishuBusyAction = "";
      renderCollabStatus();
    }
  }

  async function handleSyncFeishu() {
    if (feishuBusy) {
      return null;
    }
    const initialRecords = feishuDocumentRecords();
    if (!initialRecords.length) {
      showToast("暂无待解决批注可同步。");
      return null;
    }
    feishuBusy = true;
    const startedAt = performance.now();
    trackEvent("sync_started", { sync_kind: "document", record_count: initialRecords.length, background: false });
    feishuBusyAction = "sync-document";
    setFeishuPending("正在同步飞书文档…");
    renderCollabStatus();
    try {
      await ensureCollabSession();
      if (activeTeamChatId()) {
        await handleCollabSyncTeamPage({ pendingOnly: true, busyAction: "" });
      }
      const documentRecords = feishuDocumentRecords();
      if (!documentRecords.length) {
        showToast("暂无待解决批注可同步。");
        return null;
      }
      await enrichFeishuRecordPreviews(documentRecords);
      const missingImages = documentRecords.filter((record) => !record.previewImage);
      if (missingImages.length) {
        throw new Error(`有 ${missingImages.length} 条批注尚未生成配图，请在对应页面重新定位后再同步。`);
      }
      const payload = buildFeishuSyncPackage(documentRecords);
      const requestBody = await buildFeishuSyncRequest(payload);
      const response = await fetchWithClientTimeout(await getFeishuSyncUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${feishuSessionToken}`
        },
        body: JSON.stringify(requestBody)
      }, DOCUMENT_SYNC_TIMEOUT_MS, "飞书文档同步超时，请重试。");
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "飞书文档同步失败。");
      }
      await saveFeishuDocumentState(payload, result);
      if (result.documentUrl) {
        void copyTextToClipboard(result.documentUrl).catch(() => {});
        void openUrlInNewTab(result.documentUrl).catch(() => {});
      }
      const message = Number(result.imageFailureCount || 0) > 0
        ? `文档已更新，但有 ${Number(result.imageFailureCount)} 条配图上传失败，请检查飞书素材权限。`
        : result.noChanges
          ? "飞书文档已是最新，未重复追加记录。"
          : `已同步 ${documentRecords.length} 条待解决批注到飞书文档${result.version ? ` v${result.version}` : ""}。`;
      showToast(message);
      trackEvent("sync_succeeded", { sync_kind: "document", record_count: documentRecords.length, background: false }, {
        success: true,
        durationMs: performance.now() - startedAt
      });
      return result;
    } catch (error) {
      showToast(normalizeFeishuSyncError(error));
      trackEvent("sync_failed", { sync_kind: "document", record_count: feishuDocumentRecords().length, background: false }, {
        success: false,
        durationMs: performance.now() - startedAt,
        errorCode: error
      });
      throw error;
    } finally {
      feishuBusy = false;
      feishuBusyAction = "";
      clearFeishuPending();
      renderCollabStatus();
    }
  }

  function feishuDocumentRecords() {
    return records.filter((record) => {
      const status = String(record?.collab?.status || "open");
      return status !== "resolved" && status !== "deleted";
    });
  }

  async function enrichFeishuRecordPreviews(sourceRecords = feishuDocumentRecords()) {
    queueVisibleLegacyShotAnchors();
    const pendingTasks = Array.from(shotEnrichmentTasks.values());
    if (pendingTasks.length) {
      await Promise.allSettled(pendingTasks);
    }
    for (const record of sourceRecords) {
      if (record.type !== "dom" || record.previewImage) {
        continue;
      }
      const element = findElement(record);
      if (!element || element.tagName === "IFRAME") {
        continue;
      }
      const rect = element.getBoundingClientRect();
      const visible = rect.width >= 2 && rect.height >= 2 && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
      if (!visible) {
        continue;
      }
      const previewImage = await createDomPreview({
        viewportRect: rectToObject(rect),
        topFrame: true
      }).catch(() => "");
      if (!previewImage) {
        continue;
      }
      record.previewImage = previewImage;
      record.updatedAt = record.updatedAt || new Date().toISOString();
      await persistRecordEnrichment(record);
    }
  }

  function buildFeishuSyncPackage(sourceRecords = feishuDocumentRecords()) {
    const targetKey = collabTargetKey(currentPageIdentityKey());
    return {
      format: "vf-feedback-package",
      version: 2,
      exportedAt: new Date().toISOString(),
      page: {
        title: pageContext.title || document.title || "未命名页面",
        url: currentPageUrl(),
        targetKey,
        frameUrl: primaryContentFrameUrl() || location.href
      },
      collaboration: activeTeamChatId() ? {
        mode: "team",
        teamId: collabState?.team?.teamId || "",
        chatId: activeTeamChatId(),
        team: collabState?.team || null,
        targetKey: collabState.targetKey || targetKey,
        serverVersion: Number(collabState.serverVersion || 0)
      } : null,
      feedback: sourceRecords.map(normalizeRecordForFeishu).filter(Boolean)
    };
  }

  function normalizeRecordForFeishu(record) {
    if (!record || (record.type !== "dom" && record.type !== "screenshot")) {
      return null;
    }
    const source = record.type === "screenshot" ? "screenshot" : "dom";
    const rect = roundRect(record.viewportRect || record.rect || record.bounds || {}) || { x: 0, y: 0, width: 0, height: 0 };
    const selector = source === "screenshot" ? record.anchorSelector || "" : record.selector || "";
    const currentOpenId = feishuOpenId(feishuUser);
    const belongsToCurrentUser = !record.collab?.authorOpenId && (
      !record.author ||
      record.author === currentAuthor ||
      record.author === DEFAULT_AUTHOR
    );
    const authorOpenId = record.collab?.authorOpenId || (belongsToCurrentUser ? currentOpenId : "");
    const authorAvatarUrl = record.collab?.authorAvatarUrl || (authorOpenId === feishuOpenId(feishuUser) ? feishuUser?.avatarUrl || feishuUser?.avatar_url || "" : "");
    const author = record.collab?.authorName || (authorOpenId === currentOpenId
      ? displayFeishuUserName(feishuUser)
      : record.author || currentAuthor || DEFAULT_AUTHOR);
    const item = {
      id: record.id,
      source,
      comment: displayTextWithMentions(record.text || "", record.mentions || record.collab?.mentions || []),
      status: String(record.collab?.status || "open"),
      url: record.url || currentPageUrl(),
      title: pageContext.title || document.title || "未命名页面",
      frameUrl: source === "screenshot" ? record.anchorFrameUrl || record.frameUrl || "" : record.frameUrl || "",
      selector,
      text: record.excerpt || record.anchorExcerpt || targetLabel(record),
      author,
      authorOpenId,
      authorAvatarUrl,
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: record.updatedAt || record.createdAt || new Date().toISOString(),
      rect,
      previewImage: source === "dom" ? record.previewImage || "" : "",
      previewImageWidth: record.previewImageWidth || 0,
      previewImageHeight: record.previewImageHeight || 0
    };
    const messages = Array.isArray(record.collab?.messages) ? record.collab.messages.slice(1) : [];
    item.replies = messages.filter((message) => message?.text).map((message) => ({
      id: message.messageId || "",
      text: displayTextWithMentions(message.text, message.mentions),
      author: message.authorName || "协作者",
      authorOpenId: message.authorOpenId || "",
      createdAt: message.createdAt || message.updatedAt || ""
    }));
    if (source === "screenshot") {
      item.screenshot = {
        rect: roundRect(record.bounds || rect),
        anchorSelector: record.anchorSelector || "",
        anchorLabel: record.anchorLabel || "",
        anchorExcerpt: record.anchorExcerpt || "",
        attachmentDataUrl: record.previewImage || "",
        thumbnailDataUrl: record.previewImage || "",
        imageWidth: record.previewImageWidth || 0,
        imageHeight: record.previewImageHeight || 0
      };
    }
    return item;
  }

  async function buildFeishuSyncRequest(payload) {
    const docMap = await storageGet(FEISHU_DOC_MAP_STORAGE_KEY) || {};
    const key = feishuDocumentMapKey(payload);
    const documentState = key ? docMap[key] || null : null;
    return {
      package: payload,
      document: documentState,
      options: {
        docHost: "https://bytedance.feishu.cn",
        grantPerm: "edit",
        documentTitle: documentState?.documentTitle || suggestFeishuDocumentTitle(payload),
        roomId: "",
        roomTargetKey: payload.collaboration?.targetKey || payload.page.targetKey || "",
        roomServerVersion: Number(payload.collaboration?.serverVersion || 0)
      }
    };
  }

  async function saveFeishuDocumentState(payload, result) {
    const documentState = result?.document;
    const documentId = documentState?.documentId || documentState?.document_id || result?.documentId || result?.document_id;
    const key = feishuDocumentMapKey(payload);
    if (!documentId || !key) {
      return;
    }
    const docMap = await storageGet(FEISHU_DOC_MAP_STORAGE_KEY) || {};
    docMap[key] = {
      pageUrl: payload.page.url,
      pageTitle: payload.page.title,
      teamId: payload.collaboration?.teamId || "",
      documentTitle: documentState?.documentTitle || result?.documentTitle || suggestFeishuDocumentTitle(payload),
      documentId,
      documentUrl: documentState?.documentUrl || result?.documentUrl || "",
      rootBlockId: documentState?.rootBlockId || result?.rootBlockId || documentId,
      version: Number(documentState?.version || result?.version || 0),
      imageFailureCount: Number(documentState?.imageFailureCount || result?.imageFailureCount || 0),
      roomServerVersion: Number(result?.roomServerVersion || payload.collaboration?.serverVersion || 0),
      updatedAt: documentState?.updatedAt || new Date().toISOString()
    };
    await storageSet({ [FEISHU_DOC_MAP_STORAGE_KEY]: docMap });
  }

  function feishuDocumentMapKey(payload) {
    const targetKey = String(payload?.collaboration?.targetKey || payload?.page?.targetKey || payload?.page?.url || "").trim();
    const teamId = String(payload?.collaboration?.chatId || payload?.collaboration?.teamId || "").trim();
    return teamId ? `team:${teamId}:${targetKey}` : `page:${targetKey}`;
  }

  function suggestFeishuDocumentTitle(payload) {
    const title = String(payload?.page?.title || "未命名页面").replace(/\s+/g, " ").trim().slice(0, 60);
    const teamName = payload?.collaboration?.team?.name;
    return teamName ? `飞标评审｜${teamName}｜${title}` : `飞标评审｜${title}`;
  }

  function normalizeFeishuSyncError(error) {
    const message = error?.message || String(error || "");
    if (/登录|session|token|401|403/i.test(message)) {
      return "请先登录飞书。";
    }
    if (/Room|room|轮次/.test(message)) {
      return message;
    }
    if (isNetworkUnavailableError(error)) {
      return "暂时无法连接飞书文档服务，请稍后重试。";
    }
    return message || "飞书文档同步失败。";
  }

  async function handleCollabOpenTeam(chatId, options = {}) {
    const value = String(chatId || "").trim();
    if (!value) {
      throw new Error("请先选择一个 Team 群聊。");
    }
    const background = options.busyAction === "";
    if (background) {
      collabBackgroundBusy = true;
    } else {
      collabBusy = true;
      collabBusyAction = options.busyAction ?? "team";
    }
    renderCollabStatus();
    try {
      await ensureCollabSession();
      const team = normalizeCollabTeams(collabState).find((item) => item.chatId === value) || collabState?.team || {};
      const result = await collabRequest("open-team-page", {
        chatId: value,
        team,
        page: collabPagePayload()
      });
      await applyTeamResult(result, { preserveLocalRecords: Boolean(options.preserveLocalRecords) });
      return result;
    } finally {
      if (background) {
        collabBackgroundBusy = false;
      } else {
        collabBusy = false;
        collabBusyAction = "";
      }
      renderCollabStatus();
      scheduleCollabPoll();
    }
  }

  async function handleCollabSyncTeamPage(options = {}) {
    await ensureActiveTeam();
    const background = options.busyAction === "";
    if (background) {
      collabBackgroundBusy = true;
    } else {
      collabBusy = true;
      collabBusyAction = options.busyAction ?? "refresh";
    }
    renderCollabStatus();
    try {
      await ensureCollabSession();
      const uploadRecords = await collabRecordsForUpload({ pendingOnly: Boolean(options.pendingOnly) });
      const deletedThreadIds = teamDeletedThreadIds(uploadRecords);
      const result = await collabRequest("sync-team-page", {
        chatId: activeTeamChatId(),
        team: collabState?.team || null,
        page: collabPagePayload(),
        records: uploadRecords,
        clientVersion: Number(collabState?.serverVersion || 0)
      });
      await applyTeamResult(result, { preserveLocalRecords: true });
      if (deletedThreadIds.size) {
        await pruneSyncedDeletedTeamRecords(deletedThreadIds);
      }
      return result;
    } finally {
      if (background) {
        collabBackgroundBusy = false;
      } else {
        collabBusy = false;
        collabBusyAction = "";
      }
      renderCollabStatus();
      scheduleCollabPoll();
    }
  }

  async function ensureActiveTeam() {
    if (!activeTeamChatId()) {
      await loadCollabState();
    }
    if (!activeTeamChatId()) {
      throw new Error("请先选择一个 Team 群聊。");
    }
  }

  async function handleCollabCreateRoom(roundName = "") {
    if (!isTopFrame()) {
      throw new Error("请在主页面创建批注轮次。");
    }
    collabBusy = true;
    collabBusyAction = "create";
    renderCollabStatus();
    try {
      await nextPaint();
      await waitForBackgroundCollab();
      await ensureCollabSession();
      const preserveLocalRecords = !activeCollabRoundId();
      const uploadRecords = preserveLocalRecords ? await collabRecordsForUpload() : [];
      const result = await collabRequest("create-round", {
        roundId: generateClientRoundId(),
        roundName: String(roundName || "").trim(),
        page: collabPagePayload(),
        records: uploadRecords,
        clientVersion: 0,
        provisionResources: true
      });
      await applyCollabResult(result, { preserveLocalRecords });
      return result;
    } finally {
      collabBusy = false;
      collabBusyAction = "";
      renderCollabStatus();
      scheduleCollabPoll();
    }
  }

  async function handleCollabJoinRoom(roomId) {
    const value = String(roomId || "").trim();
    if (!value) {
      throw new Error("请输入轮次 ID。");
    }
    collabBusy = true;
    collabBusyAction = "join";
    renderCollabStatus();
    try {
      await nextPaint();
      await waitForBackgroundCollab();
      await ensureCollabSession();
      const result = await collabRequest("join-round", {
        roundId: value,
        page: collabPagePayload()
      });
      await applyCollabResult(result, { preserveLocalRecords: false });
      const pendingRecords = await collabRecordsForUpload({ pendingOnly: true });
      if (!pendingRecords.length) {
        return result;
      }
      const synced = await collabRequest("sync-round", {
        roundId: activeCollabRoundId(),
        page: collabPagePayload(),
        records: pendingRecords,
        clientVersion: collabState?.serverVersion || 0
      });
      await applyCollabResult(synced, { preserveLocalRecords: true });
      return synced;
    } finally {
      collabBusy = false;
      collabBusyAction = "";
      renderCollabStatus();
      scheduleCollabPoll();
    }
  }

  async function handleCollabSyncRoom(options = {}) {
    await ensureActiveCollabRoom();
    const background = options.busyAction === "";
    if (background) {
      collabBackgroundBusy = true;
    } else {
      collabBusy = true;
      collabBusyAction = options.busyAction ?? "refresh";
    }
    renderCollabStatus();
    try {
      await ensureCollabSession();
      const uploadRecords = await collabRecordsForUpload({ pendingOnly: Boolean(options.pendingOnly) });
      const result = await collabRequest("sync-round", {
        roundId: activeCollabRoundId(),
        page: collabPagePayload(),
        records: uploadRecords,
        clientVersion: collabState?.serverVersion || 0
      });
      await applyCollabResult(result, { preserveLocalRecords: true });
      return result;
    } finally {
      if (background) {
        collabBackgroundBusy = false;
      } else {
        collabBusy = false;
        collabBusyAction = "";
      }
      renderCollabStatus();
      scheduleCollabPoll();
    }
  }

  async function handleCollabPullRoom(options = {}) {
    await ensureActiveCollabRoom();
    const background = options.busyAction === "";
    if (background) {
      collabBackgroundBusy = true;
    } else {
      collabBusy = true;
      collabBusyAction = options.busyAction ?? "refresh";
    }
    renderCollabStatus();
    try {
      await ensureCollabSession();
      const result = await collabRequest("pull-round", {
        roundId: activeCollabRoundId(),
        page: collabPagePayload(),
        afterVersion: collabState?.serverVersion || 0
      });
      await applyCollabResult(result, { preserveLocalRecords: true });
      return result;
    } finally {
      if (background) {
        collabBackgroundBusy = false;
      } else {
        collabBusy = false;
        collabBusyAction = "";
      }
      renderCollabStatus();
      scheduleCollabPoll();
    }
  }

  async function ensureActiveCollabRoom() {
    if (!activeCollabRoundId()) {
      await loadCollabState();
    }
    if (!activeCollabRoundId()) {
      throw new Error("请先创建或加入批注轮次。");
    }
  }

  async function waitForBackgroundCollab() {
    while (collabBackgroundBusy) {
      await delay(40);
    }
  }

  async function refreshCollabWorkspaceOverview(options = {}) {
    if (!isTopFrame() || !feishuSessionToken) {
      return null;
    }
    if (collabOverviewPromise) {
      return await collabOverviewPromise;
    }
    const startedAt = performance.now();
    const source = options.forceList ? "manual" : "automatic";
    trackEvent("teams_refresh_started", { source });
    collabOverviewPromise = (async () => {
      const knownChatIds = new Set(normalizeCollabTeams(collabState).map((team) => team.chatId));
      collabBusy = true;
      collabBusyAction = "teams";
      renderCollabStatus();
      const result = await collabRequest("list-teams");
      const teams = Array.isArray(result.teams) ? result.teams : [];
      const discoveredCount = teams.filter((team) => !knownChatIds.has(String(team?.chatId || team?.teamId || "").trim())).length;
      trackEvent("teams_refresh_succeeded", { source, team_count: teams.length }, {
        success: true,
        durationMs: performance.now() - startedAt
      });
      collabState = {
        ...(collabState || {}),
        teams,
        lastOverviewAt: new Date().toISOString()
      };
      if (!options.silent && options.showSuccess !== false) {
        showToast(discoveredCount
          ? `群聊列表已刷新，发现 ${discoveredCount} 个新群聊。`
          : "群聊列表已是最新。");
      }
      const activeChatId = activeTeamChatId();
      const activeAvailable = teams.some((team) => team.chatId === activeChatId);
      if (activeChatId && activeAvailable) {
        await saveCollabState();
        if (options.skipActiveOpen) {
          renderAll();
          return result;
        }
        collabBusy = false;
        collabBusyAction = "";
        return await handleCollabOpenTeam(activeChatId, { busyAction: "", preserveLocalRecords: true });
      }
      if (activeChatId && !activeAvailable) {
        collabState.team = null;
        collabState.chatId = "";
      }
      await saveCollabState();
      renderAll();
      return result;
    })();
    try {
      return await collabOverviewPromise;
    } catch (error) {
      trackEvent("teams_refresh_failed", { source }, {
        success: false,
        durationMs: performance.now() - startedAt,
        errorCode: error
      });
      if (!options.silent) {
        showToast(normalizeCollabError(error));
      }
      return null;
    } finally {
      collabBusy = false;
      collabBusyAction = "";
      collabOverviewPromise = null;
      renderCollabStatus();
    }
  }

  async function refreshCollabWorkspaceFromUi() {
    const previousChatId = activeTeamChatId();
    if (!previousChatId) {
      return await refreshCollabWorkspaceOverview({ silent: false, forceList: true });
    }
    const result = await refreshCollabWorkspaceOverview({
      silent: false,
      forceList: true,
      showSuccess: false,
      skipActiveOpen: true
    });
    if (!result) {
      return null;
    }
    if (!activeTeamChatId()) {
      showToast("群聊列表已刷新，原群聊当前不可用，请重新选择。");
      return result;
    }
    await syncCollabRoomFromUi({
      pendingOnly: true,
      busyAction: "workspace-refresh",
      pendingText: "正在刷新批注与群聊…",
      successMessage: "当前页面批注与群聊列表已刷新。"
    });
    return result;
  }

  async function openShareTeamConfirm(trigger = null) {
    const chatId = activeTeamChatId();
    if (!chatId) {
      showToast("请先选择要分享的群聊。");
      return;
    }
    if (!shareConfirmModal) {
      return;
    }
    const page = collabPagePayload();
    const teamSelect = root?.querySelector?.("[data-vfs-team-select]");
    const selectedTeamName = String(teamSelect?.querySelector?.("[data-vfs-team-select-label]")?.textContent || "").trim();
    const teamName = String(collabState?.team?.name || selectedTeamName || "当前群聊").trim();
    const pageTitle = String(page.title || document.title || "未命名页面").replace(/\s+/g, " ").trim();
    let pageHost = "";
    try {
      pageHost = new URL(page.url).host;
    } catch {
      pageHost = "";
    }
    shareConfirmModal.querySelector("[data-vfs-share-team-name]").textContent = teamName;
    renderTeamPickerAvatar(shareConfirmModal.querySelector("[data-vfs-share-team-avatar]"), collabState?.team || {});
    shareConfirmModal.querySelector("[data-vfs-share-page-title]").textContent = pageTitle;
    shareConfirmModal.querySelector("[data-vfs-share-page-url]").textContent = pageHost;
    if (shareNoteInput) {
      shareNoteInput.value = "";
    }
    resetMentionSelection("share");
    sharePagePreviewDataUrl = "";
    renderSharePagePreview("");
    shareConfirmReturnFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
    const captureId = ++sharePreviewCaptureId;
    sharePreviewCapturePromise = Promise.race([
      captureSharePagePreview(),
      delay(1800).then(() => "")
    ]).catch(() => "");
    const dataUrl = await sharePreviewCapturePromise;
    if (captureId !== sharePreviewCaptureId) {
      return;
    }
    sharePagePreviewDataUrl = dataUrl;
    renderSharePagePreview(dataUrl);
    shareConfirmModal.classList.add("is-visible");
    shareConfirmModal.setAttribute("aria-hidden", "false");
    shareConfirmModal.querySelector("[data-vfs-action='confirm-share-team-page']")?.focus?.({ preventScroll: true });
  }

  function renderSharePagePreview(dataUrl) {
    if (!shareConfirmModal) {
      return;
    }
    const media = shareConfirmModal.querySelector("[data-vfs-share-preview-media]");
    const image = shareConfirmModal.querySelector("[data-vfs-share-preview-image]");
    if (!media || !image) {
      return;
    }
    const source = String(dataUrl || "");
    media.classList.toggle("has-image", Boolean(source));
    media.classList.remove("is-loading");
    image.hidden = !source;
    if (source) {
      image.src = source;
    } else {
      image.removeAttribute("src");
    }
  }

  async function captureSharePagePreview() {
    root?.classList.add("vfs-capturing");
    markerLayer?.classList.add("vfs-capturing");
    focusBox?.classList.add("vfs-capturing");
    await delay(80);
    const imageSrc = await captureVisibleTabImage().catch(() => "");
    root?.classList.remove("vfs-capturing");
    markerLayer?.classList.remove("vfs-capturing");
    focusBox?.classList.remove("vfs-capturing");
    if (!imageSrc) {
      return "";
    }
    try {
      const image = await loadImage(imageSrc);
      const area = shotWorkspaceArea();
      const scaleX = image.naturalWidth / Math.max(1, window.innerWidth);
      const scaleY = image.naturalHeight / Math.max(1, window.innerHeight);
      const sourceWidth = Math.max(1, Math.round(area.width * scaleX));
      const sourceHeight = Math.max(1, Math.round(area.height * scaleY));
      const outputScale = Math.min(1, 960 / sourceWidth, 560 / sourceHeight);
      const outputWidth = Math.max(320, Math.round(sourceWidth * outputScale));
      const outputHeight = Math.max(180, Math.round(sourceHeight * outputScale));
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        return "";
      }
      context.drawImage(
        image,
        Math.round(area.x * scaleX),
        Math.round(area.y * scaleY),
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );
      const compact = await compactCollabPreview(canvas.toDataURL("image/jpeg", 0.78));
      return compact.dataUrl;
    } catch {
      return "";
    }
  }

  function closeShareTeamConfirm(options = {}) {
    if (!shareConfirmModal) {
      return;
    }
    const shouldRestoreFocus = options.restoreFocus !== false;
    shareConfirmModal.classList.remove("is-visible");
    shareConfirmModal.setAttribute("aria-hidden", "true");
    sharePreviewCaptureId += 1;
    if (shareNoteInput) {
      shareNoteInput.value = "";
    }
    resetMentionSelection("share");
    if (shouldRestoreFocus && shareConfirmReturnFocus?.isConnected) {
      shareConfirmReturnFocus.focus?.({ preventScroll: true });
    }
    shareConfirmReturnFocus = null;
  }

  function currentShareNoteDraft() {
    reconcileMentionSelectionFromInput("share");
    const note = String(shareNoteInput?.value || "").trim().slice(0, 600);
    const mentions = selectedMentions("share");
    return { note, mentions };
  }

  async function shareCurrentPageToTeam(shareDraft = {}) {
    const chatId = activeTeamChatId();
    if (!chatId) {
      showToast("请先选择要分享的群聊。");
      return null;
    }
    const startedAt = performance.now();
    collabBusy = true;
    collabBusyAction = "share";
    renderCollabStatus();
    try {
      await ensureCollabSession();
      const result = await collabRequest("share-team-page", {
        chatId,
        team: collabState?.team || null,
        ...(shareDraft.note ? { note: shareDraft.note } : {}),
        ...(Array.isArray(shareDraft.mentions) && shareDraft.mentions.length ? { mentions: shareDraft.mentions } : {}),
        page: {
          ...collabPagePayload(),
          previewImage: sharePagePreviewDataUrl
        }
      });
      trackEvent("page_shared", { source: "team_page" }, {
        success: true,
        durationMs: performance.now() - startedAt
      });
      showToast(result.mentionCount
        ? `已分享到${result.teamName || "当前群聊"}，并提醒 ${result.mentionCount} 位成员。`
        : `已分享到${result.teamName || "当前群聊"}，不会提醒群成员。`);
      return result;
    } catch (error) {
      trackEvent("page_shared", { source: "team_page" }, {
        success: false,
        durationMs: performance.now() - startedAt,
        errorCode: error
      });
      showToast(normalizeCollabError(error));
      return null;
    } finally {
      collabBusy = false;
      collabBusyAction = "";
      renderCollabStatus();
    }
  }

  async function ensureCollabSession() {
    await loadFeishuSession({ skipRefresh: true });
    if (!feishuSessionToken) {
      throw new Error("请先登录飞书。");
    }
    if (feishuSessionExpiresAt && feishuSessionExpiresAt <= Date.now()) {
      await clearFeishuSession();
      throw new Error("飞书登录已失效，请重新登录。");
    }
    if (!feishuSessionSavedAt || Date.now() - feishuSessionSavedAt >= SESSION_REFRESH_INTERVAL_MS) {
      await refreshFeishuSession({ silent: true });
    }
    if (!feishuSessionToken) {
      throw new Error("飞书登录已失效，请重新登录。");
    }
  }

  async function collabRequest(op, body = {}) {
    const response = await fetchWithClientTimeout(await getCollabApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${feishuSessionToken}`
      },
      body: JSON.stringify({ op, ...body })
    }, COLLAB_REQUEST_TIMEOUT_MS, "Team 批注请求超时，请重试。");
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      if (response.status === 401) {
        await clearFeishuSession();
      }
      throw new Error(result.error || "Team 批注同步失败。");
    }
    return result;
  }

  async function getCollabApiUrl() {
    const configured = await storageGet(COLLAB_API_URL_STORAGE_KEY);
    if (configured) {
      return configured;
    }
    try {
      const url = new URL(await getFeishuSyncUrl());
      url.searchParams.set("action", "collab");
      return url.toString();
    } catch {
      return FEISHU_COLLAB_DEFAULT_URL;
    }
  }

  function trackEvent(eventName, props = {}, options = {}) {
    if (!isTopFrame() || !ANALYTICS_EVENT_NAMES.has(eventName)) {
      return;
    }
    analyticsWork = analyticsWork
      .then(async () => {
        const event = await buildAnalyticsEvent(eventName, props, options);
        const saved = await storageGet(ANALYTICS_QUEUE_STORAGE_KEY);
        const queue = Array.isArray(saved) ? saved.filter((item) => item && typeof item === "object") : [];
        queue.push(event);
        await storageSet({
          [ANALYTICS_QUEUE_STORAGE_KEY]: queue.slice(-ANALYTICS_MAX_QUEUE_SIZE)
        });
        await flushAnalyticsQueue();
      })
      .catch(() => {});
  }

  async function buildAnalyticsEvent(eventName, props, options) {
    const installationId = await getAnalyticsInstallationId();
    const page = await analyticsPageDimensions();
    const chatId = activeTeamChatId();
    const workspaceSource = chatId ? `${chatId}|${collabTargetKey(currentPageIdentityKey())}` : "";
    return {
      schemaVersion: ANALYTICS_SCHEMA_VERSION,
      eventId: createId(),
      eventName,
      eventTime: new Date().toISOString(),
      appVersion: APP_VERSION,
      buildId: CONTENT_BUILD_ID,
      installationId,
      anonymousTeamId: chatId ? await hashAnalyticsValue(`team|${chatId}`) : "",
      workspaceKey: workspaceSource ? await hashAnalyticsValue(`workspace|${workspaceSource}`) : "",
      pageHost: page.host,
      pagePathHash: page.pathHash,
      props: sanitizeAnalyticsProps(props),
      ...(typeof options.success === "boolean" ? { success: options.success } : {}),
      ...(Number.isFinite(options.durationMs) ? { durationMs: Math.max(0, Math.round(options.durationMs)) } : {}),
      ...(options.errorCode ? { errorCode: analyticsErrorCode(options.errorCode) } : {})
    };
  }

  async function flushAnalyticsQueue() {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const saved = await storageGet(ANALYTICS_QUEUE_STORAGE_KEY);
      const queue = Array.isArray(saved) ? saved : [];
      if (!queue.length) {
        return;
      }
      const batch = queue.slice(0, 20);
      const headers = { "Content-Type": "application/json" };
      if (feishuSessionToken) {
        headers.Authorization = `Bearer ${feishuSessionToken}`;
      }
      let response;
      try {
        response = await fetch(await getAnalyticsApiUrl(), {
          method: "POST",
          headers,
          body: JSON.stringify({ events: batch }),
          keepalive: true
        });
      } catch {
        return;
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        return;
      }
      const remaining = queue.slice(batch.length);
      if (remaining.length) {
        await storageSet({ [ANALYTICS_QUEUE_STORAGE_KEY]: remaining });
      } else {
        await storageRemove(ANALYTICS_QUEUE_STORAGE_KEY);
        return;
      }
    }
  }

  async function getAnalyticsApiUrl() {
    try {
      const url = new URL(await getCollabApiUrl());
      url.searchParams.set("action", "track");
      return url.toString();
    } catch {
      return `${FEISHU_FASS_BASE_URL}?action=track`;
    }
  }

  async function getAnalyticsInstallationId() {
    const saved = String(await storageGet(ANALYTICS_INSTALLATION_STORAGE_KEY) || "").trim();
    if (/^[a-z0-9_-]{8,120}$/i.test(saved)) {
      return saved;
    }
    const installationId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : createId();
    await storageSet({ [ANALYTICS_INSTALLATION_STORAGE_KEY]: installationId });
    return installationId;
  }

  async function analyticsPageDimensions() {
    try {
      const url = new URL(currentPageUrl());
      return {
        host: url.host.toLowerCase(),
        pathHash: await hashAnalyticsValue(`${url.pathname || "/"}${url.hash && /^#\//.test(url.hash) ? url.hash : ""}`)
      };
    } catch {
      return { host: "", pathHash: "" };
    }
  }

  async function hashAnalyticsValue(value) {
    try {
      const bytes = new TextEncoder().encode(String(value || ""));
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 32);
    } catch {
      return "";
    }
  }

  function sanitizeAnalyticsProps(props) {
    if (!props || typeof props !== "object" || Array.isArray(props)) {
      return {};
    }
    return Object.fromEntries(Object.entries(props).flatMap(([key, value]) => {
      if (!ANALYTICS_PROP_KEYS.has(key)) {
        return [];
      }
      if (typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) {
        return [[key, value]];
      }
      if (typeof value === "string" && /^[a-z0-9._:-]{0,80}$/i.test(value)) {
        return [[key, value]];
      }
      return [];
    }));
  }

  function analyticsErrorCode(value) {
    if (typeof value === "string" && /^[a-z0-9._:-]{1,80}$/i.test(value)) {
      return value;
    }
    const message = String(value?.message || value || "");
    if (/登录|session|token|401|403/i.test(message)) {
      return "auth_failed";
    }
    if (/Failed to fetch|NetworkError|Load failed|abort/i.test(message)) {
      return "network_failed";
    }
    if (/permission|forbidden|权限/i.test(message)) {
      return "permission_failed";
    }
    return "unknown_failed";
  }

  function collabPagePayload() {
    const url = currentPageUrl();
    const frameUrl = primaryContentFrameUrl();
    return {
      title: pageContext.title || document.title || "未命名页面",
      url,
      targetUrl: url,
      targetKey: collabTargetKey(currentPageIdentityKey()),
      frameUrl: frameUrl || location.href,
      isTopFrame: isTopFrame()
    };
  }

  function collabTargetKey(value) {
    const normalized = normalizePageIdentityPart(value || currentPageIdentityKey());
    try {
      const url = new URL(normalized, location.href);
      if (url.hash && !/^#\//.test(url.hash)) {
        url.hash = "";
      }
      return url.href.replace(/\/$/, "");
    } catch {
      return normalized.split(/#(?!\/)/)[0].replace(/\/$/, "");
    }
  }

  async function collabRecordsForUpload(options = {}) {
    const openId = feishuOpenId(feishuUser);
    const avatarUrl = feishuUser?.avatarUrl || feishuUser?.avatar_url || "";
    const sourceRecords = records
      .filter((record) => record && (record.type === "dom" || record.type === "screenshot"))
      .filter((record) => activeTeamChatId() || !record.collab?.annotationId || record.collab?.authorOpenId === openId)
      .filter((record) => !options.pendingOnly ||
        !record.collab?.threadId ||
        record.collab?.pendingSync ||
        Boolean(avatarUrl && record.collab?.authorOpenId === openId && !record.collab?.authorAvatarUrl));
    return await Promise.all(sourceRecords.map((record) => sanitizeRecordForCollab(record)));
  }

  async function sanitizeRecordForCollab(record) {
    const next = clonePlainObject(record) || {};
    next.clientRecordId = record.id;
    next.author = record.author || displayFeishuUserName(feishuUser) || currentAuthor;
    const avatarUrl = feishuUser?.avatarUrl || feishuUser?.avatar_url || "";
    if (avatarUrl && (!next.collab?.authorOpenId || next.collab.authorOpenId === feishuOpenId(feishuUser))) {
      next.collab = {
        ...(next.collab || {}),
        authorAvatarUrl: avatarUrl
      };
    }
    if (next.collab && typeof next.collab === "object") {
      delete next.collab.pendingSync;
    }
    if (typeof next.previewImage === "string" && next.previewImage.length > COLLAB_INLINE_IMAGE_LIMIT) {
      const compactPreview = await compactCollabPreview(next.previewImage);
      next.previewImage = compactPreview.dataUrl;
      if (compactPreview.dataUrl) {
        delete next.previewImageOmitted;
        next.previewImageWidth = compactPreview.width;
        next.previewImageHeight = compactPreview.height;
        next.previewImageAspectRatio = roundNumber(compactPreview.width / Math.max(1, compactPreview.height), 4);
      } else {
        next.previewImageOmitted = true;
      }
    }
    return next;
  }

  async function compactCollabPreview(dataUrl) {
    const source = String(dataUrl || "");
    if (!source || source.length <= COLLAB_INLINE_IMAGE_LIMIT) {
      return { dataUrl: source, width: 0, height: 0 };
    }
    try {
      const image = await loadImage(source);
      const sourceWidth = image.naturalWidth || image.width || 0;
      const sourceHeight = image.naturalHeight || image.height || 0;
      if (!sourceWidth || !sourceHeight) {
        return { dataUrl: "", width: 0, height: 0 };
      }
      let scale = Math.min(1, 720 / sourceWidth, 480 / sourceHeight);
      let quality = 0.74;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const width = Math.max(160, Math.round(sourceWidth * scale));
        const height = Math.max(90, Math.round(sourceHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          break;
        }
        context.drawImage(image, 0, 0, width, height);
        const candidate = canvas.toDataURL("image/jpeg", quality);
        if (candidate.length <= COLLAB_INLINE_IMAGE_LIMIT) {
          return { dataUrl: candidate, width, height };
        }
        if (quality > 0.44) {
          quality -= 0.1;
        } else {
          scale *= 0.82;
        }
      }
    } catch {
      // The caller keeps the annotation but marks its room preview as omitted.
    }
    return { dataUrl: "", width: 0, height: 0 };
  }

  async function applyTeamResult(result, options = {}) {
    const previousChatId = activeTeamChatId();
    const nextTeam = result.team || {};
    const nextChatId = String(nextTeam.chatId || "").trim();
    const switchingTeams = Boolean(nextChatId && nextChatId !== previousChatId);
    const previousRecords = records;
    if (switchingTeams && previousChatId) {
      await persistRecords();
    }
    collabState = {
      ...(collabState || {}),
      team: nextTeam,
      chatId: nextChatId,
      page: result.page || null,
      members: Array.isArray(result.members) ? result.members : collabState?.members || [],
      targetUrl: result.page?.url || currentPageUrl(),
      targetKey: result.page?.pageKey || collabTargetKey(currentPageIdentityKey()),
      serverVersion: Number(result.serverVersion || 0),
      openCount: Number(result.openCount || 0),
      resolvedCount: Number(result.resolvedCount || 0),
      remoteCount: Number(result.threadCount || 0),
      lastPulledAt: new Date().toISOString(),
      statusText: result.warning || ""
    };
    if (switchingTeams) {
      const saved = await readRecordsForTeam(nextChatId);
      records = saved.length ? saved : options.preserveLocalRecords ? previousRecords : [];
      activeId = records[0]?.id || "";
      clearSelection();
      clearHover();
      closeRecordEditor();
      collabShowResolved = false;
    }
    mergeTeamRecords(Array.isArray(result.records) ? result.records : []);
    await rememberTeam(nextTeam);
    await saveCollabState();
    await persistRecords();
    broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
    renderAll();
    if (result.warning) {
      showToast(result.warning);
    }
    startMarkerTracking(1200);
  }

  function mergeTeamRecords(remoteRecords) {
    remoteRecords.forEach((remote) => {
      if (!remote || (remote.type !== "dom" && remote.type !== "screenshot")) {
        return;
      }
      const threadId = remote.collab?.threadId || remote.id;
      const index = records.findIndex((record) => (record.collab?.threadId || record.id) === threadId);
      const next = {
        ...remote,
        id: remote.id || threadId || createId(),
        collab: {
          ...(remote.collab || {}),
          mode: "team",
          chatId: activeTeamChatId(),
          pendingSync: false
        }
      };
      if (index >= 0) {
        const previous = records[index];
        if (shouldPreservePendingTeamRecord(previous, next)) {
          records[index] = {
            ...next,
            ...previous,
            previewImage: previous.previewImage || next.previewImage || "",
            collab: {
              ...(next.collab || {}),
              ...(previous.collab || {}),
              annotationId: next.collab?.annotationId || previous.collab?.annotationId || "",
              serverVersion: next.collab?.serverVersion || previous.collab?.serverVersion || 0,
              pendingSync: true
            }
          };
        } else {
          records[index] = {
            ...previous,
            ...next,
            previewImage: next.previewImage || previous.previewImage || "",
            collab: {
              ...(previous.collab || {}),
              ...(next.collab || {}),
              pendingSync: false
            }
          };
        }
      } else {
        records.push(next);
      }
    });
    records = records.filter((record) => record.collab?.status !== "deleted" || record.collab?.pendingSync);
    records.sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
    if (!activeId || !activeRecords().some((record) => record.id === activeId)) {
      activeId = activeRecords()[0]?.id || "";
    }
    updateCollabCountsFromRecords();
  }

  function teamDeletedThreadIds(sourceRecords) {
    return new Set((Array.isArray(sourceRecords) ? sourceRecords : [])
      .filter((record) => record?.collab?.status === "deleted")
      .map((record) => String(record.collab?.threadId || record.id || "").trim())
      .filter(Boolean));
  }

  async function pruneSyncedDeletedTeamRecords(threadIds) {
    if (!threadIds?.size) {
      return;
    }
    const beforeCount = records.length;
    records = records.filter((record) => {
      const threadId = String(record?.collab?.threadId || record?.id || "").trim();
      return !(threadIds.has(threadId) && record?.collab?.status === "deleted");
    });
    if (records.length === beforeCount) {
      return;
    }
    if (!activeRecords().some((record) => record.id === activeId)) {
      activeId = activeRecords()[0]?.id || "";
    }
    updateCollabCountsFromRecords();
    await persistRecords();
    broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
    renderAll();
  }

  function shouldPreservePendingTeamRecord(local, remote) {
    if (!local?.collab?.pendingSync) {
      return false;
    }
    const localMutationId = String(local.collab?.clientMutationId || "");
    const remoteMutationId = String(remote?.collab?.clientMutationId || "");
    if (localMutationId) {
      return localMutationId !== remoteMutationId;
    }
    if (String(local.collab?.status || "open") !== String(remote?.collab?.status || "open")) {
      return true;
    }
    const localUpdatedAt = String(local.updatedAt || local.collab?.statusUpdatedAt || "");
    const remoteUpdatedAt = String(remote?.updatedAt || remote?.collab?.statusUpdatedAt || "");
    return Boolean(localUpdatedAt && (!remoteUpdatedAt || remoteUpdatedAt < localUpdatedAt));
  }

  function updateCollabCountsFromRecords() {
    if (!collabState || !activeTeamChatId()) {
      return;
    }
    collabState.openCount = records.filter((record) => {
      const status = record.collab?.status || "open";
      return status !== "resolved" && status !== "deleted";
    }).length;
    collabState.resolvedCount = records.filter((record) => record.collab?.status === "resolved").length;
  }

  async function rememberTeam(team) {
    if (!team?.chatId) {
      return;
    }
    const recent = await storageGet(TEAM_RECENT_STORAGE_KEY);
    const nextRecent = [team, ...(Array.isArray(recent) ? recent : []).filter((item) => item?.chatId !== team.chatId)].slice(0, 5);
    await storageSet({
      [TEAM_ACTIVE_STORAGE_KEY]: team,
      [TEAM_RECENT_STORAGE_KEY]: nextRecent
    });
  }

  async function applyCollabResult(result, options = {}) {
    const room = result.round || result.room || {};
    const previousRoundId = activeCollabRoundId();
    const nextRoundId = String(room.roundId || room.roomId || result.roundId || result.roomId || previousRoundId || "").trim();
    const switchingRounds = Boolean(nextRoundId && nextRoundId !== previousRoundId);
    if (switchingRounds && previousRoundId) {
      await persistRecords();
    }
    const annotations = Array.isArray(result.annotations) ? result.annotations : [];
    const members = Array.isArray(result.members) ? result.members : Array.isArray(room.members) ? room.members : collabState?.members || [];
    collabState = {
      ...(collabState || {}),
      roomId: nextRoundId,
      roundId: nextRoundId,
      round: nextRoundId ? {
        ...room,
        roomId: nextRoundId,
        roundId: nextRoundId,
        roundName: room.roundName || room.title || "批注轮次"
      } : collabState?.round || null,
      workspace: result.workspace || collabState?.workspace || null,
      rounds: Array.isArray(result.rounds) ? result.rounds : collabState?.rounds || [],
      targetUrl: room.targetUrl || room.pageUrl || result.targetUrl || currentPageUrl(),
      targetKey: room.targetKey || collabTargetKey(room.targetUrl || currentPageUrl()),
      serverVersion: Number(room.serverVersion || result.serverVersion || collabState?.serverVersion || 0),
      remoteCount: Number(result.annotationCount || annotations.length || collabState?.remoteCount || 0),
      memberCount: Number(result.memberCount || members.length || collabState?.memberCount || 0),
      members,
      lastPulledAt: new Date().toISOString(),
      shareUrl: room.shareUrl || result.shareUrl || "",
      shareText: room.shareText || result.shareText || "",
      statusText: result.warning || ""
    };
    if (switchingRounds && !options.preserveLocalRecords) {
      records = await readRecordsForRound(nextRoundId, { allowLegacyMigration: false });
      activeId = records[0]?.id || "";
      clearSelection();
      clearHover();
      closeRecordEditor();
    }
    mergeCollabAnnotations(annotations);
    await saveCollabState();
    await persistRecords();
    broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
    renderAll();
    startMarkerTracking(1200);
  }

  function mergeCollabAnnotations(annotations) {
    if (!annotations.length) {
      return;
    }
    annotations.forEach((annotation) => {
      const remote = collabAnnotationToRecord(annotation);
      if (!remote) {
        return;
      }
      const index = records.findIndex((record) => (
        record.collab?.annotationId === remote.collab.annotationId ||
        record.id === remote.id
      ));
      if (index >= 0) {
        const previous = records[index];
        records[index] = {
          ...previous,
          ...remote,
          previewImage: remote.previewImage || previous.previewImage || "",
          collab: {
            ...(previous.collab || {}),
            ...(remote.collab || {}),
            pendingSync: false
          }
        };
      } else {
        remote.collab.pendingSync = false;
        records.push(remote);
      }
    });
    records.sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
    if (!activeId) {
      activeId = records[0]?.id || "";
    }
  }

  function collabAnnotationToRecord(annotation) {
    const payload = annotation.payload && typeof annotation.payload === "object"
      ? annotation.payload
      : safeJsonParse(annotation.payloadJson) || {};
    const record = payload.record || payload;
    if (!record || (record.type !== "dom" && record.type !== "screenshot")) {
      return null;
    }
    const annotationId = annotation.annotationId || record.collab?.annotationId || record.id || createId();
    return {
      ...record,
      id: record.id || annotation.clientRecordId || annotationId,
      author: annotation.authorName || record.author || "协作者",
      text: String(annotation.text || record.text || ""),
      createdAt: annotation.createdAt || record.createdAt || new Date().toISOString(),
      updatedAt: annotation.updatedAt || record.updatedAt || annotation.createdAt || new Date().toISOString(),
      url: record.url || collabState?.targetUrl || currentPageUrl(),
      collab: {
        ...(record.collab || {}),
        roomId: annotation.roomId || activeCollabRoundId() || "",
        roundId: annotation.roomId || activeCollabRoundId() || "",
        annotationId,
        authorOpenId: annotation.authorOpenId || "",
        authorName: annotation.authorName || record.author || "协作者",
        serverVersion: Number(annotation.serverVersion || 0),
        syncedAt: annotation.updatedAt || annotation.createdAt || new Date().toISOString()
      }
    };
  }

  async function copyRoomInvite(options = {}) {
    const state = options.collab || collabState || {};
    const roundId = String(state.roundId || state.roomId || "").trim();
    if (!roundId) {
      if (!options.silent) {
        showToast("尚未选择批注轮次。");
      }
      return false;
    }
    try {
      await copyTextToClipboard(roomInviteText(state));
      if (!options.silent) {
        showToast("轮次 ID 已复制。");
      }
      return true;
    } catch {
      if (!options.silent) {
        showToast("复制失败，请手动复制轮次 ID。");
      }
      return false;
    }
  }

  function roomInviteText(state) {
    if (state.shareText) {
      return state.shareText;
    }
    const roundId = String(state.roundId || state.roomId || "").trim();
    return [
      `飞标批注轮次：${state.round?.roundName || state.round?.title || roundId}`,
      `轮次 ID：${roundId}`,
      state.targetUrl ? `页面：${state.targetUrl}` : "",
      state.workspace?.chatUrl ? `群聊：${state.workspace.chatUrl}` : "",
      state.workspace?.baseUrl ? `批注数据：${state.workspace.baseUrl}` : "",
      "在飞标中使用自己的飞书账号登录后，粘贴轮次 ID 即可查看。"
    ].filter(Boolean).join("\n");
  }

  async function ensureSyncServiceAvailable() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5200);
    try {
      const response = await fetch(FEISHU_HEALTH_URL, {
        method: "GET",
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error("飞书同步服务暂不可用。");
      }
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadFeishuSession(options = {}) {
    const saved = await storageGet(FEISHU_SESSION_STORAGE_KEY);
    feishuSessionToken = saved?.token || "";
    feishuUser = saved?.user || null;
    feishuSessionExpiresAt = Number(saved?.expiresAt || 0);
    feishuSessionSavedAt = Number(saved?.savedAt || 0);
    renderCollabStatus();
    if (!options.skipRefresh) {
      await refreshFeishuSession({ silent: true });
    }
  }

  async function refreshFeishuSession(options = {}) {
    if (!feishuSessionToken) {
      renderCollabStatus();
      return false;
    }
    try {
      const response = await fetchWithClientTimeout(await getFeishuMeUrl(), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${feishuSessionToken}`
        }
      }, SESSION_REFRESH_TIMEOUT_MS, "飞书登录状态检查超时。");
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "飞书登录已失效。");
      }
      await saveFeishuSession(result.sessionToken || feishuSessionToken, result.user || feishuUser, result.expiresAt);
      return true;
    } catch (error) {
      if (isNetworkUnavailableError(error)) {
        renderCollabStatus();
        return false;
      }
      await clearFeishuSession();
      if (!options.silent) {
        showToast(error.message || "飞书登录状态检查失败。");
      }
      return false;
    }
  }

  async function getFeishuSyncUrl() {
    return await storageGet(FEISHU_SYNC_URL_STORAGE_KEY) || FEISHU_SYNC_DEFAULT_URL;
  }

  async function getFeishuMeUrl() {
    const syncUrl = await getFeishuSyncUrl();
    try {
      const url = new URL(syncUrl);
      url.searchParams.set("action", "me");
      return url.toString();
    } catch {
      return `${FEISHU_FASS_BASE_URL}?action=me`;
    }
  }

  async function saveFeishuSession(token, user, expiresAt = 0) {
    feishuSessionToken = token || "";
    feishuUser = user || null;
    feishuSessionExpiresAt = Number(expiresAt) || 0;
    feishuSessionSavedAt = Date.now();
    if (feishuUser) {
      currentAuthor = normalizeAuthor(displayFeishuUserName(feishuUser));
      await storageSet({ [AUTHOR_STORAGE_KEY]: currentAuthor });
    }
    await storageSet({
      [FEISHU_SESSION_STORAGE_KEY]: {
        token: feishuSessionToken,
        user: feishuUser,
        expiresAt: feishuSessionExpiresAt || null,
        savedAt: feishuSessionSavedAt,
        source: "magic"
      }
    });
    clearFeishuPending();
    renderCollabStatus();
  }

  async function clearFeishuSession() {
    feishuSessionToken = "";
    feishuUser = null;
    feishuSessionExpiresAt = 0;
    feishuSessionSavedAt = 0;
    await storageRemove(FEISHU_SESSION_STORAGE_KEY);
    renderCollabStatus();
  }

  async function logoutFeishuAccount() {
    setAccountMenuOpen(false);
    await clearFeishuSession();
    currentAuthor = DEFAULT_AUTHOR;
    await storageSet({ [AUTHOR_STORAGE_KEY]: currentAuthor });
    showToast("已退出飞书。");
  }

  function setAccountMenuOpen(open) {
    const menu = root?.querySelector(".vfs-account-menu");
    if (menu) {
      menu.hidden = !open;
    }
  }

  function toggleAccountMenu() {
    if (!feishuSessionToken || !feishuUser || feishuBusy) {
      return;
    }
    const menu = root?.querySelector(".vfs-account-menu");
    if (menu) {
      menu.hidden = !menu.hidden;
    }
  }

  function displayFeishuUser(user) {
    return user?.name || user?.openId || user?.open_id || "已登录";
  }

  function displayFeishuUserName(user) {
    return String(displayFeishuUser(user)).split(/[·|｜]/)[0].trim() || "已登录";
  }

  function setFeishuPending(text) {
    feishuPendingText = text;
    renderCollabStatus();
  }

  function clearFeishuPending() {
    feishuPendingText = "";
    renderCollabStatus();
  }

  function feishuOpenId(user) {
    return user?.openId || user?.open_id || "";
  }

  function normalizeCollabMembers(state) {
    const raw = Array.isArray(state?.members) ? state.members : [];
    const seen = new Set();
    const avatarByOpenId = new Map(records
      .map((record) => [record?.collab?.authorOpenId, record?.collab?.authorAvatarUrl])
      .filter(([openId, avatarUrl]) => openId && avatarUrl));
    const currentOpenId = feishuOpenId(feishuUser);
    const currentAvatarUrl = feishuUser?.avatarUrl || feishuUser?.avatar_url || "";
    return raw
      .map((member) => {
        const openId = String(member.openId || member.open_id || "").trim();
        return {
          openId,
          name: String(member.name || member.userName || member.openId || "协作者").trim() || "协作者",
          avatarUrl: member.avatarUrl || member.avatar_url || (openId === currentOpenId ? currentAvatarUrl : avatarByOpenId.get(openId)) || "",
          role: String(member.role || "member").toLowerCase() === "owner" ? "owner" : "member",
          joinedAt: member.joinedAt || "",
          lastSeenAt: member.lastSeenAt || ""
        };
      })
      .filter((member) => {
        const key = member.openId || member.name;
        if (!key || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  function teamMentionCandidates() {
    return normalizeCollabMembers(collabState).filter((member) => member.openId);
  }

  function memberAvatarUrl(openId, fallback = "") {
    const normalizedOpenId = String(openId || "").trim();
    if (fallback) {
      return fallback;
    }
    if (!normalizedOpenId) {
      return "";
    }
    if (normalizedOpenId === feishuOpenId(feishuUser)) {
      return feishuUser?.avatarUrl || feishuUser?.avatar_url || "";
    }
    const member = normalizeCollabMembers(collabState).find((candidate) => candidate.openId === normalizedOpenId);
    return member?.avatarUrl || "";
  }

  function bindMentionEditor(editor, scope) {
    if (!editor || !mentionSelections[scope]) {
      return;
    }
    Object.defineProperty(editor, "value", {
      configurable: true,
      get() {
        return mentionEditorText(editor);
      },
      set(value) {
        editor.replaceChildren();
        const text = String(value || "");
        if (text) {
          editor.append(document.createTextNode(text));
        }
        updateMentionEditorEmptyState(editor);
      }
    });
    updateMentionEditorEmptyState(editor);
    editor.addEventListener("input", () => handleMentionEditorInput(scope));
    editor.addEventListener("paste", (event) => {
      const text = event.clipboardData?.getData?.("text/plain") || "";
      if (!text) {
        return;
      }
      event.preventDefault();
      document.execCommand("insertText", false, text);
    });
  }

  function mentionEditorText(editor) {
    if (!editor) {
      return "";
    }
    const text = typeof editor.innerText === "string" ? editor.innerText : editor.textContent || "";
    return String(text).replace(/\u00a0/g, " ").replace(/\r\n?/g, "\n");
  }

  function updateMentionEditorEmptyState(editor) {
    if (editor) {
      editor.dataset.empty = String(!mentionEditorText(editor).trim());
    }
  }

  function handleMentionEditorInput(scope) {
    const editor = mentionInputForScope(scope);
    updateMentionEditorEmptyState(editor);
    reconcileMentionSelectionFromInput(scope);
    const query = mentionQueryAtCaret(editor);
    if (query && activeTeamChatId() && teamMentionCandidates().length && (scope !== "reply" || editingRecordMode === "reply")) {
      if (mentionQueries[scope] !== query.text) {
        mentionActiveIndexes[scope] = 0;
      }
      mentionQueries[scope] = query.text;
      openMentionScope = scope;
    } else if (openMentionScope === scope && mentionQueries[scope]) {
      openMentionScope = "";
      mentionQueries[scope] = "";
    }
    renderMentionPickers();
  }

  function mentionQueryAtCaret(editor) {
    const selection = window.getSelection?.();
    if (!editor || !selection?.rangeCount) {
      return null;
    }
    const range = selection.getRangeAt(0);
    if (!range.collapsed || !editor.contains(range.startContainer)) {
      return null;
    }
    let node = range.startContainer;
    let offset = range.startOffset;
    if (node === editor && offset > 0) {
      const previous = editor.childNodes[offset - 1];
      if (previous?.nodeType === Node.TEXT_NODE) {
        node = previous;
        offset = previous.textContent?.length || 0;
      }
    }
    if (node?.nodeType !== Node.TEXT_NODE) {
      return null;
    }
    const prefix = String(node.textContent || "").slice(0, offset);
    const match = prefix.match(/(?:^|[\s（(])@([^\s@]{0,24})$/);
    if (!match) {
      return null;
    }
    return {
      text: match[1] || "",
      node,
      start: offset - (match[1]?.length || 0) - 1,
      end: offset
    };
  }

  function filteredMentionCandidates(scope) {
    const query = normalizeMentionSearchText(mentionQueries[scope]);
    const members = teamMentionCandidates();
    if (!query) {
      return members;
    }
    return members.filter((member) => normalizeMentionSearchText(member.name).includes(query));
  }

  function normalizeMentionSearchText(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(/^@+/, "")
      .replace(/\s+/g, "")
      .toLocaleLowerCase("zh-CN");
  }

  function handleMentionSuggestionKeyDown(event, scope) {
    if (openMentionScope !== scope) {
      return false;
    }
    const members = filteredMentionCandidates(scope);
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      openMentionScope = "";
      mentionQueries[scope] = "";
      renderMentionPickers();
      return true;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      if (members.length) {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        mentionActiveIndexes[scope] = (mentionActiveIndexes[scope] + direction + members.length) % members.length;
        renderMentionPickers();
      }
      return true;
    }
    if (isEnterKey(event) && members.length) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      const member = members[Math.min(mentionActiveIndexes[scope], members.length - 1)];
      mentionSelections[scope].set(member.openId, member);
      insertMentionIntoInput(scope, member);
      renderMentionPickers();
      return true;
    }
    return false;
  }

  function toggleMentionPicker(scope) {
    if (!mentionSelections[scope]) {
      return;
    }
    openMentionScope = openMentionScope === scope ? "" : scope;
    mentionQueries[scope] = "";
    mentionActiveIndexes[scope] = 0;
    const input = mentionInputForScope(scope);
    input?.focus?.({ preventScroll: true });
    const selection = window.getSelection?.();
    if (input && (!selection?.anchorNode || !input.contains(selection.anchorNode))) {
      placeCaretAtEnd(input);
    }
    renderMentionPickers();
  }

  function toggleMentionMember(scope, openId) {
    const selection = mentionSelections[scope];
    const member = teamMentionCandidates().find((item) => item.openId === openId);
    if (!selection || !member) {
      return;
    }
    const hasQuery = Boolean(mentionQueryAtCaret(mentionInputForScope(scope)));
    if (selection.has(openId) && !hasQuery) {
      selection.delete(openId);
      removeMentionFromInput(scope, member);
    } else {
      selection.set(openId, member);
      insertMentionIntoInput(scope, member);
    }
    renderMentionPickers();
  }

  function mentionInputForScope(scope) {
    if (scope === "dom") {
      return commentInput;
    }
    if (scope === "shot") {
      return shotCommentInput;
    }
    if (scope === "reply") {
      return editInput;
    }
    return scope === "share" ? shareNoteInput : null;
  }

  function mentionToken(member) {
    const name = String(member?.name || "").trim();
    return name ? `@${name}` : "";
  }

  function insertMentionIntoInput(scope, member) {
    const input = mentionInputForScope(scope);
    const token = mentionToken(member);
    if (!input || !token) {
      return;
    }
    input.focus({ preventScroll: true });
    const existing = Array.from(input.querySelectorAll("[data-vfs-mention-token]"))
      .find((item) => item.dataset.openId === member.openId);
    const query = mentionQueryAtCaret(input);
    const selection = window.getSelection?.();
    let range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (!range || !input.contains(range.startContainer)) {
      range = document.createRange();
      range.selectNodeContents(input);
      range.collapse(false);
    }
    if (query) {
      range.setStart(query.node, query.start);
      range.setEnd(query.node, query.end);
      range.deleteContents();
    }
    if (!existing) {
      const mention = document.createElement("span");
      mention.className = "vfs-mention-token";
      mention.contentEditable = "false";
      mention.dataset.vfsMentionToken = "";
      mention.dataset.openId = member.openId;
      mention.textContent = token;
      const spacer = document.createTextNode(" ");
      range.insertNode(mention);
      mention.after(spacer);
      range.setStartAfter(spacer);
      range.collapse(true);
      selection?.removeAllRanges?.();
      selection?.addRange?.(range);
    }
    openMentionScope = "";
    mentionQueries[scope] = "";
    mentionActiveIndexes[scope] = 0;
    updateMentionEditorEmptyState(input);
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: token }));
  }

  function removeMentionFromInput(scope, member) {
    const input = mentionInputForScope(scope);
    if (!input) {
      return;
    }
    const mention = Array.from(input.querySelectorAll("[data-vfs-mention-token]"))
      .find((item) => item.dataset.openId === member.openId);
    if (!mention) {
      return;
    }
    const next = mention.nextSibling;
    if (next?.nodeType === Node.TEXT_NODE && String(next.textContent || "").startsWith(" ")) {
      next.textContent = String(next.textContent || "").slice(1);
      if (!next.textContent) {
        next.remove();
      }
    }
    mention.remove();
    input.focus();
    placeCaretAtEnd(input);
    updateMentionEditorEmptyState(input);
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward", data: null }));
  }

  function reconcileMentionSelectionFromInput(scope) {
    const input = mentionInputForScope(scope);
    const selection = mentionSelections[scope];
    if (!input || !selection) {
      return;
    }
    const tokenIds = new Set(Array.from(input.querySelectorAll("[data-vfs-mention-token]"))
      .map((item) => item.dataset.openId)
      .filter(Boolean));
    let changed = false;
    selection.forEach((_member, openId) => {
      if (!tokenIds.has(openId)) {
        selection.delete(openId);
        changed = true;
      }
    });
    if (changed) {
      renderMentionPickers();
    }
  }

  function stripMentionTokens(value, mentions) {
    let text = String(value || "");
    (Array.isArray(mentions) ? mentions : []).forEach((member) => {
      const token = mentionToken(member);
      if (!token) {
        return;
      }
      let index = text.indexOf(token);
      while (index >= 0) {
        const tokenEnd = index + token.length;
        const end = text[tokenEnd] === " " ? tokenEnd + 1 : tokenEnd;
        text = `${text.slice(0, index)}${text.slice(end)}`;
        index = text.indexOf(token);
      }
    });
    return text;
  }

  function selectedMentions(scope) {
    return Array.from(mentionSelections[scope]?.values?.() || []).map((member) => ({
      openId: member.openId,
      name: member.name
    }));
  }

  function resetMentionSelection(scope) {
    mentionSelections[scope]?.clear?.();
    mentionQueries[scope] = "";
    mentionActiveIndexes[scope] = 0;
    if (openMentionScope === scope) {
      openMentionScope = "";
    }
    renderMentionPickers();
  }

  function renderMentionPickers() {
    if (!root) {
      return;
    }
    const members = teamMentionCandidates();
    root.querySelectorAll("[data-vfs-mention-scope]").forEach((picker) => {
      if (!picker.classList.contains("vfs-mention-picker")) {
        return;
      }
      const scope = picker.dataset.vfsMentionScope;
      const available = Boolean(activeTeamChatId() && members.length && (scope !== "reply" || editingRecordMode === "reply"));
      picker.hidden = !available;
      const trigger = picker.querySelector(".vfs-mention-trigger");
      const menu = picker.querySelector(".vfs-mention-menu");
      if (!trigger || !menu) {
        return;
      }
      const selected = selectedMentions(scope);
      trigger.textContent = "@";
      trigger.classList.toggle("has-selection", selected.length > 0);
      trigger.setAttribute("aria-label", selected.length
        ? `已提醒 ${selected.map((member) => member.name).join("、")}，继续选择成员`
        : "选择要提醒的群成员");
      trigger.setAttribute("aria-expanded", String(available && openMentionScope === scope));
      menu.hidden = !available || openMentionScope !== scope;
      if (menu.hidden) {
        return;
      }
      const filteredMembers = filteredMentionCandidates(scope);
      mentionActiveIndexes[scope] = Math.min(mentionActiveIndexes[scope], Math.max(0, filteredMembers.length - 1));
      if (!filteredMembers.length) {
        const empty = document.createElement("div");
        empty.className = "vfs-mention-empty";
        empty.textContent = "没有匹配的群成员";
        menu.replaceChildren(empty);
        return;
      }
      menu.replaceChildren(...filteredMembers.map((member, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.vfsAction = "toggle-mention-member";
        button.dataset.vfsMentionScope = scope;
        button.dataset.openId = member.openId;
        button.classList.toggle("is-selected", mentionSelections[scope].has(member.openId));
        button.classList.toggle("is-active", index === mentionActiveIndexes[scope]);
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", String(mentionSelections[scope].has(member.openId)));
        const avatar = document.createElement("span");
        avatar.className = "vfs-mention-avatar";
        if (member.avatarUrl) {
          const image = document.createElement("img");
          image.src = member.avatarUrl;
          image.alt = "";
          image.addEventListener("error", () => {
            image.remove();
            avatar.textContent = initials(member.name);
          }, { once: true });
          avatar.append(image);
        } else {
          avatar.textContent = initials(member.name);
        }
        const name = document.createElement("span");
        name.textContent = member.name;
        button.append(avatar, name);
        return button;
      }));
    });
  }

  function placeCaretAtEnd(editor) {
    const selection = window.getSelection?.();
    if (!editor || !selection) {
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function selectMentionEditorContents(editor) {
    const selection = window.getSelection?.();
    if (!editor || !selection) {
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function displayTextWithMentions(value, mentions) {
    const text = String(value || "").trim();
    const prefix = (Array.isArray(mentions) ? mentions : [])
      .map(mentionToken)
      .filter((token) => token && !text.includes(token))
      .join(" ");
    return [prefix, text].filter(Boolean).join(" ");
  }

  function renderTextWithMentions(container, value, mentions) {
    const text = displayTextWithMentions(value, mentions);
    const tokenByText = new Map((Array.isArray(mentions) ? mentions : [])
      .map((member) => [mentionToken(member), member])
      .filter(([token]) => token));
    if (!tokenByText.size) {
      container.textContent = text;
      return;
    }
    const tokens = [...tokenByText.keys()].sort((left, right) => right.length - left.length);
    let cursor = 0;
    while (cursor < text.length) {
      let nextIndex = -1;
      let nextToken = "";
      for (const token of tokens) {
        const index = text.indexOf(token, cursor);
        if (index >= 0 && (nextIndex < 0 || index < nextIndex)) {
          nextIndex = index;
          nextToken = token;
        }
      }
      if (nextIndex < 0) {
        container.append(document.createTextNode(text.slice(cursor)));
        break;
      }
      if (nextIndex > cursor) {
        container.append(document.createTextNode(text.slice(cursor, nextIndex)));
      }
      const mention = document.createElement("span");
      mention.className = "vfs-inline-mention";
      mention.textContent = nextToken;
      mention.title = `提及 ${tokenByText.get(nextToken)?.name || nextToken.slice(1)}`;
      container.append(mention);
      cursor = nextIndex + nextToken.length;
    }
  }

  function commentAvatarNode(name, avatarUrl = "") {
    const avatar = document.createElement("span");
    avatar.className = "vfs-comment-avatar";
    avatar.style.setProperty("--vfs-member-color", memberColor({ name }));
    if (avatarUrl) {
      const image = document.createElement("img");
      image.src = avatarUrl;
      image.alt = "";
      image.addEventListener("error", () => {
        image.remove();
        avatar.textContent = initials(name);
      }, { once: true });
      avatar.append(image);
    } else {
      avatar.textContent = initials(name);
    }
    return avatar;
  }

  function memberColor(member) {
    return stableMemberColor(String(member?.openId || member?.name || "协作者"));
  }

  function stableMemberColor(seed) {
    const text = String(seed || "我");
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 72% 54%)`;
  }

  function initials(value) {
    const text = String(value || "协").trim();
    if (!text) {
      return "协";
    }
    return Array.from(text.replace(/\s+/g, "")).slice(0, 2).join("").toUpperCase();
  }

  function safeJsonParse(value) {
    if (!value || typeof value !== "string") {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function scheduleCollabPoll() {
    clearTimeout(collabPollTimer);
    if (!isTopFrame() || !activeTeamChatId() || collabBusy || collabBackgroundBusy || document.visibilityState !== "visible") {
      return;
    }
    collabPollTimer = setTimeout(() => {
      pullCollabRoomFromUi({ background: true }).catch(() => {});
    }, 12000);
  }

  function markRecordPendingCollabSync(record) {
    const chatId = activeTeamChatId();
    if (!record || !chatId) {
      return;
    }
    record.collab = {
      ...(record.collab || {}),
      mode: "team",
      teamId: collabState?.team?.teamId || "",
      chatId,
      pageId: collabState?.page?.pageId || "",
      pageKey: collabState?.page?.pageKey || collabTargetKey(currentPageIdentityKey()),
      threadId: record.collab?.threadId || record.id,
      status: record.collab?.status || "open",
      statusUpdatedAt: record.collab?.statusUpdatedAt || record.updatedAt || new Date().toISOString(),
      authorOpenId: record.collab?.authorOpenId || feishuOpenId(feishuUser),
      authorName: record.collab?.authorName || displayFeishuUserName(feishuUser),
      authorAvatarUrl: record.collab?.authorAvatarUrl || feishuUser?.avatarUrl || feishuUser?.avatar_url || "",
      clientMutationId: createId(),
      pendingSync: true
    };
  }

  function markRecordDeletedForTeam(record, deletedAt = new Date().toISOString()) {
    if (!record) {
      return;
    }
    record.updatedAt = deletedAt;
    record.collab = {
      ...(record.collab || {}),
      status: "deleted",
      statusUpdatedAt: deletedAt
    };
    markRecordPendingCollabSync(record);
  }

  function scheduleCollabSync(delay = 320) {
    clearTimeout(collabSyncTimer);
    if (!isTopFrame() || !activeTeamChatId()) {
      return;
    }
    collabSyncTimer = setTimeout(() => {
      collabSyncTimer = null;
      if (collabBusy || collabBackgroundBusy) {
        scheduleCollabSync(600);
        return;
      }
      void syncCollabRoomFromUi({ background: true, pendingOnly: true });
    }, delay);
  }

  function normalizeCollabError(error) {
    const message = error?.message || String(error || "");
    if (/未知协同操作[：:]?\s*(?:list-teams|open-team-page|sync-team-page)/i.test(message)) {
      return "当前协同服务仍是旧版本，请先发布飞标 1.4.12 Team 协同服务。";
    }
    if (/群聊|Team|批注库/.test(message)) {
      return message;
    }
    if (/登录|session|token|401|403/i.test(message)) {
      return "请先登录飞书。";
    }
    if (/Room|room/.test(message)) {
      return message;
    }
    if (isNetworkUnavailableError(error)) {
      return "暂时无法连接协同服务，请稍后重试。";
    }
    return message || "Team 批注操作失败。";
  }

  function normalizeFeishuLoginError(error) {
    if (isNetworkUnavailableError(error)) {
      return "暂时无法打开飞书登录，请检查网络后重试。";
    }
    return error?.message || "飞书登录启动失败。";
  }

  function isNetworkUnavailableError(error) {
    const message = String(error?.message || error || "");
    return error?.name === "AbortError" || /Failed to fetch|NetworkError|Load failed|abort|timeout|超时/i.test(message);
  }

  async function openUrlInNewTab(url, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({
          source: CONTENT_SOURCE,
          type: "VFS_OPEN_URL",
          url,
          returnToOpener: Boolean(options.returnToOpener)
        }, (response) => {
          if (chrome.runtime.lastError || !response?.ok) {
            const opened = window.open(url, "_blank", "noopener");
            if (opened) {
              resolve();
              return;
            }
            reject(new Error(response?.error || chrome.runtime.lastError?.message || "无法打开新标签页。"));
            return;
          }
          resolve();
        });
      } catch (error) {
        const opened = window.open(url, "_blank", "noopener");
        opened ? resolve() : reject(error);
      }
    });
  }

  async function consumePendingDeepLink() {
    if (!isTopFrame() || pendingDeepLink || openingDeepLink) {
      return;
    }
    try {
      const response = await chrome.runtime.sendMessage({
        source: CONTENT_SOURCE,
        type: "VFS_CONSUME_DEEP_LINK"
      });
      if (!response?.ok || !response.deepLink) {
        return;
      }
      pendingDeepLink = response.deepLink;
      await openPendingDeepLink();
    } catch {
      // The background worker may still be starting; a later session change retries.
    }
  }

  async function openPendingDeepLink() {
    if (!isTopFrame() || !pendingDeepLink || openingDeepLink) {
      return;
    }
    const deepLink = pendingDeepLink;
    if (!feishuSessionToken) {
      await setMode("read", { silent: true });
      setSidebarVisibility(true);
      showToast("登录飞书后会自动定位这条批注。");
      return;
    }
    openingDeepLink = true;
    try {
      await setMode("read", { silent: true });
      setSidebarVisibility(true);
      await handleCollabOpenTeam(deepLink.chatId, {
        busyAction: "refresh",
        preserveLocalRecords: false
      });
      if (!deepLink.threadId) {
        await chrome.runtime.sendMessage({
          source: CONTENT_SOURCE,
          type: "VFS_DEEP_LINK_CONSUMED",
          threadId: ""
        });
        pendingDeepLink = null;
        trackEvent("deep_link_opened", { source: "page_share" }, { success: true });
        showToast("已打开页面并同步当前群聊的全部批注。");
        return;
      }
      const record = records.find((item) => (item.collab?.threadId || item.id) === deepLink.threadId);
      if (!record) {
        showToast("已打开对应 Team，但这条批注暂未同步到当前页面。");
        return;
      }
      deepLinkHighlightThreadId = deepLink.threadId;
      clearTimeout(deepLinkHighlightTimer);
      focusRecord(record.id);
      deepLinkHighlightTimer = setTimeout(() => {
        deepLinkHighlightThreadId = "";
        renderThreads();
      }, 3200);
      await chrome.runtime.sendMessage({
        source: CONTENT_SOURCE,
        type: "VFS_DEEP_LINK_CONSUMED",
        threadId: deepLink.threadId
      });
      pendingDeepLink = null;
      trackEvent("deep_link_opened", { source: "feishu_notification" }, { success: true });
      showToast("已定位到被提醒的批注。");
    } catch (error) {
      showToast(normalizeCollabError(error));
    } finally {
      openingDeepLink = false;
    }
  }

  function handleStorageChange(changes, areaName) {
    if (areaName !== "local") {
      return;
    }
    if (changes?.[FEISHU_SESSION_STORAGE_KEY]) {
      const previousOpenId = feishuOpenId(feishuUser);
      const saved = changes[FEISHU_SESSION_STORAGE_KEY].newValue || {};
      feishuSessionToken = saved.token || "";
      feishuUser = saved.user || null;
      feishuSessionExpiresAt = Number(saved.expiresAt || 0);
      feishuSessionSavedAt = Number(saved.savedAt || 0);
      clearFeishuPending();
      renderAll();
      if (feishuSessionToken && feishuOpenId(feishuUser) !== previousOpenId) {
        trackEvent("feishu_login_succeeded", { source: "oauth" }, { success: true });
        void refreshCollabWorkspaceOverview({ silent: true });
      }
      if (feishuSessionToken && pendingDeepLink) {
        void openPendingDeepLink();
      } else if (feishuSessionToken) {
        void consumePendingDeepLink();
      }
    }
    if (changes?.[collabStorageKey()]) {
      collabState = changes[collabStorageKey()].newValue || null;
      renderAll();
    }
    if (changes?.[REOPEN_HIDDEN_STORAGE_KEY]) {
      reopenHidden = Boolean(changes[REOPEN_HIDDEN_STORAGE_KEY].newValue);
      renderChrome();
    }
    if (changes?.[MARKERS_HIDDEN_STORAGE_KEY]) {
      markersHidden = Boolean(changes[MARKERS_HIDDEN_STORAGE_KEY].newValue);
      renderAll();
    }
  }

  function roundNumber(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  async function copyTextToClipboard(text) {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.style.position = "fixed";
      field.style.left = "-9999px";
      field.style.top = "0";
      document.documentElement.append(field);
      field.focus();
      field.select();
      document.execCommand("copy");
      field.remove();
    }
  }

  async function copyMarkdownToClipboard() {
    const markdown = exportMarkdown();
    if (!markdown) {
      showToast("暂无可复制的批注。");
      return;
    }
    await copyTextToClipboard(markdown);
    showToast("Markdown 已复制。");
  }

  function downloadJsonPackage() {
    const payload = exportJson();
    if (!payload) {
      showToast("暂无可导出的批注。");
      return;
    }
    downloadBlob(payload, "application/json", `vfs-sidebar-feedback-${timestampForFile()}.json`);
    showToast("已导出完整记录，含截图数据，可导入复现。");
  }

  function openJsonImportPicker() {
    if (!jsonImportInput) {
      showToast("当前环境不支持导入。");
      return;
    }
    jsonImportInput.value = "";
    jsonImportInput.click();
  }

  async function handleJsonImportChange(event) {
    const file = event.target?.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const imported = parseImportedRecords(JSON.parse(text));
      if (!imported.length) {
        showToast("未识别到可导入的批注。");
        return;
      }
      restoreSavedStyleComparison();
      records = imported;
      activeId = records[0]?.id || "";
      agentDeliveryOpen = false;
      agentSelectedIds = new Set();
      agentBatchIndex = 0;
      await persistRecords();
      broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
      renderAll();
      showToast(`已导入 ${records.length} 条批注。`);
    } catch (error) {
      showToast("JSON 导入失败，请检查文件格式。");
    }
  }

  function parseImportedRecords(payload) {
    const source = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.feedback)
        ? payload.feedback
        : Array.isArray(payload?.records)
          ? payload.records
          : [];
    const ids = new Set();
    return source
      .filter((record) => record && (record.type === "dom" || record.type === "screenshot"))
      .map((record) => {
        let id = typeof record.id === "string" && record.id.trim() ? record.id.trim() : createId();
        if (ids.has(id)) {
          id = createId();
        }
        ids.add(id);
        return normalizeImportedRecord({
          ...record,
          id,
          type: record.type === "screenshot" ? "screenshot" : "dom",
          author: normalizeAuthor(record.author || currentAuthor),
          text: String(record.text || ""),
          createdAt: record.createdAt || new Date().toISOString(),
          url: record.url || currentPageUrl()
        });
      });
  }

  function normalizeImportedRecord(record) {
    const next = { ...record };
    if (next.type === "screenshot") {
      next.anchorOffset = normalizePoint(next.anchorOffset);
      next.anchorOffsetRatio = normalizeRatioPoint(next.anchorOffsetRatio);
      next.anchorPoint = normalizePoint(next.anchorPoint);
      next.anchorRect = normalizeLooseRect(next.anchorRect);
      next.anchorLocalRect = normalizeLooseRect(next.anchorLocalRect);
      next.anchorElementRect = normalizeLooseRect(next.anchorElementRect);
      next.anchorCoordinateViewport = next.anchorCoordinateViewport && typeof next.anchorCoordinateViewport === "object" ? next.anchorCoordinateViewport : null;
      next.bounds = normalizeLooseRect(next.bounds) || next.bounds;
      next.viewport = next.viewport && typeof next.viewport === "object" ? next.viewport : null;
      if (!Array.isArray(next.annotations)) {
        next.annotations = [];
      }
    }
    return next;
  }

  async function clearRecords() {
    restoreSavedStyleComparison();
    records.slice().reverse().forEach(restoreRecordStyle);
    const deletedCount = records.length;
    if (activeTeamChatId()) {
      const now = new Date().toISOString();
      records.forEach((record) => {
        markRecordDeletedForTeam(record, now);
      });
      activeId = "";
      updateCollabCountsFromRecords();
      await persistRecords();
      renderAll();
      scheduleCollabSync(0);
      trackEvent("comment_deleted", { source: "clear_all", record_count: deletedCount });
      return;
    }
    records = [];
    activeId = "";
    agentDeliveryOpen = false;
    agentSelectedIds = new Set();
    agentBatchIndex = 0;
    await storageRemove(storageKey());
    broadcastToChildFrames({ type: "VFS_CLEAR_SELECTION" });
    broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
    renderAll();
    trackEvent("comment_deleted", { source: "clear_all", record_count: deletedCount });
  }

  async function clearRecordsWithConfirm() {
    if (!records.length) {
      showToast("暂无可清空的批注。");
      return;
    }
    if (!isConfirming("clear")) {
      requestConfirm("clear");
      showToast("再次点击清空确认删除全部批注。");
      return;
    }
    clearConfirmState();
    await clearRecords();
    showToast("已清空当前页面批注。");
  }

  async function requestDeleteRecord(recordId) {
    const record = records.find((item) => item.id === recordId);
    if (!record) {
      return;
    }
    if (!isConfirming("delete", recordId)) {
      requestConfirm("delete", recordId);
      showToast("再次点击垃圾桶确认删除该条批注。");
      return;
    }
    clearConfirmState();
    if (savedStyleComparison?.recordId === recordId) {
      restoreSavedStyleComparison();
    }
    restoreRecordStyle(record);
    if (editingRecordId === recordId) {
      closeRecordEditor();
    }
    if (activeTeamChatId()) {
      markRecordDeletedForTeam(record);
      if (activeId === recordId) {
        activeId = activeRecords()[0]?.id || "";
      }
      updateCollabCountsFromRecords();
      await persistRecords();
      renderAll();
      scheduleCollabSync(0);
      trackEvent("comment_deleted", {
        source: "comment_action",
        record_count: 1,
        comment_type: record.type === "screenshot" ? "screenshot" : "dom"
      });
      showToast("已删除该条批注。");
      return;
    }
    records = records.filter((item) => item.id !== recordId);
    if (activeId === recordId) {
      activeId = records[0]?.id || "";
    }
    if (records.length) {
      await persistRecords();
    } else {
      await storageRemove(storageKey());
    }
    broadcastToChildFrames({ type: "VFS_RECORDS_UPDATED", records });
    renderAll();
    trackEvent("comment_deleted", {
      source: "comment_action",
      record_count: 1,
      comment_type: record.type === "screenshot" ? "screenshot" : "dom"
    });
    showToast("已删除该条批注。");
  }

  function requestConfirm(type, id = "") {
    pendingConfirm = { type, id };
    clearTimeout(confirmTimer);
    confirmTimer = setTimeout(() => {
      pendingConfirm = null;
      renderAll();
    }, 4000);
    renderAll();
  }

  function clearConfirmState() {
    pendingConfirm = null;
    clearTimeout(confirmTimer);
  }

  function isConfirming(type, id = "") {
    return pendingConfirm?.type === type && (type === "clear" || pendingConfirm.id === id);
  }

  function updateConfirmButtons() {
    const clearButton = root?.querySelector("[data-vfs-action='clear-all']");
    if (!clearButton) {
      return;
    }
    const confirming = isConfirming("clear");
    clearButton.classList.toggle("is-confirming", confirming);
    clearButton.disabled = !records.length;
    clearButton.innerHTML = confirming ? "确认" : "";
    clearButton.title = confirming ? "再次点击确认清空全部批注" : "清空全部批注";
    clearButton.setAttribute("aria-label", clearButton.title);
  }

  function exportJson() {
    if (!records.length) {
      return "";
    }
    return JSON.stringify({
      format: "vfs-sidebar-feedback-package",
      version: 1,
      exportedAt: new Date().toISOString(),
      page: {
        title: pageContext.title || document.title,
        url: currentPageUrl()
      },
      feedback: records
    }, null, 2);
  }

  function exportMarkdown() {
    const shots = records.filter((record) => record.type === "screenshot" && record.previewImage);
    return exportAgentMarkdown(records, {
      attachmentMap: buildAgentAttachmentMap(shots)
    });
  }

  function exportAgentMarkdown(sourceRecords = records, options = {}) {
    const items = Array.isArray(sourceRecords) ? sourceRecords : [];
    if (!items.length) {
      return "";
    }
    if (options.table || shouldUseAgentMarkdownTable(items)) {
      return exportAgentMarkdownTable(items, options);
    }
    const intro = [
      "# 前端修改任务",
      "只改下列项，勿动其他。"
    ];
    if (options.batchIndex >= 0 && options.batchCount > 1) {
      intro.push(`当前为第 ${options.batchIndex + 1}/${options.batchCount} 批截图清单，请只上传本批截图附件。`);
    }
    let issueIndex = 0;
    const blocks = groupAgentRecordsByPage(items).map((group, pageIndex) => {
      const issues = group.records.map((record) => {
        issueIndex += 1;
        return buildAgentMarkdownIssue(record, issueIndex - 1, options, 3);
      });
      return [buildAgentPageHeader(group, pageIndex), ...issues].join("\n\n");
    });
    return `${intro.join("\n")}\n\n${blocks.join("\n\n")}\n`;
  }

  function exportAgentMarkdownDetailed(sourceRecords = records, options = {}) {
    const items = Array.isArray(sourceRecords) ? sourceRecords : [];
    if (!items.length) {
      return "";
    }
    const lines = ["# 前端修改任务", "仅处理以下标注项。", ""];
    let issueIndex = 0;
    groupAgentRecordsByPage(items).forEach((group, pageIndex) => {
      lines.push(buildAgentPageHeader(group, pageIndex), "");
      group.records.forEach((record) => {
        issueIndex += 1;
        const attachment = options.attachmentMap?.get(record.id) || "";
        const requirements = agentRequirementsForMarkdown(record, options);
        const tag = record.type === "screenshot" ? `[截图${attachment || ""}]` : record.annotationKind === "adjustment" ? "[DOM 试改]" : "[DOM 评估]";
        lines.push(`### ${issueIndex} ${tag} ${truncateMarkdownTitle(targetLabel(record) || requirements[0] || "未填写批注")}`);
        lines.push(`- selector: \`${markdownSelectorValue(recordSelectorForMarkdown(record))}\``);
        if (record.label || record.excerpt) {
          lines.push(`- 目标: ${markdownLineValue(record.label || record.excerpt)}`);
        }
        if (record.domPath) {
          lines.push(`- DOM 路径: \`${markdownLineValue(record.domPath, "未捕获")}\``);
        }
        const styleEdits = Array.isArray(record.styleEdits) ? record.styleEdits : [];
        styleEdits.forEach((edit) => {
          lines.push(`- 修改: ${edit.property} ${markdownLineValue(edit.before, "未捕获")} -> ${markdownLineValue(edit.after, "未捕获")}`);
        });
        if (record.type === "screenshot") {
          lines.push(`- 截图: ${attachment || "未生成附件"}`);
          lines.push(`- 定位: ${record.locationConfidence || "近似定位"}`);
        }
        appendAgentRequirements(lines, requirements);
        lines.push("");
      });
    });
    return `${lines.join("\n").trim()}\n`;
  }

  function exportAgentMarkdownTable(items, options = {}) {
    const lines = [
      "# 前端修改 | 只改列出项"
    ];
    if (options.batchIndex >= 0 && options.batchCount > 1) {
      lines.push(`当前为第 ${options.batchIndex + 1}/${options.batchCount} 批截图清单，请只上传本批截图附件。`);
    }
    let issueIndex = 0;
    groupAgentRecordsByPage(items).forEach((group, pageIndex) => {
      lines.push("", buildAgentPageHeader(group, pageIndex));
      lines.push("| # | 类型 | selector | 改什么 | 截图 |");
      lines.push("|---|---|---|---|---|");
      group.records.forEach((record) => {
        issueIndex += 1;
        const attachment = options.attachmentMap?.get(record.id) || "";
        const requirements = agentRequirementsForMarkdown(record, options);
        const type = record.type === "dom" ? (record.annotationKind === "adjustment" ? "DOM试改" : "DOM评估") : "图";
        const values = [
          issueIndex,
          type,
          agentTableCell(recordSelectorForMarkdown(record)),
          agentTableCell(requirements.join("；") || targetLabel(record)),
          attachment || "-"
        ];
        lines.push(values.map((value) => ` ${value} `).join("|").replace(/^/, "|").replace(/$/, "|"));
      });
    });
    return `${lines.join("\n")}\n`;
  }

  function shouldUseAgentMarkdownTable(items) {
    return items.length >= 12;
  }

  function groupAgentRecordsByPage(items) {
    const groups = [];
    const byKey = new Map();
    items.forEach((record) => {
      const url = recordPageUrl(record);
      const frameUrl = recordFrameUrl(record);
      const key = String(record?.pageKey || `${normalizeLocationKey(url)}|${normalizeLocationKey(frameUrl)}`);
      let group = byKey.get(key);
      if (!group) {
        group = {
          title: String(record?.pageTitle || pageContext.title || document.title || "未命名页面").trim(),
          url,
          frameUrl,
          records: []
        };
        byKey.set(key, group);
        groups.push(group);
      }
      group.records.push(record);
    });
    return groups;
  }

  function buildAgentPageHeader(group, index) {
    const title = markdownLineValue(group.title || "未命名页面", "未命名页面");
    const url = markdownUrlValue(group.url, "未记录");
    const lines = [
      `## 界面 ${index + 1}：${title}`,
      `- 页面 URL: \`${url}\``
    ];
    if (isMeaningfulFrameUrl(group.frameUrl, group.url)) {
      lines.push(`- 主内容 Frame: \`${markdownUrlValue(group.frameUrl, "未记录")}\``);
    }
    return lines.join("\n");
  }

  function recordPageUrl(record) {
    return String(record?.url || currentPageUrl() || "").trim();
  }

  function recordFrameUrl(record) {
    if (!record) {
      return "";
    }
    const value = record.type === "screenshot"
      ? record.anchorFrameUrl || record.frameUrl || record.pageFrameUrl || ""
      : record.frameUrl || record.pageFrameUrl || "";
    return String(value || "").trim();
  }

  function isMeaningfulFrameUrl(frameUrl, pageUrl) {
    const frame = String(frameUrl || "").trim();
    if (!frame || /^about:/i.test(frame)) {
      return false;
    }
    return normalizeLocationKey(frame) !== normalizeLocationKey(pageUrl);
  }

  function normalizeLocationKey(value) {
    return normalizePageIdentityPart(value);
  }

  function agentTableCell(value) {
    return escapeMarkdownTable(String(value || "未捕获").replace(/\s+/g, " ").trim());
  }

  function escapeMarkdownTable(value) {
    return String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\|/g, "\\|")
      .replace(/\n/g, " ")
      .trim();
  }

  function recordSelectorForMarkdown(record) {
    if (record.type === "screenshot") {
      return record.anchorSelector || record.selector || record.anchorLabel || "仅截图坐标";
    }
    return record.selector || "未捕获";
  }

  function recordMarkdownTag(record, attachment = "") {
    if (record.type === "dom") {
      return record.annotationKind === "adjustment" ? "[DOM 试改]" : "[DOM 评估]";
    }
    return attachment ? `[图${attachment}]` : "[截图]";
  }

  function markdownLineValue(value, fallback = "未捕获") {
    return escapeMarkdownInline(truncate(String(value || fallback).replace(/\s+/g, " ").trim(), 120));
  }

  function markdownUrlValue(value, fallback = "未记录") {
    return escapeBackticks(String(value || fallback).replace(/\s+/g, " ").trim());
  }

  function markdownSelectorValue(value) {
    return escapeBackticks(String(value || "未捕获").replace(/\s+/g, " ").trim());
  }

  function agentRequirementsForMarkdown(record, options = {}) {
    if (options.requirementMap?.has(record.id)) {
      return options.requirementMap.get(record.id).map((value) => String(value || "").trim()).filter(Boolean);
    }
    const text = displayTextWithMentions(record.text || "", record.mentions || record.collab?.mentions || []);
    return text.trim() ? [text.trim()] : [];
  }

  function appendAgentRequirements(lines, requirements) {
    if (requirements.length === 1) {
      lines.push(`- 要求: ${markdownRequirementValue(requirements[0])}`);
      return;
    }
    if (requirements.length > 1) {
      lines.push("- 要求:");
      requirements.forEach((requirement) => {
        lines.push(`  - ${markdownRequirementValue(requirement)}`);
      });
    }
  }

  function markdownRequirementValue(value) {
    return escapeMarkdownInline(String(value || "未填写").replace(/\s+/g, " ").trim());
  }

  function buildAgentMarkdownIssue(record, index, options = {}, headingLevel = 2) {
    const attachment = options.attachmentMap?.get(record.id) || "";
    const requirements = agentRequirementsForMarkdown(record, options);
    const title = truncateMarkdownTitle(targetLabel(record) || requirements[0] || "未填写批注");
    const selectorLabel = record.type === "screenshot" ? "附近" : "selector";
    const lines = [
      `${"#".repeat(Math.max(1, Number(headingLevel) || 2))} ${index + 1} ${recordMarkdownTag(record, attachment)} ${title}`
    ];
    lines.push(`- ${selectorLabel}: \`${markdownSelectorValue(recordSelectorForMarkdown(record))}\``);
    const styleEdits = Array.isArray(record.styleEdits) ? record.styleEdits : [];
    if (styleEdits.length) {
      lines.push(`- 修改: ${styleEditSummary(styleEdits)}`);
    }
    if (record.type === "screenshot") {
      lines.push(`- 截图: ${attachment || "未生成附件"}`);
    }
    appendAgentRequirements(lines, requirements);
    return lines.join("\n");
  }

  function truncateMarkdownTitle(value) {
    return escapeMarkdownInline(truncate(String(value || "").replace(/\s+/g, " ").trim(), 46));
  }

  function escapeMarkdownInline(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\|/g, "\\|")
      .trim();
  }

  function escapeBackticks(value) {
    return String(value || "").replace(/`/g, "\\`");
  }

  function truncate(value, maxLength) {
    const text = String(value || "");
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
  }

  async function loadRecords() {
    const activeTeam = await storageGet(TEAM_ACTIVE_STORAGE_KEY);
    const chatId = activeTeamChatId() || String(activeTeam?.chatId || "").trim();
    records = chatId
      ? await readRecordsForTeam(chatId, { allowPersonalMigration: true })
      : await readRecordsForRound("", { allowLegacyMigration: true });
  }

  async function readRecordsForTeam(chatId, options = {}) {
    const key = teamRecordsStorageKey(chatId);
    const saved = await storageGet(key);
    if (Array.isArray(saved)) {
      return saved;
    }
    if (options.allowPersonalMigration) {
      const personal = await storageGet(recordsStorageKey(""));
      return Array.isArray(personal) ? personal : [];
    }
    return [];
  }

  async function readRecordsForRound(roundId, options = {}) {
    const key = recordsStorageKey(roundId);
    const saved = await storageGet(key);
    if (Array.isArray(saved)) {
      return saved;
    }
    if (roundId && options.allowLegacyMigration) {
      const pageRecords = await storageGet(recordsStorageKey(""));
      if (Array.isArray(pageRecords)) {
        const migrated = pageRecords.filter((record) => {
          const recordRoundId = String(record?.collab?.roundId || record?.collab?.roomId || "").trim();
          return !recordRoundId || recordRoundId === roundId;
        });
        if (migrated.length) {
          void storageSet({ [key]: migrated }).catch(() => {});
          return migrated;
        }
      }
    }
    if (!roundId) {
      const legacyKey = legacyStorageKey();
      const legacySaved = legacyKey ? await storageGet(legacyKey) : null;
      if (Array.isArray(legacySaved)) {
        if (legacySaved.length) {
          void storageSet({ [key]: legacySaved }).catch(() => {});
        }
        return legacySaved;
      }
    }
    return [];
  }

  async function loadAuthor() {
    currentAuthor = normalizeAuthor(await storageGet(AUTHOR_STORAGE_KEY));
  }

  async function loadReopenHidden() {
    reopenHidden = Boolean(await storageGet(REOPEN_HIDDEN_STORAGE_KEY));
  }

  async function loadMarkersHidden() {
    markersHidden = Boolean(await storageGet(MARKERS_HIDDEN_STORAGE_KEY));
  }

  async function loadCollabState() {
    let saved = await storageGet(collabStorageKey());
    const activeTeam = await storageGet(TEAM_ACTIVE_STORAGE_KEY);
    if (!saved || typeof saved !== "object" || !saved.team?.chatId) {
      saved = activeTeam?.chatId ? { team: activeTeam, chatId: activeTeam.chatId, teams: [] } : null;
    }
    collabState = saved && typeof saved === "object" ? saved : null;
  }

  async function setReopenHidden(hidden) {
    reopenHidden = Boolean(hidden);
    renderChrome();
    await storageSet({ [REOPEN_HIDDEN_STORAGE_KEY]: reopenHidden });
  }

  async function setMarkersHidden(hidden) {
    markersHidden = Boolean(hidden);
    renderAll();
    await storageSet({ [MARKERS_HIDDEN_STORAGE_KEY]: markersHidden });
  }

  async function persistRecords() {
    await storageSet({ [storageKey()]: records });
    notifyPanelStateChanged();
  }

  async function saveCollabState() {
    if (activeTeamChatId() || normalizeCollabTeams(collabState).length) {
      await storageSet({ [collabStorageKey()]: collabState });
      return;
    }
    await storageRemove(collabStorageKey());
  }

  async function persistRecordsSafely() {
    try {
      await persistRecords();
      return true;
    } catch (error) {
      if (isStorageQuotaError(error)) {
        await compactRecordPreviewsForStorage();
        try {
          await persistRecords();
          return true;
        } catch (retryError) {
          console.warn("[VFS] compacted record persistence failed", retryError);
        }
      }
      console.warn("[VFS] record persistence failed", error);
      notifyPanelStateChanged();
      return false;
    }
  }

  function isStorageQuotaError(error) {
    return /quota|exceed|storage/i.test(String(error?.message || error || ""));
  }

  async function compactRecordPreviewsForStorage() {
    for (const record of records) {
      const source = String(record?.previewImage || "");
      if (source.length <= COLLAB_INLINE_IMAGE_LIMIT) {
        continue;
      }
      const compacted = await compactCollabPreview(source);
      if (!compacted.dataUrl || compacted.dataUrl.length >= source.length) {
        continue;
      }
      record.previewImage = compacted.dataUrl;
      record.previewImageWidth = compacted.width;
      record.previewImageHeight = compacted.height;
      record.previewImageAspectRatio = roundNumber(compacted.width / Math.max(1, compacted.height), 4);
    }
  }

  function storageKey() {
    return activeTeamChatId() ? teamRecordsStorageKey(activeTeamChatId()) : recordsStorageKey("");
  }

  function teamRecordsStorageKey(chatId) {
    return `vfs-records:${pageKey()}:team:${String(chatId || "").trim()}`;
  }

  function recordsStorageKey(roundId) {
    const base = `vfs-records:${pageKey()}`;
    const normalized = String(roundId || "").trim();
    return normalized ? `${base}:round:${normalized}` : base;
  }

  function collabStorageKey() {
    return `${COLLAB_ROOM_STORAGE_PREFIX}${pageKey()}`;
  }

  function legacyStorageKey() {
    const legacyPageKey = legacyFramePageIdentityKey();
    return legacyPageKey && legacyPageKey !== pageKey() ? `vfs-records:${legacyPageKey}` : "";
  }

  function legacyCollabStorageKey() {
    const legacyPageKey = legacyFramePageIdentityKey();
    return legacyPageKey && legacyPageKey !== pageKey() ? `${COLLAB_ROOM_STORAGE_PREFIX}${legacyPageKey}` : "";
  }

  function pageKey() {
    return activePageKey || currentPageIdentityKey();
  }

  function storageGet(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => resolve(result?.[key]));
    });
  }

  function storageSet(value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(value, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  function storageRemove(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (key === storageKey()) {
          notifyPanelStateChanged();
        }
        resolve();
      });
    });
  }

  function elementLabel(element) {
    const explicit = element.getAttribute("aria-label") || element.getAttribute("title");
    if (explicit) {
      return explicit.trim().slice(0, 80);
    }
    const text = elementExcerpt(element);
    if (text) {
      return text.slice(0, 40);
    }
    return element.tagName.toLowerCase();
  }

  function elementExcerpt(element) {
    return (element.innerText || element.alt || element.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }

  function cssPath(element) {
    if (element.id) {
      return `#${cssEscape(element.id)}`;
    }
    const parts = [];
    let node = element;
    while (node && node.nodeType === 1 && node !== document.body && node !== document.documentElement) {
      let part = node.tagName.toLowerCase();
      const className = Array.from(node.classList || [])
        .filter((name) => !name.startsWith("vfs-"))
        .slice(0, 2)
        .map(cssEscape)
        .join(".");
      if (className) {
        part += `.${className}`;
      }
      const parent = node.parentElement;
      if (parent) {
        const sameTagSiblings = Array.from(parent.children).filter((child) => child.tagName === node.tagName);
        if (sameTagSiblings.length > 1) {
          part += `:nth-of-type(${sameTagSiblings.indexOf(node) + 1})`;
        }
      }
      parts.unshift(part);
      node = parent;
    }
    return parts.join(" > ");
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) {
      return CSS.escape(String(value));
    }
    return String(value).replace(/["\\#.:,[\]>+~*]/g, "\\$&");
  }

  function rectToObject(rect) {
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    };
  }

  function roundRect(rect) {
    if (!rect) {
      return null;
    }
    return {
      x: roundNumber(rect.x ?? rect.left ?? 0),
      y: roundNumber(rect.y ?? rect.top ?? 0),
      width: roundNumber(Math.max(0, rect.width ?? ((rect.right ?? 0) - (rect.left ?? 0)))),
      height: roundNumber(Math.max(0, rect.height ?? ((rect.bottom ?? 0) - (rect.top ?? 0))))
    };
  }

  function anchorOffsetRatio(offset, rect) {
    if (!offset || !rect) {
      return null;
    }
    const width = Math.max(1, Number(rect.width) || 1);
    const height = Math.max(1, Number(rect.height) || 1);
    return {
      x: roundNumber(clamp((Number(offset.x) || 0) / width, 0, 1), 4),
      y: roundNumber(clamp((Number(offset.y) || 0) / height, 0, 1), 4)
    };
  }

  function anchorOffsetForRect(record, rect) {
    if (!record || !rect) {
      return null;
    }
    const ratio = normalizeRatioPoint(record.anchorOffsetRatio);
    if (ratio) {
      return {
        x: clamp(ratio.x * Math.max(1, rect.width), 0, rect.width),
        y: clamp(ratio.y * Math.max(1, rect.height), 0, rect.height)
      };
    }
    const offset = normalizePoint(record.anchorOffset);
    if (offset) {
      return {
        x: clamp(offset.x, 0, rect.width),
        y: clamp(offset.y, 0, rect.height)
      };
    }
    return null;
  }

  function normalizePoint(value) {
    if (!value || typeof value !== "object") {
      return null;
    }
    const x = Number(value.x);
    const y = Number(value.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return null;
    }
    return { x, y };
  }

  function normalizeRatioPoint(value) {
    const point = normalizePoint(value);
    if (!point) {
      return null;
    }
    return {
      x: clamp(point.x, 0, 1),
      y: clamp(point.y, 0, 1)
    };
  }

  function normalizeLooseRect(value) {
    if (!value || typeof value !== "object") {
      return null;
    }
    const x = Number(value.x);
    const y = Number(value.y);
    const width = Number(value.width);
    const height = Number(value.height);
    if (![x, y, width, height].every(Number.isFinite)) {
      return null;
    }
    return {
      x,
      y,
      width: Math.max(0, width),
      height: Math.max(0, height)
    };
  }

  function targetLabel(record) {
    if (record.type === "dom") {
      return `标注位置：${record.label || record.excerpt || "页面元素"}`;
    }
    const bounds = record.bounds || {};
    const shotLabel = `截图：${record.toolLabel || "标注"}，${Math.round(bounds.width || 0)}x${Math.round(bounds.height || 0)}`;
    return record.anchorLabel ? `${shotLabel}；附近位置：${record.anchorLabel}` : shotLabel;
  }

  function formatTime(value) {
    return new Date(value).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function normalizeAuthor(value) {
    return String(value || "").trim().slice(0, 32) || DEFAULT_AUTHOR;
  }

  function recordAuthorName(record) {
    return String(record?.author || currentAuthor || DEFAULT_AUTHOR).trim() || DEFAULT_AUTHOR;
  }

  function authorColorForRecord(record) {
    const seed = String(recordAuthorName(record) || DEFAULT_AUTHOR);
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
      hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 72% 54%)`;
  }

  function sidebarWidth() {
    if (!isTopFrame()) {
      return 0;
    }
    // The floating workbench never uses a layout-reserving browser side panel.
    return 0;
  }

  function modeMessage(value) {
    if (value === "dom") {
      return "DOM 标注已开启：点击页面元素写批注。";
    }
    if (value === "shot") {
      return "截图标注已开启：可使用框、箭头或画笔。";
    }
    if (value === "off") {
      return "侧栏批注已关闭。";
    }
    return "阅读模式已开启：点击侧栏卡片定位。";
  }

  function showToast(text) {
    if (!toastNode) {
      return;
    }
    toastNode.textContent = text;
    toastNode.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastNode.classList.remove("is-visible"), 2400);
  }

  function createId() {
    return `vfs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function generateClientRoundId() {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const suffix = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("").toUpperCase();
    return `FR-${suffix}`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchWithClientTimeout(url, options, timeoutMs, timeoutMessage) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error(timeoutMessage || "请求超时，请重试。");
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function nextPaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  }

  function clonePlainObject(value) {
    if (!value || typeof value !== "object") {
      return value;
    }
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return Array.isArray(value) ? value.slice() : { ...value };
    }
  }

  function dispose() {
    restoreSavedStyleComparison();
    if (styleDraft && !styleDraft.remoteSessionId) {
      restoreElementStyleBaseline(styleDraft);
    }
    remoteStyleSessions.forEach((session) => restoreElementStyleBaseline(session));
    remoteStyleSessions.clear();
    remoteSavedStyleComparisons.forEach((comparison) => restoreElementStyleBaseline(comparison));
    remoteSavedStyleComparisons.clear();
    try {
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
    } catch {
      // Ignore extension lifecycle races.
    }
    window.removeEventListener("pointerdown", handleDomPointerDown, true);
    window.removeEventListener("mousemove", handleMouseMove, true);
    window.removeEventListener("click", handleDocumentClick, true);
    document.removeEventListener("mousemove", handleMouseMove, true);
    document.removeEventListener("click", handleDocumentClick, true);
    window.removeEventListener("message", handleWindowMessage);
    window.removeEventListener("scroll", scheduleMarkerUpdate, true);
    document.removeEventListener("scroll", scheduleMarkerUpdate, true);
    window.visualViewport?.removeEventListener?.("scroll", scheduleMarkerUpdate);
    window.visualViewport?.removeEventListener?.("resize", scheduleMarkerUpdate);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("keydown", handleKeyDown, true);
    document.removeEventListener("visibilitychange", scheduleCollabPoll);
    try {
      chrome.storage?.onChanged?.removeListener(handleStorageChange);
    } catch {
      // Storage listener may be gone after extension reload.
    }
    clearTimeout(toastTimer);
    clearTimeout(focusTimer);
    screenshotRecoveryRequest += 1;
    clearTimeout(shotScrollTimer);
    clearTimeout(collabPollTimer);
    clearTimeout(collabSyncTimer);
    clearTimeout(pageIdentityTimer);
    root?.remove();
    markerLayer?.remove();
    focusBox?.remove();
    if (window.__VFS_SIDEBAR_REVIEW__?.version === CONTENT_BUILD_ID) {
      window.__VFS_SIDEBAR_REVIEW__ = null;
      window.__VFS_SIDEBAR_REVIEW_LOADED__ = false;
      window.__VFS_SIDEBAR_REVIEW_VERSION__ = "";
    }
  }

  window.__VFS_SIDEBAR_REVIEW__ = {
    handle: runMessage,
    dispose,
    version: CONTENT_BUILD_ID
  };
})();
