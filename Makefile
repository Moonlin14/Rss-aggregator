develop:
	npx webpack serve

install:
	npm ci

lint:
	npx eslint .

build:
	NODE_ENV=production npx webpack

buildrm:
	rm -rf dist

lint-fix:
	npx eslint --fix .