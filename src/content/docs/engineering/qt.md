---
title: Qt & Kirigami
description: "Building native KDE apps with Qt 6.10 and Kirigami: a complete C++/QML project, QAbstractListModel, CMake, KConfig, KNotification, KIO, testing, accessibility, and Flatpak."
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

## Project skeleton

A small Qt/Kirigami app keeps the model in C++ and the view in QML:

```text
notes/
├── CMakeLists.txt
├── src/
│   ├── main.cpp
│   ├── Main.qml
│   ├── NotesModel.h
│   └── NotesModel.cpp
├── data/
│   ├── io.github.yourname.Notes.desktop
│   ├── io.github.yourname.Notes.metainfo.xml
│   └── io.github.yourname.Notes.svg
└── io.github.yourname.Notes.yml
```

The desktop entry, AppStream metadata, and Flatpak manifest follow the same rules as the [first-app tutorial](/start/first-app/); only the build system and UI layer change. The example below is illustrative: build it against Qt 6.10 and KDE Frameworks 6.24.

## A minimal Kirigami app

### The model

`QAbstractListModel` is the stable boundary between C++ data and QML. Keep it small, expose roles, and make mutations invokable.

```cpp title="src/NotesModel.h"
#pragma once

#include <QAbstractListModel>
#include <QByteArray>
#include <QHash>
#include <QList>
#include <QString>
#include <QVariant>

class NotesModel : public QAbstractListModel
{
    Q_OBJECT

public:
    enum Role {
        TitleRole = Qt::UserRole + 1,
        BodyRole,
    };

    explicit NotesModel(QObject *parent = nullptr);

    int rowCount(const QModelIndex &parent = QModelIndex()) const override;
    QVariant data(const QModelIndex &index, int role) const override;
    QHash<int, QByteArray> roleNames() const override;

    Q_INVOKABLE void addNote(const QString &title, const QString &body);

private:
    struct Note {
        QString title;
        QString body;
    };

    QList<Note> m_notes;
};
```

```cpp title="src/NotesModel.cpp"
#include "NotesModel.h"

NotesModel::NotesModel(QObject *parent)
    : QAbstractListModel(parent)
{
    m_notes.append({
        QStringLiteral("Welcome"),
        QStringLiteral("This note lives in the model, not in the QML file."),
    });
}

int NotesModel::rowCount(const QModelIndex &parent) const
{
    return parent.isValid() ? 0 : m_notes.size();
}

QVariant NotesModel::data(const QModelIndex &index, int role) const
{
    if (!index.isValid() || index.row() < 0 || index.row() >= m_notes.size()) {
        return {};
    }

    const Note &note = m_notes.at(index.row());
    switch (role) {
    case TitleRole:
        return note.title;
    case BodyRole:
        return note.body;
    default:
        return {};
    }
}

QHash<int, QByteArray> NotesModel::roleNames() const
{
    return {
        {TitleRole, "title"},
        {BodyRole, "body"},
    };
}

void NotesModel::addNote(const QString &title, const QString &body)
{
    const int row = m_notes.size();
    beginInsertRows(QModelIndex(), row, row);
    m_notes.append({title, body});
    endInsertRows();
}
```

### The application entry point

Set the translation domain before creating `KAboutData`, register a unique D-Bus name for single-instance behavior, and expose the model to QML as a context property.

```cpp title="src/main.cpp"
#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QQuickStyle>

#include <KAboutData>
#include <KDBusService>
#include <KLocalizedString>

#include "NotesModel.h"

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);
    KLocalizedString::setApplicationDomain("notes");

    KAboutData about(
        QStringLiteral("notes"),
        i18n("Notes"),
        QStringLiteral("0.1.0"),
        i18n("A small note-taking app"),
        KAboutLicense::GPL_V3,
        i18n("© 2026 Your Name"),
        QString(),
        QStringLiteral("https://example.org/notes"));
    KAboutData::setApplicationData(about);

    QQuickStyle::setStyle(QStringLiteral("org.kde.desktop"));
    KDBusService service(KDBusService::Unique);

    NotesModel notesModel;

    QQmlApplicationEngine engine;
    engine.rootContext()->setContextProperty(QStringLiteral("notesModel"), &notesModel);
    engine.loadFromModule("Notes", "Main");

    return app.exec();
}
```

### The QML view

The list and the detail page share one model. The add action is declared once on the page and is keyboard-accessible through `StandardKey.New`.

```qml title="src/Main.qml"
import QtQuick
import QtQuick.Controls as Controls
import org.kde.kirigami as Kirigami

Kirigami.ApplicationWindow {
    id: root
    title: i18n("Notes")
    width: 980
    height: 680

    pageStack.initialPage: Kirigami.Page {
        title: i18n("Notes")

        actions: [
            Kirigami.Action {
                text: i18n("New note")
                icon.name: "list-add"
                shortcut: StandardKey.New
                onTriggered: notesModel.addNote(
                    i18n("Untitled note"),
                    i18n("Start writing…")
                )
            }
        ]

        ListView {
            anchors.fill: parent
            clip: true
            model: notesModel

            delegate: Controls.ItemDelegate {
                required property string title
                required property string body

                width: ListView.view.width
                text: title

                onClicked: root.pageStack.push(detailPage, {
                    noteTitle: title,
                    noteBody: body
                })
            }
        }
    }

    Component {
        id: detailPage

        Kirigami.ScrollablePage {
            property string noteTitle
            property string noteBody

            title: noteTitle

            Controls.Label {
                text: noteBody
                wrapMode: Text.WordWrap
            }
        }
    }
}
```

### The build

The QML module URI and the `loadFromModule("Notes", "Main")` call must agree. The file is `Main.qml`, not `main.qml`.

