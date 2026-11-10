project('notes', version: '0.1.0', meson_version: '>=1.3.0')

bindir = get_option('bindir')
datadir = get_option('datadir')

configure_file(
  input: 'src/main.py',
  output: 'notes',
  copy: true,
  install: true,
  install_dir: bindir,
  install_mode: 'rwxr-xr-x',
)

install_data('data/io.github.yourname.Notes.desktop',
  install_dir: datadir / 'applications')
install_data('data/io.github.yourname.Notes.metainfo.xml',
  install_dir: datadir / 'metainfo')
install_data('data/io.github.yourname.Notes.svg',
  install_dir: datadir / 'icons' / 'hicolor' / 'scalable' / 'apps')
