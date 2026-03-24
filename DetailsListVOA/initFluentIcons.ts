// Initialize Fluent UI MDL2 font icons once per runtime so icon names like
// 'SortUp', 'SortDown', and 'Filter' render correctly in menus and headers.
// This uses the v8-compatible initializer from @fluentui/react.
// The dedicated package `@fluentui/font-icons-mdl2` remains a valid alternative.
import { initializeIcons } from '@fluentui/react/lib/Icons';

initializeIcons();