```cmake title="CMakeLists.txt"
cmake_minimum_required(VERSION 3.21)
project(notes VERSION 0.1.0 LANGUAGES CXX)

include(GNUInstallDirs)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)

find_package(Qt6 6.10 REQUIRED COMPONENTS Quick QuickControls2 Gui DBus)
find_package(KF6 REQUIRED COMPONENTS Kirigami I18n Config CoreAddons DBusAddons)

qt_add_executable(notes
    src/main.cpp
    src/NotesModel.cpp
    src/NotesModel.h
)

qt_add_qml_module(notes
    URI Notes
    VERSION 1.0
    QML_FILES src/Main.qml
)

target_link_libraries(notes PRIVATE
    Qt6::Quick
    Qt6::QuickControls2
    Qt6::Gui
    Qt6::DBus
    KF6::Kirigami
    KF6::I18n
    KF6::ConfigCore
    KF6::CoreAddons
    KF6::DBusAddons
)

install(TARGETS notes RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR})
install(FILES data/io.github.yourname.Notes.desktop
    DESTINATION ${CMAKE_INSTALL_DATADIR}/applications)
install(FILES data/io.github.yourname.Notes.metainfo.xml
    DESTINATION ${CMAKE_INSTALL_DATADIR}/metainfo)
install(FILES data/io.github.yourname.Notes.svg
    DESTINATION ${CMAKE_INSTALL_DATADIR}/icons/hicolor/scalable/apps)
```

Build it:

```bash title="Terminal"
cmake -S . -B build -G Ninja
cmake --build build
./build/notes
```

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

For settings UI, use `KConfigDialog` with `.kcfg`-generated widgets, or a Kirigami form bound to the config object. Add `KF6::ConfigWidgets` to CMake when you use `KConfigDialog`. Apply changes immediately and provide a reset action.

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

KDE notifications also need a `.notifyrc` file that declares the event, its icon, and its actions. Install it to `knotifications6/` and make sure the application name or `setComponentName()` matches. Add `KF6::Notifications` to CMake when you use `KNotification`.

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

The CMake file above builds the executable, compiles `Main.qml` into the `Notes` module, and installs the binary plus the desktop entry, metainfo, and icon. Build it with:

```bash title="Terminal"
cmake -S . -B build -G Ninja
cmake --build build
./build/notes
```

Flatpak uses the KDE runtime:
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

## Async and I/O

QML bindings run on the GUI thread. Move blocking file and network work to KIO jobs or a worker, then deliver results through signals.

```cpp title="A KIO copy job"
#include <KIO/CopyJob>
#include <KJob>

auto *job = KIO::copy(source, destination, KIO::Overwrite);
connect(job, &KJob::result, this, [](KJob *job) {
    if (job->error()) {
        qWarning() << "copy failed:" << job->errorString();
    }
});
```

- KIO handles local files, trash, and remote URLs; add `KF6::KIO` to CMake when you use it.
- For CPU-bound work, use `QtConcurrent::run` with a `QFutureWatcher`, or a `QThread`; never touch QML objects from the worker.
- Prefer `QUrl` and KIO over raw `QFile` paths for user-selected files. Under Flatpak, KIO uses the FileChooser portal.
- Cancel long jobs when the page closes; connect the page's `Component.onDestruction` or the job's cancel signal.

## Accessibility

```qml title="Accessible controls"
Controls.Button {
    text: i18n("Delete")
    Accessible.name: text
    Accessible.description: i18n("Delete the selected note")
}
```

- Set `Accessible.name`, `Accessible.description`, and `Accessible.role` on custom QML items; native controls already expose semantics.
- Keep keyboard navigation logical: `focus: true`, a visible focus ring, and actions instead of ad-hoc `Keys.onPressed` handlers.
- Test with Orca and Accerciser. Qt 6.10 exposes the platform contrast preference through `QStyleHints::accessibility()->contrastPreference()`.
- Do not rely on color alone; pair it with text or an icon.
- Treat `Kirigami.Settings.isMobile` as a layout hint, not a reason to remove desktop affordances.

## Testing

A model test needs no display. Put the model in a small target and link `Qt6::Test`:

```cpp title="tests/tst_notesmodel.cpp"
#include <QtTest>
#include "NotesModel.h"

class NotesModelTest : public QObject
{
    Q_OBJECT

private slots:
    void addsNote();
};

void NotesModelTest::addsNote()
{
    NotesModel model;
    const int before = model.rowCount();

    model.addNote(QStringLiteral("Buy milk"), QString());

    QCOMPARE(model.rowCount(), before + 1);
    QCOMPARE(model.data(model.index(before), NotesModel::TitleRole).toString(),
             QStringLiteral("Buy milk"));
}

QTEST_GUILESS_MAIN(NotesModelTest)
#include "tst_notesmodel.moc"
```

```cmake title="Test target"
find_package(Qt6 REQUIRED COMPONENTS Test)
enable_testing()

qt_add_executable(tst_notesmodel
    tests/tst_notesmodel.cpp
    src/NotesModel.cpp
    src/NotesModel.h
)
target_include_directories(tst_notesmodel PRIVATE src)
target_link_libraries(tst_notesmodel PRIVATE Qt6::Test Qt6::Core)
add_test(NAME notesmodel COMMAND tst_notesmodel)
```

Run `ctest --test-dir build --output-on-failure`. For QML components use `qmltestrunner`; for headless runs set `QT_QPA_PLATFORM=offscreen` and wrap session-bus tests in `dbus-run-session`. `GammaRay` inspects the live scene; `QT_LOGGING_RULES` narrows logs.

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
