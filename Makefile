default:
	$(info Для установки: make install)
	$(info Для подготовки релиза: make release)

install:
	npm install
	npm install --global gulp

release:
	gulp --force --release
