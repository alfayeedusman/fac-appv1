<?php
/**
 * phpMyAdmin Configuration File
 * Fayeed Auto Care Database Management Interface
 * 
 * Custom configuration for secure database access
 * Access URL: mysite/facmydb
 */

declare(strict_types=1);

/**
 * This is needed for cookie based authentication to encrypt the cookie.
 * Needs to be 32 chars long.
 */
$cfg['blowfish_secret'] = 'fayeed-auto-care-32-char-secret-key!';

/**
 * Servers configuration
 */
$i = 0;

/**
 * First server - Fayeed Auto Care MySQL Database
 */
$i++;
$cfg['Servers'][$i]['host'] = $_ENV['MYSQL_HOST'] ?? 'localhost';
$cfg['Servers'][$i]['port'] = $_ENV['MYSQL_PORT'] ?? '3306';
$cfg['Servers'][$i]['socket'] = '';
$cfg['Servers'][$i]['ssl'] = false;
$cfg['Servers'][$i]['ssl_key'] = null;
$cfg['Servers'][$i]['ssl_cert'] = null;
$cfg['Servers'][$i]['ssl_ca'] = null;
$cfg['Servers'][$i]['ssl_ca_path'] = '';
$cfg['Servers'][$i]['ssl_ciphers'] = '';
$cfg['Servers'][$i]['ssl_verify'] = true;
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['controluser'] = '';
$cfg['Servers'][$i]['controlpass'] = '';
$cfg['Servers'][$i]['auth_type'] = 'cookie';
$cfg['Servers'][$i]['user'] = '';
$cfg['Servers'][$i]['password'] = '';
$cfg['Servers'][$i]['nopassword'] = false;
$cfg['Servers'][$i]['only_db'] = 'fayeed_auto_care';

/**
 * phpMyAdmin configuration storage settings.
 */
$cfg['Servers'][$i]['pmadb'] = 'phpmyadmin';
$cfg['Servers'][$i]['bookmarktable'] = 'pma__bookmark';
$cfg['Servers'][$i]['relation'] = 'pma__relation';
$cfg['Servers'][$i]['table_info'] = 'pma__table_info';
$cfg['Servers'][$i]['table_coords'] = 'pma__table_coords';
$cfg['Servers'][$i]['pdf_pages'] = 'pma__pdf_pages';
$cfg['Servers'][$i]['column_info'] = 'pma__column_info';
$cfg['Servers'][$i]['history'] = 'pma__history';
$cfg['Servers'][$i]['table_uiprefs'] = 'pma__table_uiprefs';
$cfg['Servers'][$i]['tracking'] = 'pma__tracking';
$cfg['Servers'][$i]['userconfig'] = 'pma__userconfig';
$cfg['Servers'][$i]['recent'] = 'pma__recent';
$cfg['Servers'][$i]['favorite'] = 'pma__favorite';
$cfg['Servers'][$i]['users'] = 'pma__users';
$cfg['Servers'][$i]['usergroups'] = 'pma__usergroups';
$cfg['Servers'][$i]['navigationhiding'] = 'pma__navigationhiding';
$cfg['Servers'][$i]['savedsearches'] = 'pma__savedsearches';
$cfg['Servers'][$i]['central_columns'] = 'pma__central_columns';
$cfg['Servers'][$i]['designer_settings'] = 'pma__designer_settings';
$cfg['Servers'][$i]['export_templates'] = 'pma__export_templates';

/**
 * Web server settings
 */
$cfg['PmaAbsoluteUri'] = $_ENV['PHPMYADMIN_ABSOLUTE_URI'] ?? '';

/**
 * Directories for saving/loading files from server
 */
$cfg['UploadDir'] = '/tmp/';
$cfg['SaveDir'] = '/tmp/';

/**
 * Security settings
 */
$cfg['CheckConfigurationPermissions'] = false;
$cfg['AllowArbitraryServer'] = false;
$cfg['LoginCookieValidity'] = 3600; // 1 hour
$cfg['LoginCookieStore'] = 0;
$cfg['LoginCookieDeleteAll'] = true;
$cfg['Servers'][$i]['hide_db'] = '^(information_schema|performance_schema|mysql|sys)$';

/**
 * Interface settings
 */
$cfg['DefaultLang'] = 'en';
$cfg['ServerDefault'] = 1;
$cfg['DefaultTabServer'] = 'welcome';
$cfg['DefaultTabDatabase'] = 'structure';
$cfg['DefaultTabTable'] = 'sql';
$cfg['RowActionLinks'] = 'left';

/**
 * Custom theme and styling
 */
$cfg['ThemeDefault'] = 'original';
$cfg['DefaultDisplay'] = 'horizontal';
$cfg['HeaderFlipType'] = 'css';

/**
 * Import/Export settings
 */
$cfg['MaxRows'] = 100;
$cfg['Order'] = 'SMART';
$cfg['GridEditing'] = 'click';
$cfg['SaveCellsAtOnce'] = false;

/**
 * SQL query settings
 */
