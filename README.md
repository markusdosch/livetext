# livetext

Stream text to your audience. Useful for talks, trainings, and more.

[GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/) support: Text styling, code blocks, images...

![livetext demo video](https://github.com/markusdosch/livetext/blob/main/assets/livetext.gif?raw=true)

## How to run

### Preparation

```bash
nvm use # Requirement: nvm (Node Version Manager, https://github.com/nvm-sh/nvm)
npm install
```

### Run for development

```bash
npm run dev
```

### Run for production

```bash
npm run build
npm start
```

## Ideas for the future

### Features

- Protect admin page via code

### Scaling (low priority)

- Scaling content transfer: Don't transfer full content every time, but just the differences.
- Scaling number of connections: Have multiple worker VMs that can accept connections - store data in a central database.
