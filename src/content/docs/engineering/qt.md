---
title: Qt & Kirigami
description: "Building native KDE apps with Qt 6.10 and Kirigami: QML vs Widgets, adaptive pages, KConfig, KNotification, KIO, CMake, accessibility, and Flatpak packaging."
---

Qt is the other major Linux desktop stack. It is mature, widely used, cross-platform, and backed by a deep tooling ecosystem. **Kirigami** is KDE's adaptive UI framework built on Qt Quick; it gives you the navigation, sheets, cards, and responsive layout that make an app feel at home on Plasma.

If your primary audience is KDE, Qt + Kirigami is a direct path to native behavior. If you need one codebase across desktop, mobile, and embedded targets, Qt is often the pragmatic choice — provided you still do the platform integration work.

:::note[Versions in Ubuntu 26.04]
Qt 6.10.2, KDE Frameworks 6.24, KDE Plasma 6.6. Target Qt 6.10 on Ubuntu 26.04. Use `QT_VERSION_CHECK` when you also support older releases; API availability is compile-time, not a runtime guard. Qt 6.8 LTS is commercially maintained; open-source users should track their distribution's Qt or the latest stable.
:::

## QML or Qt Widgets?

| Dimension | Qt Widgets | Qt Quick / QML |
| --- | --- | --- |
| Look | Classic desktop, dense | Fluid, animated, touch-friendly |
| Performance | Excellent for forms/tables | Excellent with a disciplined scene |
| Adaptability | Manual layouts | Layouts, states, transitions, `PageRow` |
| Learning curve | C++ widgets | QML + JavaScript + C++ backend |
| Accessibility | Mature | Improving; requires explicit labels |
| Best for | Utilities, IDEs, data-heavy tools | Media, touch, animated, adaptive apps |

Do not mix the two paradigms in one window unless you have a specific reason. A QML app with a C++ backend is the modern KDE pattern; Qt Widgets remains a solid choice for dense desktop tools.

## A minimal Kirigami app

```qml title="src/main.qml"
import QtQuick
import QtQuick.Controls as Controls
import org.kde.kirigami as Kirigami

Kirigami.ApplicationWindow {
    id: root
    title: i18n("Notes")
    width: 980
    height: 680

    pageStack.initialPage: Kirigami.ScrollablePage {
        title: i18n("Notes")

        actions: [
            Kirigami.Action {
                text: i18n("New note")
                icon.name: "list-add"
                shortcut: StandardKey.New
                onTriggered: notesModel.addNote()
            }
        ]

        ListView {
            model: notesModel
            delegate: Kirigami.AbstractCard {
                contentItem: Controls.Label {
                    text: model.title
                    wrapMode: Text.WordWrap
                }
                onClicked: root.pageStack.push(detailPage, { note: model })
            }
        }
    }
}
```

```cpp title="src/main.cpp"
#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQuickStyle>

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);
    app.setApplicationName(QStringLiteral("Notes"));
    app.setApplicationVersion(QStringLiteral("0.1.0"));
    app.setDesktopFileName(QStringLiteral("io.github.yourname.Notes"));

    QQuickStyle::setStyle(QStringLiteral("org.kde.desktop"));

    QQmlApplicationEngine engine;
    engine.loadFromModule("Notes", "Main");
    return app.exec();
}
```

The QML and C++ snippets are illustrative; the exact imports, backend model, and CMake wiring depend on your project. For a KDE app, initialize `KAboutData`, `KLocalizedString`, and the translation domain before loading QML. Use `KAboutData::setApplicationData()` so the about dialog and bug reports have the right metadata.

## Kirigami patterns

| Need | Pattern |
| --- | --- |
| Master–detail | `Kirigami.PageRow` |
| Quick action sheet | `Kirigami.OverlaySheet` |
| Dialog | `Kirigami.Dialog` / `Kirigami.PromptDialog` |
| Settings | `Kirigami.ScrollablePage` + `Kirigami.FormLayout` |
| Cards | `Kirigami.AbstractCard` / `Kirigami.Card` |
| Context menu | `Controls.Menu` |
| Adaptive toolbar | `Kirigami.Action` + page actions |

`Kirigami.PageRow` is the key adaptive primitive: on wide windows it shows the list and detail side by side; on narrow windows it pushes the detail page with a back button.

