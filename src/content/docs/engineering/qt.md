---
title: Qt & Kirigami
description: "Building native KDE apps with Qt 6.10+ and Kirigami: a persistent C++/QML project, XDG storage, QAbstractListModel, CMake, KConfig, KNotification, KIO, testing, accessibility, and Flatpak."
---

Qt is the other major Linux desktop stack. It is mature, widely used, cross-platform, and backed by a deep tooling ecosystem. **Kirigami** is KDE's adaptive UI framework built on Qt Quick; it gives you the navigation, sheets, cards, and responsive layout that make an app feel at home on Plasma.

If your primary audience is KDE, Qt + Kirigami is a direct path to native behavior. If you need one codebase across desktop, mobile, and embedded targets, Qt is often the pragmatic choice — provided you still do the platform integration work.

:::note[Two reference baselines]
Ubuntu 26.04 ships Qt 6.10.2, KDE Frameworks 6.24, and Plasma 6.6. Fedora 45 KDE, the reference environment for this chapter, ships Qt 6.11, KDE Frameworks 6.30+, and Plasma 6.7 or newer. The example uses APIs available in both: treat Qt 6.10/KF 6.24 as the compatibility floor and test on Fedora for the current stack. Use `QT_VERSION_CHECK` when you also support older releases; API availability is compile-time, not a runtime guard. Qt 6.8 LTS is commercially maintained; open-source users should track their distribution's Qt or the latest stable.
:::

