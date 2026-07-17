<script lang="ts" setup>
import { createDiscreteApi, NSwitch, NForm, NFormItem, NSelect, NButtonGroup, NButton, NModal, NSlider } from "naive-ui";
import clipboard from "clipboard";
import { computed, ref, watchEffect } from "vue";
const { message: NMessage } = createDiscreteApi(['message']);

const Icons = ["search", "home", "menu", "close", "settings", "check_circle", "favorite", "add", "delete", "arrow_back", "star", "chevron_right", "logout", "arrow_forward_ios", "add_circle", "cancel", "arrow_back_ios", "arrow_forward", "arrow_drop_down", "more_vert", "check", "check_box", "open_in_new", "toggle_on", "refresh", "check_box_outline_blank", "login", "chevron_left", "radio_button_unchecked", "more_horiz", "download", "apps", "arrow_right_alt", "radio_button_checked", "filter_alt", "remove", "bolt", "arrow_upward", "toggle_off", "filter_list", "delete_forever", "autorenew", "key", "block", "sync", "arrow_downward", "sort", "add_box", "arrow_back_ios_new", "restart_alt", "shopping_cart_checkout", "menu_open", "expand_circle_down", "undo", "backspace", "arrow_circle_right", "done_all", "arrow_right", "do_not_disturb_on", "open_in_full", "manage_search", "double_arrow", "sync_alt", "done_outline", "zoom_in", "drag_indicator", "fullscreen", "star_half", "keyboard_double_arrow_right", "ios_share", "settings_accessibility", "arrow_drop_up", "reply", "exit_to_app", "unfold_more", "library_add", "cached", "terminal", "select_check_box", "change_circle", "disabled_by_default", "swap_horiz", "swap_vert", "close_fullscreen", "app_registration", "dataset", "download_for_offline", "arrow_circle_up", "arrow_circle_left", "minimize", "file_open", "open_with", "add_task", "keyboard_double_arrow_left", "start", "keyboard_double_arrow_down", "create_new_folder", "upload", "forward", "downloading", "compare_arrows", "settings_applications", "redo", "publish", "zoom_out", "arrow_left", "token", "html", "switch_access_shortcut", "fullscreen_exit", "arrow_circle_down", "sort_by_alpha", "delete_sweep", "indeterminate_check_box", "first_page", "view_timeline", "keyboard_double_arrow_up", "settings_backup_restore", "sync_problem", "assistant_navigation", "arrow_drop_down_circle", "heart_plus", "clear_all", "density_medium", "expand", "arrow_outward", "subdirectory_arrow_right", "filter_alt_off", "last_page", "unfold_less", "download_done", "123", "swipe_left", "saved_search", "system_update_alt", "output", "search_off", "place_item", "javascript", "swipe_up", "maximize", "select_all", "fit_screen", "hide_source", "check_small", "dynamic_form", "swipe_right", "browse_gallery", "switch_access_shortcut_add", "density_small", "css", "assistant_direction", "move_up", "youtube_searched_for", "data_thresholding", "swap_horizontal_circle", "install_mobile", "abc", "move_down", "dataset_linked", "restore_from_trash", "browse_activity", "enable", "install_desktop", "keyboard_command_key", "view_kanban", "reply_all", "switch_left", "compress", "star_rate", "swipe_down", "swap_vertical_circle", "apps_outage", "remove_done", "filter_list_off", "hide", "sync_disabled", "swipe_vertical", "switch_right", "more_up", "pinch", "keyboard_control_key", "tab", "eject", "key_off", "php", "subdirectory_arrow_left", "view_cozy", "transcribe", "do_not_disturb_off", "send_time_extension", "width_normal", "view_comfy_alt", "heart_minus", "share_reviews", "progress_activity", "width_full", "unfold_more_double", "file_download_off", "view_compact_alt", "cycle", "extension_off", "open_in_new_off", "check_indeterminate_small", "more_down", "width_wide", "repartition", "density_large", "swipe_left_alt", "swipe_down_alt", "swipe_right_alt", "swipe_up_alt", "unfold_less_double", "expand_content", "keyboard_option_key", "tab_unselected", "hls", "hls_off", "file_upload_off", "expand_all", "deployed_code", "rebase", "quick_reference_all", "collapse_all", "rebase_edit", "arrow_split", "stat_0", "acute", "stack", "data_check", "empty_dashboard", "prompt_suggestion", "arrow_upward_alt", "stacks", "page_info", "arrow_downward_alt", "left_click", "clock_loader_60", "collapse_content", "quick_reference", "sync_saved_locally", "captive_portal", "data_alert", "switches", "arrow_insert", "point_scan", "rule_settings", "search_check", "unknown_med", "clock_loader_10", "directory_sync", "clock_loader_40", "question_exchange", "heart_check", "expand_circle_right", "linked_services", "side_navigation", "data_info_alert", "move_item", "stack_star", "cards", "step", "preliminary", "steppers", "action_key", "bubble", "stat_3", "drag_pan", "new_window", "right_panel_open", "expand_circle_up", "star_rate_half", "sweep", "arrow_left_alt", "clock_loader_80", "deployed_code_update", "right_panel_close", "event_list", "stat_minus_1", "close_small", "responsive_layout", "dialogs", "left_panel_open", "resize", "toolbar", "patient_list", "expansion_panels", "share_windows", "clock_loader_90", "highlight_mouse_cursor", "all_match", "input_circle", "page_control", "pip", "unknown_5", "clock_loader_20", "left_panel_close", "move_group", "radio_button_partial", "chevron_forward", "recenter", "arrow_range", "capture", "stat_2", "step_over", "category_search", "settings_heart", "key_vertical", "stat_minus_2", "drag_click", "sliders", "step_into", "tab_duplicate", "stat_1", "deployed_code_account", "right_click", "arrow_and_edge", "buttons_alt", "download_2", "magnification_small", "open_run", "partner_reports", "stat_minus_3", "dropdown", "bottom_navigation", "chip_extraction", "chronic", "search_check_2", "tab_close", "bottom_panel_open", "deployed_code_history", "pip_exit", "stack_off", "magnification_large", "subheader", "bottom_drawer", "iframe", "shelf_position", "step_out", "go_to_line", "tab_group", "add_2", "arrows_outward", "switch_access_2", "app_badging", "arrow_upload_progress", "open_in_new_down", "tabs", "toast", "chevron_backward", "upload_2", "reopen_window", "arrow_back_2", "bubbles", "error_med", "bottom_sheets", "jump_to_element", "switch_access", "amend", "arrow_upload_ready", "deployed_code_alert", "output_circle", "shelf_auto_hide", "bottom_right_click", "chips", "tab_move", "arrow_or_edge", "back_to_tab", "bottom_panel_close", "move_selection_left", "ripples", "arrow_top_left", "tab_recent", "move_selection_right", "tab_new_right", "arrow_top_right", "borg", "file_export", "iframe_off", "position_bottom_left", "position_bottom_right", "multimodal_hand_eye", "position_top_right", "rotate_auto", "move_selection_up", "float_landscape_2", "highlight_keyboard_focus", "tab_close_right", "bottom_app_bar", "sync_desktop", "tab_inactive", "desktop_landscape", "file_json", "highlight_text_cursor", "modeling", "splitscreen_landscape", "splitscreen_portrait", "tab_close_inactive", "desktop_landscape_add", "filter_arrow_right", "fullscreen_portrait", "tile_small", "widget_medium", "widget_width", "arrow_menu_close", "arrow_menu_open", "desktop_portrait", "move_selection_down", "tile_large", "float_portrait_2", "arrows_output", "clock_arrow_up", "tile_medium", "arrows_input", "clock_arrow_down", "edit_arrow_down", "edit_arrow_up", "hourglass_arrow_down", "hourglass_arrow_up", "sync_arrow_down", "sync_arrow_up", "thermostat_arrow_down", "thermostat_arrow_up", "timer_arrow_down", "timer_arrow_up", "view_apps", "widget_small"];

