default:
	$(info Для установки: make install)
	$(info Для подготовки релиза: make release)

install:
	npm install

release:
	gulp --force --release
