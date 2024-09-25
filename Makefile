develop:
	npx webpack serve

install:
	npm ci

lint:
	npx eslint .

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint-fix:
	npx eslint --fix .