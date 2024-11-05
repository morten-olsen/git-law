```bash
npm init -y
npm add git-law
```

`gitlaw.config.mjs`

```js
import all from 'git-law/configs/all';

/** @type {import('git-law').Configuration} */
const config = {
  configs: [...all],
};

export { config };
```

```bash
npx git-law remote get-config morten-olsen gitlaw
```

```bash
npx git-law repo-config schema -o schema.json
```

`repo-config.json`

```json
{
  "$schema": "./schema.json",
  "configs": {
    "basics": {
      "description": "Hello World"
    }
  }
}
```

```bash
npx git-law local validate repo-config.json
```

```bash
npx git-law local apply repo-config.json --owner morten-olsen --name git-law
```
