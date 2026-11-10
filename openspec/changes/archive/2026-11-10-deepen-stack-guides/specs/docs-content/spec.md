# Spec Delta

## ADDED Requirements

### Requirement: Complete stack chapters

Each stack chapter SHALL be complete enough for a reader to start a project, not only to read isolated API snippets.

#### Scenario: Reader starts a Qt project

- **WHEN** a reader follows the Qt chapter
- **THEN** the chapter provides a file tree, a matching CMake file, a complete `main.cpp`, a complete `Main.qml`, and a `QAbstractListModel` with an add action

#### Scenario: Reader starts a Rust project

- **WHEN** a reader follows the Rust chapter
- **THEN** the chapter provides a `Cargo.toml`, a complete gtk-rs `main.rs` with a window action and a list, and a tested domain module

#### Scenario: Reader tests a GTK project

- **WHEN** a reader reaches the testing section of the GTK chapter
- **THEN** the chapter shows a concrete model test and names the metadata and UI checks to run

#### Scenario: Reader checks accessibility

- **WHEN** a reader reaches the accessibility section of any stack chapter
- **THEN** the chapter names the toolkit's accessible properties or roles and a way to test them with Orca or Accerciser

#### Scenario: Snippet is not compiled

- **WHEN** a code block was not compiled in the guide's environment
- **THEN** the chapter labels it as illustrative and links to the API documentation