## Spacing, colors, and units

Use `Kirigami.Units` and `Kirigami.Theme` instead of hardcoded pixels and colors.

```qml
import org.kde.kirigami as Kirigami

Controls.Label {
    font.pixelSize: Kirigami.Units.gridUnit
    color: Kirigami.Theme.textColor
    padding: Kirigami.Units.smallSpacing
}
```

- `Kirigami.Units.gridUnit` scales with the user's font size.
- `Kirigami.Theme` adapts to the color scheme and platform.
- Use Breeze icons (`icon.name: "document-open"`) for KDE consistency.
- Do not hardcode `width: 800` for content; let layouts expand.
- Test at 100%, 125%, 150%, and 200% scaling.

## Settings with KConfig

KDE apps use KConfig for settings. Define a schema (`.kcfg`) and generate a configuration class, or use `KConfigGroup` directly for small apps.

```cpp title="Reading and writing settings"
KSharedConfigPtr config = KSharedConfig::openConfig();
KConfigGroup general(config, QStringLiteral("General"));

int width = general.readEntry("windowWidth", 980);
general.writeEntry("windowWidth", width);
config->sync();
```

For settings UI, use `KConfigDialog` with `.kcfg`-generated widgets, or a Kirigami form bound to the config object. Apply changes immediately and provide a reset action.

For non-KDE deployments, `QSettings` is the portable equivalent. Do not write INI files by hand if the platform already has a settings system.

## Notifications and integration

