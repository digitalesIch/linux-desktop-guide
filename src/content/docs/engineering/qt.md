---
title: Qt & Kirigami
description: "Building native KDE apps with Qt 6.10 and Kirigami: QML vs Widgets, adaptive pages, KConfig, KNotification, KIO, CMake, accessibility, and Flatpak packaging."
---

Qt is the other great Linux desktop stack. It is mature, fast, cross-platform, and backed by a deep tooling ecosystem. **Kirigami** is KDE's adaptive UI framework built on Qt Quick; it gives you the navigation, sheets, cards, and responsive layout that make an app feel at home on Plasma.

If your primary audience is KDE, Qt + Kirigami is the shortest path to native. If you need one codebase across Linux, Windows, macOS, Android, and embedded, Qt is often the pragmatic choice — provided you still do the platform integration work.

:::note[Versions in Ubuntu 26.04]
Qt 6.10.2, KDE Frameworks 6.24, KDE Plasma 6.6. Qt 6.8 LTS is a conservative target if you need broader distribution support. Target Qt 6.8+ APIs and guard newer ones at runtime.
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

For a KDE app, initialize `KAboutData`, `KLocalizedString`, and the translation domain before loading QML. Use `KAboutData::setApplicationData()` so the about dialog and bug reports have the right metadata.

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

- **KNotification** for desktop notifications, with actions and urgency.
- **KIO** for network-transparent file access, trash, and remote URLs. Do not assume every `QUrl` is a local file.
- **KWallet** / Secret Service for credentials.
- **KDBusService** for single-instance behavior and activation.
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

## Build and package

A minimal CMake setup for Qt Quick:

```cmake title="CMakeLists.txt"
cmake_minimum_required(VERSION 3.21)
project(notes VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)

find_package(Qt6 6.8 REQUIRED COMPONENTS Quick Gui)
find_package(KF6 REQUIRED COMPONENTS Kirigami I18n Config Notification)

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
    KF6::Notification
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

## Key takeaways

- Qt + Kirigami is the native KDE stack; Qt Widgets is still excellent for dense tools.
- Use `Kirigami.PageRow`, `Kirigami.Units`, and `Kirigami.Theme` instead of inventing adaptive layout.
- KConfig, KNotification, KIO, and KWallet are the integration primitives.
- Set the desktop file name and application metadata; the desktop needs them.
- Test accessibility explicitly; QML does not infer everything.
- Ship with the KDE runtime on Flatpak and keep static permissions minimal.

Next: [Rust on the Desktop](/engineering/rust/) — memory safety without giving up native GTK.