:::caution[Verification status]
Source review: 2026-11-11. Runtime verification: pending on Fedora 45. This chapter is source-reviewed and illustrative in this revision: it has not been compiled or run on Fedora 45. The preparation environment did not include Qt 6 or KDE Frameworks development packages, Toolbx, or `mock`. The code is complete enough to build; run the commands in the [Fedora + KDE validation checklist](/targets/fedora-kde/#validation-checklist) on the exact target before treating the path as validated. API references are in [Sources](#sources).
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

The [Fedora + KDE target](/targets/fedora-kde/) is the reference environment for this chapter. The app keeps the data and persistence in C++, the view in QML, and the file format in a small store that can be tested without a window:

```text
notes/
├── CMakeLists.txt
├── LICENSE
├── src/
│   ├── main.cpp
│   ├── Main.qml
│   ├── NotesModel.h
│   ├── NotesModel.cpp
│   ├── NotesStore.h
│   └── NotesStore.cpp
├── tests/
│   ├── tst_notesmodel.cpp
│   └── tst_notesstore.cpp
├── data/
│   ├── io.github.yourname.Notes.desktop
│   ├── io.github.yourname.Notes.metainfo.xml
│   └── io.github.yourname.Notes.svg
└── io.github.yourname.Notes.yml
```

The desktop entry, metainfo, icon, Flatpak ID, and `setDesktopFileName()` all use `io.github.yourname.Notes`. The binary stays `notes`. That separation is normal: the app ID identifies the desktop application, while the executable name identifies the process. Add a `LICENSE` file that matches the metainfo's `project_license`.

## A minimal Kirigami app

### The model

`QAbstractListModel` is the boundary between C++ data and QML. Persistence is a separate `NotesStore`, so the file format can be tested without a display.

```cpp title="src/NotesStore.h"
#pragma once

#include <QList>
#include <QString>

struct Note {
    QString title;
    QString body;
};

class NotesStore
{
public:
    explicit NotesStore(QString filePath = {});

    QString filePath() const;
    bool exists() const;
    QList<Note> load(QString *error = nullptr) const;
    bool save(const QList<Note> &notes, QString *error = nullptr) const;

private:
    QString m_filePath;
};
```

```cpp title="src/NotesStore.cpp"
#include "NotesStore.h"

#include <QDir>
#include <QFile>
#include <QFileInfo>
#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonParseError>
#include <QSaveFile>
#include <QStandardPaths>

#include <utility>

namespace {
constexpr int kSchemaVersion = 1;
}

NotesStore::NotesStore(QString filePath)
    : m_filePath(std::move(filePath))
{
    if (m_filePath.isEmpty()) {
        const QString dir = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation);
        m_filePath = dir + QStringLiteral("/notes.json");
    }
}

QString NotesStore::filePath() const
{
    return m_filePath;
}

bool NotesStore::exists() const
{
    return QFileInfo::exists(m_filePath);
}

QList<Note> NotesStore::load(QString *error) const
{
    QFile file(m_filePath);
    if (!file.exists()) {
        return {};
    }
    if (!file.open(QIODevice::ReadOnly)) {
        if (error) *error = file.errorString();
        return {};
    }

    QJsonParseError parseError;
    const QJsonDocument document = QJsonDocument::fromJson(file.readAll(), &parseError);
    if (parseError.error != QJsonParseError::NoError || !document.isObject()) {
        if (error) *error = parseError.errorString();
        return {};
    }

    const QJsonObject root = document.object();
    if (root.value(QStringLiteral("version")).toInt() != kSchemaVersion) {
        if (error) *error = QStringLiteral("Unsupported notes file version.");
        return {};
    }

    QList<Note> notes;
    const QJsonArray array = root.value(QStringLiteral("notes")).toArray();
    for (const QJsonValue &value : array) {
        const QJsonObject object = value.toObject();
        notes.append({
            object.value(QStringLiteral("title")).toString(),
            object.value(QStringLiteral("body")).toString(),
        });
    }
    return notes;
}

bool NotesStore::save(const QList<Note> &notes, QString *error) const
{
    QJsonArray array;
    for (const Note &note : notes) {
        array.append(QJsonObject{
            {QStringLiteral("title"), note.title},
            {QStringLiteral("body"), note.body},
        });
    }

    const QJsonObject root{
        {QStringLiteral("version"), kSchemaVersion},
        {QStringLiteral("notes"), array},
    };

    QDir().mkpath(QFileInfo(m_filePath).absolutePath());

    QSaveFile file(m_filePath);
    if (!file.open(QIODevice::WriteOnly)) {
        if (error) *error = file.errorString();
        return false;
    }

    const QByteArray data = QJsonDocument(root).toJson(QJsonDocument::Indented);
    if (file.write(data) != data.size()) {
        if (error) *error = file.errorString();
        file.cancelWriting();
        return false;
    }

    if (!file.commit()) {
        if (error) *error = file.errorString();
        return false;
    }

    return true;
}
```

The default path is `QStandardPaths::AppDataLocation + "/notes.json"`. With `applicationName` set to `notes`, that is `$XDG_DATA_HOME/notes/notes.json`; inside the Flatpak sandbox it is `~/.var/app/io.github.yourname.Notes/data/notes/notes.json`. `QSaveFile` writes to a temporary file and commits atomically, so a crash cannot leave a half-written notes file.

`kSchemaVersion` is the migration hook. When the format changes, read the old version, convert it, write the new file atomically, and keep the old file until the migration succeeds. The rules are in [The XDG Contract](/platform/xdg/#migration-and-compatibility).

```cpp title="src/NotesModel.h"
#pragma once

#include <QAbstractListModel>
#include <QByteArray>
#include <QHash>
#include <QList>
#include <QString>
#include <QVariant>

#include "NotesStore.h"

class NotesModel : public QAbstractListModel
{
    Q_OBJECT
    Q_PROPERTY(QString lastError READ lastError NOTIFY errorChanged)

public:
    enum Role {
        TitleRole = Qt::UserRole + 1,
        BodyRole,
    };

    explicit NotesModel(QObject *parent = nullptr);
    explicit NotesModel(NotesStore store, QObject *parent = nullptr);

    int rowCount(const QModelIndex &parent = QModelIndex()) const override;
    QVariant data(const QModelIndex &index, int role) const override;
    QHash<int, QByteArray> roleNames() const override;

    QString lastError() const;

    Q_INVOKABLE QString titleAt(int row) const;
    Q_INVOKABLE QString bodyAt(int row) const;
    Q_INVOKABLE void addNote(const QString &title, const QString &body);
    Q_INVOKABLE void updateNote(int row, const QString &title, const QString &body);
    Q_INVOKABLE void removeNote(int row);
    Q_INVOKABLE bool save();
    Q_INVOKABLE void reload();

signals:
    void errorChanged(const QString &message);

private:
    void setError(const QString &message);

    NotesStore m_store;
    QList<Note> m_notes;
    QString m_lastError;
};
```

```cpp title="src/NotesModel.cpp"
#include "NotesModel.h"

#include <utility>

NotesModel::NotesModel(QObject *parent)
    : NotesModel(NotesStore(), parent)
{
}

NotesModel::NotesModel(NotesStore store, QObject *parent)
    : QAbstractListModel(parent)
    , m_store(std::move(store))
{
    QString error;
    m_notes = m_store.load(&error);
    if (!error.isEmpty()) {
        setError(error);
        return;
    }

    if (m_notes.isEmpty() && !m_store.exists()) {
        m_notes = {
            {tr("Welcome"),
             tr("This note is stored in your XDG data directory and survives restarts.")},
            {tr("Keyboard first"),
             tr("Press Ctrl+N to create a note. Every action should be reachable without a mouse.")},
        };
        save();
    }
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

QString NotesModel::lastError() const
{
    return m_lastError;
}

QString NotesModel::titleAt(int row) const
{
    return row >= 0 && row < m_notes.size() ? m_notes.at(row).title : QString();
}

QString NotesModel::bodyAt(int row) const
{
    return row >= 0 && row < m_notes.size() ? m_notes.at(row).body : QString();
}

void NotesModel::addNote(const QString &title, const QString &body)
{
    beginInsertRows(QModelIndex(), 0, 0);
    m_notes.prepend({title, body});
    endInsertRows();
    save();
}

void NotesModel::updateNote(int row, const QString &title, const QString &body)
{
    if (row < 0 || row >= m_notes.size()) {
        return;
    }

    m_notes[row] = {title, body};
    const QModelIndex changed = index(row, 0);
    emit dataChanged(changed, changed, {TitleRole, BodyRole});
    save();
}

void NotesModel::removeNote(int row)
{
    if (row < 0 || row >= m_notes.size()) {
        return;
    }

    beginRemoveRows(QModelIndex(), row, row);
    m_notes.removeAt(row);
    endRemoveRows();
    save();
}

bool NotesModel::save()
{
    QString error;
    if (!m_store.save(m_notes, &error)) {
        setError(error);
        return false;
    }

    setError(QString());
    return true;
}

void NotesModel::reload()
{
    QString error;
    const QList<Note> notes = m_store.load(&error);
    if (!error.isEmpty()) {
        setError(error);
        return;
    }

    beginResetModel();
    m_notes = notes;
    endResetModel();
    setError(QString());
}

void NotesModel::setError(const QString &message)
{
    if (m_lastError == message) {
        return;
    }

    m_lastError = message;
    emit errorChanged(m_lastError);
}
```

### The application entry point

Set the application identity, install the QML translation context, and activate the existing window when a second launch arrives.

```cpp title="src/main.cpp"
#include <QCoreApplication>
#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QQuickStyle>
#include <QQuickWindow>

#include <KAboutData>
#include <KDBusService>
#include <KLocalizedContext>
#include <KLocalizedString>

#include "NotesModel.h"

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);
    QCoreApplication::setApplicationName(QStringLiteral("notes"));
    QGuiApplication::setDesktopFileName(QStringLiteral("io.github.yourname.Notes"));
    QQuickStyle::setStyle(QStringLiteral("org.kde.desktop"));
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

    KDBusService service(KDBusService::Unique);

    NotesModel notesModel;

    QQmlApplicationEngine engine;
    auto *context = new KLocalizedContext(&engine);
    context->setTranslationDomain(QStringLiteral("notes"));
    engine.rootContext()->setContextObject(context);
    engine.rootContext()->setContextProperty(QStringLiteral("notesModel"), &notesModel);

    QObject::connect(&service, &KDBusService::activateRequested, &engine,
        [&engine](const QStringList &, const QString &) {
            const auto windows = engine.rootObjects();
            if (windows.isEmpty()) {
                return;
            }
            if (auto *window = qobject_cast<QQuickWindow *>(windows.first())) {
                window->show();
                window->raise();
                window->requestActivate();
            }
        });

    engine.loadFromModule("Notes", "Main");
    if (engine.rootObjects().isEmpty()) {
        return -1;
    }

    return app.exec();
}
```

### The QML view

The list page and the editor page share the model. The add, save, and delete actions call invokable methods; QML never mutates the C++ list directly. A storage failure appears as an inline message instead of a silent loss.

```qml title="src/Main.qml"
import QtQuick
import QtQuick.Controls as Controls
import QtQuick.Layouts
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
                onTriggered: {
                    notesModel.addNote(i18n("Untitled note"), QString())
                    root.pageStack.push(detailPage, { noteIndex: 0 })
                }
            }
        ]

        ColumnLayout {
            anchors.fill: parent
            spacing: 0

            Kirigami.InlineMessage {
                Layout.fillWidth: true
                visible: notesModel.lastError.length > 0
                text: notesModel.lastError
                type: Kirigami.MessageType.Error
            }

            ListView {
                Layout.fillWidth: true
                Layout.fillHeight: true
                clip: true
                model: notesModel

                delegate: Controls.ItemDelegate {
                    required property int index
                    required property string title

                    width: ListView.view.width
                    text: title

                    onClicked: root.pageStack.push(detailPage, { noteIndex: index })
                }
            }
        }
    }

    Component {
        id: detailPage

        Kirigami.ScrollablePage {
            id: editor
            property int noteIndex: -1

            title: i18n("Edit note")

            actions: [
                Kirigami.Action {
                    text: i18n("Delete")
                    icon.name: "edit-delete"
                    onTriggered: {
                        notesModel.removeNote(editor.noteIndex)
                        root.pageStack.pop()
                    }
                },
                Kirigami.Action {
                    text: i18n("Save")
                    icon.name: "document-save"
                    shortcut: StandardKey.Save
                    onTriggered: {
                        notesModel.updateNote(editor.noteIndex, titleField.text, bodyField.text)
                        root.pageStack.pop()
                    }
                }
            ]

            ColumnLayout {
                anchors.fill: parent

                Controls.TextField {
                    id: titleField
                    Layout.fillWidth: true
                    text: notesModel.titleAt(editor.noteIndex)
                    placeholderText: i18n("Title")
                }

                Controls.TextArea {
                    id: bodyField
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    text: notesModel.bodyAt(editor.noteIndex)
                    placeholderText: i18n("Write a note…")
                    wrapMode: TextEdit.Wrap
                }
            }
        }
    }
}
```

### The build

The QML module URI and the `loadFromModule("Notes", "Main")` call must agree. The file is `Main.qml`, not `main.qml`. The test targets use `Qt6::Test` and run without a display.

```cmake title="CMakeLists.txt"
cmake_minimum_required(VERSION 3.21)
project(notes VERSION 0.1.0 LANGUAGES CXX)

include(GNUInstallDirs)
include(CTest)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)

find_package(Qt6 6.10 REQUIRED COMPONENTS Quick QuickControls2 Gui DBus Core Test)
find_package(KF6 REQUIRED COMPONENTS Kirigami I18n Config CoreAddons DBusAddons)

qt_add_executable(notes
    src/main.cpp
    src/NotesModel.cpp
    src/NotesModel.h
    src/NotesStore.cpp
    src/NotesStore.h
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
    Qt6::Core
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

if(BUILD_TESTING)
    qt_add_executable(tst_notesstore
        tests/tst_notesstore.cpp
        src/NotesStore.cpp
        src/NotesStore.h
    )
    target_include_directories(tst_notesstore PRIVATE src)
    target_link_libraries(tst_notesstore PRIVATE Qt6::Test Qt6::Core)
    add_test(NAME notesstore COMMAND tst_notesstore)

    qt_add_executable(tst_notesmodel
        tests/tst_notesmodel.cpp
        src/NotesModel.cpp
        src/NotesModel.h
        src/NotesStore.cpp
        src/NotesStore.h
    )
    target_include_directories(tst_notesmodel PRIVATE src)
    target_link_libraries(tst_notesmodel PRIVATE Qt6::Test Qt6::Core)
    add_test(NAME notesmodel COMMAND tst_notesmodel)
endif()
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

The CMake file above builds the executable, compiles `Main.qml` into the `Notes` module, registers the two tests, and installs the binary, desktop entry, metainfo, and icon. Build and test it with:

```bash title="Terminal"
cmake -S . -B build -G Ninja
cmake --build build
ctest --test-dir build --output-on-failure
qmllint src/Main.qml
./build/notes
```

### Desktop entry and metainfo

The desktop entry and metainfo use the same app ID as `setDesktopFileName()`. The binary stays `notes`; `StartupWMClass` matches the process class on X11/XWayland.

```ini title="data/io.github.yourname.Notes.desktop"
[Desktop Entry]
Name=Notes
Comment=A small note-taking app
Exec=notes
Icon=io.github.yourname.Notes
Terminal=false
Type=Application
Categories=Utility;TextEditor;
StartupWMClass=notes
```

```xml title="data/io.github.yourname.Notes.metainfo.xml"
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>io.github.yourname.Notes</id>
  <name>Notes</name>
  <summary>A small note-taking app</summary>
  <description>
    <p>Notes is a small local-first note-taking app for KDE Plasma.</p>
  </description>
  <metadata_license>CC0-1.0</metadata_license>
  <project_license>GPL-3.0-or-later</project_license>
  <launchable type="desktop-id">io.github.yourname.Notes.desktop</launchable>
  <url type="homepage">https://example.org/notes</url>
  <developer id="io.github.yourname">
    <name>Your Name</name>
  </developer>
  <provides>
    <binary>notes</binary>
  </provides>
  <categories>
    <category>Utility</category>
    <category>TextEditor</category>
  </categories>
  <releases>
    <release version="0.1.0" date="2026-11-11">
      <description>
        <p>Initial release.</p>
      </description>
    </release>
  </releases>
</component>
```

Use [AppStream & Metadata](/ship/appstream/) for screenshots, release notes, and validation. The icon is `data/io.github.yourname.Notes.svg`, installed into `hicolor/scalable/apps`.

### Flatpak

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

The KDE runtime includes Kirigami and the KDE Frameworks, so you do not need to bundle them. For the Fedora RPM, use the spec in [Packaging & Distribution](/platform/packaging/#rpm-packages); every `find_package` component needs a matching `BuildRequires`.

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

Both test targets are already registered in the CMake file above. They need no display. The store test uses a temporary directory; the model test starts from a valid empty file so it does not depend on the welcome notes.

```cpp title="tests/tst_notesstore.cpp"
#include <QFile>
#include <QTemporaryDir>
#include <QtTest>

#include "NotesStore.h"

class NotesStoreTest : public QObject
{
    Q_OBJECT

private slots:
    void roundTripsNotes();
    void reportsInvalidJson();
};

void NotesStoreTest::roundTripsNotes()
{
    QTemporaryDir dir;
    QVERIFY(dir.isValid());

    NotesStore store(dir.filePath(QStringLiteral("notes.json")));
    const QList<Note> notes{
        {QStringLiteral("One"), QStringLiteral("First body")},
        {QStringLiteral("Two"), QStringLiteral("Second body")},
    };

    QString error;
    QVERIFY2(store.save(notes, &error), qPrintable(error));

    const QList<Note> loaded = store.load(&error);
    QVERIFY2(error.isEmpty(), qPrintable(error));
    QCOMPARE(loaded.size(), 2);
    QCOMPARE(loaded.at(0).title, QStringLiteral("One"));
    QCOMPARE(loaded.at(1).body, QStringLiteral("Second body"));
}

void NotesStoreTest::reportsInvalidJson()
{
    QTemporaryDir dir;
    QVERIFY(dir.isValid());

    QFile file(dir.filePath(QStringLiteral("notes.json")));
    QVERIFY(file.open(QIODevice::WriteOnly));
    file.write("{not json");
    file.close();

    NotesStore store(file.fileName());
    QString error;
    const QList<Note> loaded = store.load(&error);
    QVERIFY(loaded.isEmpty());
    QVERIFY(!error.isEmpty());
}

QTEST_GUILESS_MAIN(NotesStoreTest)
#include "tst_notesstore.moc"
```

```cpp title="tests/tst_notesmodel.cpp"
#include <QTemporaryDir>
#include <QtTest>

#include "NotesModel.h"

class NotesModelTest : public QObject
{
    Q_OBJECT

private slots:
    void addsUpdatesAndRemoves();
};

void NotesModelTest::addsUpdatesAndRemoves()
{
    QTemporaryDir dir;
    QVERIFY(dir.isValid());

    NotesStore store(dir.filePath(QStringLiteral("notes.json")));
    QString error;
    QVERIFY2(store.save(QList<Note>(), &error), qPrintable(error));

    NotesModel model(store);
    QCOMPARE(model.rowCount(), 0);
    QVERIFY(model.lastError().isEmpty());

    model.addNote(QStringLiteral("Buy milk"), QString());
    QCOMPARE(model.rowCount(), 1);
    QCOMPARE(model.titleAt(0), QStringLiteral("Buy milk"));

    model.updateNote(0, QStringLiteral("Buy oat milk"), QStringLiteral("From the shop"));
    QCOMPARE(model.titleAt(0), QStringLiteral("Buy oat milk"));
    QCOMPARE(model.bodyAt(0), QStringLiteral("From the shop"));

    model.removeNote(0);
    QCOMPARE(model.rowCount(), 0);
}

QTEST_GUILESS_MAIN(NotesModelTest)
#include "tst_notesmodel.moc"
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
| Missing app ID | `QGuiApplication::setDesktopFileName()` and matching desktop/metainfo IDs |
| Notes stay only in memory | Use `NotesStore` with `QSaveFile`; load on startup and save on every mutation |
| QML `i18n()` is empty | Install `KLocalizedContext` before `loadFromModule()` |
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