function copyName(value: string) {
  clipboard.copy(value);
  NMessage.success(`复制「 ${value} 」成功`);
}

const Fill = ref<boolean>(false);
const FillCSSVariable = computed(() => {
  return Number(Fill.value);
});
const SelectedFontStyle = ref<string>("Outlined");
const FontStyleOptions = [
  {
    label: "Outlined",
    value: "Outlined"
  },
  {
    label: "Rounded",
    value: "Rounded"
  },
  {
    label: "Sharp",
    value: "Sharp"
  }
];
const FontWeight = ref<number>(400);
const FontWeights: Record<number, string> = {
  100: '100',
  200: '200',
  300: '300',
  400: '400',
  500: '500',
  600: '600',
  700: '700',
};
const FontGrade = ref<number>(0);
const FontGrades: Record<number, string> = {
  '-25': '-25',
  0: '0',
  200: '200'
};
const FontOpticalSize = ref<number>(24);
const FontOpticalSizes: Record<number, string> = {
  20: '20',
  24: '24',
  40: '40',
  48: '48'
};
const FontClassName = ref<string>("material-symbols-outlined");
const FontCSSFilePath = ref<string>(`https://fonts.googleapis.com/css2?family=Material+Symbols+${SelectedFontStyle.value}:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`);
const FileContentShow = ref<boolean>(false);
const FontFileContent = ref<string>("");
const FontFileURL = ref<string>("");
const DownloadFileLinkElement = document.createElement("a");