- **[KNotification](https://api.kde.org/knotification.html)** for desktop notifications, with actions and urgency.
- **KIO** for network-transparent file access, trash, and remote URLs. Do not assume every `QUrl` is a local file.
- **KWallet** / Secret Service for credentials.
- **[KDBusService](https://api.kde.org/kdbusservice.html)** for single-instance behavior and activation. `QApplication` alone does not register a D-Bus name; use `KDBusService(KDBusService::Unique)` for KDE/Qt, or `QLockFile`/a custom D-Bus name for non-KDE Qt.
- **MPRIS** via Qt DBus for media apps.
- **XDG portals** for file dialogs, screen capture, and global shortcuts, especially in Flatpak.

```cpp title="A simple notification"
KNotification *notification = new KNotification(QStringLiteral("export-finished"));
notification->setText(i18n("Export finished"));

KNotificationAction *openAction = notification->addAction(i18n("Open folder"));
connect(openAction, &KNotificationAction::activated,
        this, &Window::openExportFolder);

notification->sendEvent();
```

KDE notifications also need a `.notifyrc` file that declares the event, its icon, and its actions. Install it to `knotifications6/` and make sure the application name or `setComponentName()` matches.

## Qt 6.10: high contrast, vector, and models

[Qt 6.10](https://www.qt.io/blog/qt-6.10-released) adds accessibility and UI features that are relevant on Ubuntu 26.04:

- **High contrast:** [`QStyleHints::accessibility()->contrastPreference()`](https://www.qt.io/blog/high-contrast-mode-in-qt-6.10) reports the platform preference, and the Fusion/Basic styles strengthen control outlines when it is enabled.
- **Animated vector graphics:** `VectorImage` renders animated SVG and Lottie in the Qt Quick scene graph; use `svgtoqml`/`lottietoqml` for precompiled assets. Treat user-supplied vector files as untrusted.
- **Models and controls:** `SearchField`, `QRangeModel`, `Synchronizer` (tech preview), `TreeModel`, `SortFilterProxyModel`, and `delegateModelAccess` reduce C++/QML boilerplate.
- **QML performance:** compile QML ahead of time (`qmlcachegen`), run `qmllint`, inspect the scene graph with `QSG_INFO=1`, and choose the render loop deliberately (`QSG_RENDER_LOOP`).
- **KDE integration:** call `KCrash::initialize()` early, use `KDBusService` for activation, and keep KIO jobs asynchronous.
- **Wayland, scaling, and input:** test 125/150/200%, set the high-DPI rounding policy deliberately, and do not set `QT_IM_MODULE` on Wayland; let the compositor's input method handle text.

`KDE Frameworks 6.24` requires Qt 6.8 or newer. Add KIO/KCrash components only when the app actually uses them; the CMake example above keeps the dependency set to what the example needs.

## Build and package

A minimal CMake setup for Qt Quick. The example uses [GNUInstallDirs](https://cmake.org/cmake/help/latest/module/GNUInstallDirs.html) so `${CMAKE_INSTALL_BINDIR}` is defined:

```cmake title="CMakeLists.txt"
cmake_minimum_required(VERSION 3.21)
project(notes VERSION 0.1.0 LANGUAGES CXX)

include(GNUInstallDirs)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)

find_package(Qt6 6.10 REQUIRED COMPONENTS Quick Gui)
find_package(KF6 REQUIRED COMPONENTS Kirigami I18n Config CoreAddons ConfigWidgets DBusAddons Notifications)

qt_add_executable(notes src/main.cpp)
qt_add_qml_module(notes
    URI Notes
    VERSION 1.0
    QML_FILES src/main.qml
)

target_link_libraries(notes PRIVATE
    Qt6::Quick
    Qt6::Gui
    KF6::Kirigami
    KF6::I18n
    KF6::ConfigCore
    KF6::CoreAddons
    KF6::ConfigWidgets
    KF6::DBusAddons
    KF6::Notifications
)

install(TARGETS notes RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR})
```

Flatpak uses the KDE runtime:

```yaml title="io.github.yourname.Notes.yml"
id: io.github.yourname.Notes
runtime: org.kde.Platform
runtime-version: '6.10'
sdk: org.kde.Sdk
command: notes

finish-args:
  - --socket=wayland
  - --socket=fallback-x11
  - --share=ipc
  - --device=dri

modules:
  - name: notes
    buildsystem: cmake-ninja
    sources:
      - type: dir
        path: .
```

The KDE runtime includes Kirigami and the KDE Frameworks, so you do not need to bundle them.

## Accessibility

- Set `Accessible.name`, `Accessible.description`, and `Accessible.role` on custom QML items.
- Use `Controls.Button`, `Controls.CheckBox`, and other native controls, which expose semantics automatically.
- Ensure keyboard navigation works: `Keys.onPressed`, `focus: true`, and a logical tab order.
- Test with Orca and Accerciser.
- Do not rely on color alone; use icons and text.
- Respect `Kirigami.Settings.isMobile` only as a layout hint, not as an excuse to remove desktop affordances.

## Testing

- **QtTest** for C++ units and widget tests.
- **QML TestCase** (`qmltestrunner`) for QML components.
- **GammaRay** for runtime inspection of the QML scene and signals.
- **`QT_LOGGING_RULES`** for categorized debug output.
- **`QT_QPA_PLATFORM=offscreen`** for headless tests.
- **`dbus-run-session`** for tests that need a session bus.

## Common pitfalls

| Pitfall | Fix |
| --- | --- |
| Mixing Qt 5 and Qt 6 | Build against one Qt major version; use the distro's Qt 6 |
| Hardcoded pixel sizes | Use `Kirigami.Units` |
| Hardcoded colors | Use `Kirigami.Theme` |
| JavaScript logic in bindings | Move it to C++ or a JS function with clear inputs |
| QML scene too deep | Flatten; use `Loader` and `ListView` |
| Touching QWidgets from a worker | Use signals/slots to the GUI thread |
| Missing app ID | `QGuiApplication::setDesktopFileName()` |
| No high-DPI support | Qt 6 handles it; test and avoid manual scaling |
| File access outside the sandbox | Use KIO/portals and XDG paths |
| No accessible names on custom items | Set `Accessible.name` and role |


## Sources

- [Qt 6.10 release](https://www.qt.io/blog/qt-6.10-released)
- [Qt 6.10 high contrast](https://www.qt.io/blog/high-contrast-mode-in-qt-6.10)
- [Qt 6 documentation](https://doc.qt.io/qt-6/)
- [KDE Frameworks 6.24](https://kde.org/announcements/frameworks/6/6.24.0/)
- [KNotifications](https://api.kde.org/knotification.html)
- [KDBusService](https://api.kde.org/kdbusservice.html)
- [GNUInstallDirs](https://cmake.org/cmake/help/latest/module/GNUInstallDirs.html)

Next: [Rust on the Desktop](/engineering/rust/) — memory safety without giving up native GTK.