$cfg['SQLQuery']['Edit'] = true;
$cfg['SQLQuery']['Explain'] = true;
$cfg['SQLQuery']['ShowAsPHP'] = true;
$cfg['SQLQuery']['Validate'] = false;
$cfg['SQLQuery']['Refresh'] = true;

/**
 * Browse mode settings
 */
$cfg['MaxRows'] = 100;
$cfg['ProtectBinary'] = 'blob';
$cfg['ShowAll'] = false;
$cfg['MaxExactCount'] = 50000;
$cfg['MaxExactCountViews'] = 0;

/**
 * Navigation panel settings
 */
$cfg['NavigationTreeEnableGrouping'] = true;
$cfg['NavigationTreeDbSeparator'] = '_';
$cfg['NavigationTreeTableSeparator'] = '__';
$cfg['NavigationTreeTableLevel'] = 1;
$cfg['NavigationDisplayLogo'] = true;
$cfg['NavigationLogoLink'] = 'index.php';
$cfg['NavigationLogoLinkWindow'] = 'main';

/**
 * Custom settings for Fayeed Auto Care
 */
$cfg['TitleTable'] = 'Fayeed Auto Care - @TABLE@ on @SERVER@';
$cfg['TitleDatabase'] = 'Fayeed Auto Care - @DATABASE@ on @SERVER@';
$cfg['TitleServer'] = 'Fayeed Auto Care - Database Administration';
$cfg['TitleDefault'] = 'Fayeed Auto Care - phpMyAdmin @VERSION@';

/**
 * Export settings
 */
$cfg['Export']['method'] = 'quick';
$cfg['Export']['format'] = 'sql';
$cfg['Export']['compression'] = 'none';
$cfg['Export']['charset'] = 'utf-8';
$cfg['Export']['onserver'] = false;
$cfg['Export']['onserver_overwrite'] = false;
$cfg['Export']['quick_export_onserver'] = false;
$cfg['Export']['quick_export_onserver_overwrite'] = false;
$cfg['Export']['remember_file_template'] = true;
$cfg['Export']['file_template_table'] = '@TABLE@';
$cfg['Export']['file_template_database'] = '@DATABASE@';
$cfg['Export']['file_template_server'] = '@SERVER@';

/**
 * Import settings
 */
$cfg['Import']['charset'] = 'utf-8';
$cfg['Import']['allow_interrupt'] = true;
$cfg['Import']['skip_queries'] = 0;
$cfg['Import']['sql_compatibility'] = 'NONE';
$cfg['Import']['sql_no_auto_value_on_zero'] = false;
$cfg['Import']['sql_read_as_multibytes'] = false;

/**
 * Backup settings
 */
$cfg['ZipDump'] = true;
$cfg['GZipDump'] = true;
$cfg['BZipDump'] = true;

/**
 * Console settings
 */
$cfg['Console']['StartHistory'] = false;
$cfg['Console']['AlwaysExpand'] = false;
$cfg['Console']['CurrentQuery'] = true;
$cfg['Console']['EnterExecutes'] = false;
$cfg['Console']['DarkTheme'] = false;
$cfg['Console']['Mode'] = 'info';
$cfg['Console']['Height'] = 92;
$cfg['Console']['GroupQueries'] = false;
$cfg['Console']['OrderBy'] = 'exec';
$cfg['Console']['Order'] = 'asc';

/**
 * Security restrictions
 */
$cfg['AllowUserDropDatabase'] = false;
$cfg['Confirm'] = true;
$cfg['QueryHistoryDB'] = false;
$cfg['QueryHistoryMax'] = 25;

/**
 * Designer settings
 */
$cfg['Designer']['default_tab_display'] = 'structure';

/**
 * Custom CSS and JavaScript
 */
$cfg['ThemePath'] = './themes/';

/**
 * Session cookie settings
 */
$cfg['SessionSavePath'] = '';

/**
 * Miscellaneous settings
 */
$cfg['DisableMultiTableMaintenance'] = false;
$cfg['SendErrorReports'] = 'never';
$cfg['ConsoleEnterExecutes'] = false;

/**
 * Two-factor authentication settings
 */
$cfg['DBG']['sql'] = false;
$cfg['environment'] = $_ENV['APP_ENV'] ?? 'production';

/**
 * Custom footer text
 */
$cfg['LoginLogoURL'] = '';
$cfg['LoginLogoLink'] = '';
$cfg['LoginLogoLinkWindow'] = 'main';

/**
 * Error handling
 */
$cfg['Error_Handler']['display'] = false;
$cfg['Error_Handler']['gather'] = false;

/**
 * Custom welcome message
 */
if (!empty($_ENV['PHPMYADMIN_WELCOME_MESSAGE'])) {
    $cfg['ServerDisplayName'] = $_ENV['PHPMYADMIN_WELCOME_MESSAGE'];
} else {
    $cfg['ServerDisplayName'] = 'Fayeed Auto Care Database';
}

/**
 * End of configuration
 */
?>