function downloadIconFontFile() {
  replaceFontFilePath();
  downloadCSSFile();
  downloadFontFile();
}

function replaceFontFilePath() {
  FontFileContent.value = FontFileContent.value.replace(FontFileURL.value, "./iconfont.woff2");
  NMessage.success('字体文件路径替换完成');
}

function downloadCSSFile() {
  DownloadFileLinkElement.href = URL.createObjectURL(new Blob([FontFileContent.value]));
  DownloadFileLinkElement.download = "iconfont.css";
  DownloadFileLinkElement.click();
}
function downloadFontFile() {
  fetch(FontFileURL.value).then(res => res.blob()).then(res => {
    DownloadFileLinkElement.href = URL.createObjectURL(res);
    DownloadFileLinkElement.download = "iconfont.woff2";
    DownloadFileLinkElement.click();
  });
}

watchEffect(() => {
  FontClassName.value = `material-symbols-${SelectedFontStyle.value.toLowerCase()}`;
  FontCSSFilePath.value = `https://fonts.googleapis.com/css2?family=Material+Symbols+${SelectedFontStyle.value}:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`;

  fetch(FontCSSFilePath.value).then(async res => {
    return res.text();
  }).then(res => {
    FontFileContent.value = res;
    const Matchs = FontFileContent.value.match(/url\((.+?)\)/);
    if (Matchs && Matchs.length > 1) {
      FontFileURL.value = Matchs[1];
    }
  });
});


</script>

<style scoped>
.icons {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  list-style-type: none;
  padding: 0px;
  margin: 0px;
  text-align: center;
  font-size: 14px;
  word-break: break-all;

  font-variation-settings:
    'FILL' v-bind(FillCSSVariable),
    'wght' v-bind('FontWeight'),
    'GRAD' v-bind('FontGrade'),
    'opsz' v-bind('FontOpticalSize')
}

.icons li {
  flex-shrink: 0;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  width: calc(100% / 8);
  cursor: pointer;
}

.icons .icon-content {
  font-size: 48px;
}

.file-content {
  white-space: pre-wrap;
}
</style>

<template>
  <link :href="FontCSSFilePath" rel="stylesheet" />
  <n-form label-placement="left">
    <n-form-item label="样式">
      <n-select :options="FontStyleOptions" v-model:value="SelectedFontStyle"></n-select>
    </n-form-item>
    <n-form-item label="填充">
      <n-switch v-model:value="Fill" />
    </n-form-item>
    <n-form-item label="字体粗细">
      <n-slider v-model:value="FontWeight" :marks="FontWeights" step="mark" :min="100" :max="700" />
    </n-form-item>
    <n-form-item label="字体等级">
      <n-slider v-model:value="FontGrade" :marks="FontGrades" step="mark" :min="-25" :max="200" />
    </n-form-item>
    <n-form-item label="光学尺寸">
      <n-slider v-model:value="FontOpticalSize" :marks="FontOpticalSizes" step="mark" :min="20" :max="48" />
    </n-form-item>
    <n-form-item label="下载">
      <n-button-group size="small">
        <n-button @click="FileContentShow = true;" type="info" tertiary>查看</n-button>
        <n-button @click="downloadIconFontFile" type="primary" secondary>下载</n-button>
      </n-button-group>
    </n-form-item>
  </n-form>
  <n-modal v-model:show="FileContentShow" preset="card" :style="{
    width: '60vw'
  }" title="字体文件内容" size="huge" :bordered="false">
    <div class="file-content">
      {{ FontFileContent }}
    </div>
    <template #footer>
      <n-button @click="downloadIconFontFile" type="primary">下载</n-button>
    </template>
  </n-modal>
  <ul class="icons">
    <li v-for="(Icon, IconIndex) in Icons" :key="IconIndex" @click="copyName(Icon)">
      <span class="icon-content" :class="[FontClassName]">
        {{ Icon }}
      </span>
      <div class="icon-name">
        {{ Icon }}
      </div>
    </li>
  </ul>
</template>