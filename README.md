# OSS Portfolio 🚀

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-18.x-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-5.x-purple)](https://vitejs.dev/)

OSS Portfolio is a premium, real-time developer portfolio dashboard built to showcase open-source contributions. It fetches your GitHub pull requests, issues, and profile data directly from the GitHub API and presents them in a beautiful, filterable, and responsive user interface.

## ✨ Features

- **📊 Comprehensive Stats**: Real-time summary of merged PRs, open PRs, ongoing issues, and solved issues.
- **🏷️ Language & Repository Aggregation**: Automatically extracts contribution distribution across various programming languages and projects.
- **🔍 Advanced Filtering**: Search, sort, and filter your contributions by repository, language, status, and comment count.
- **⚡ Performance-optimized**: Integrates local caching for repository metadata to avoid hitting GitHub API rate limits.
- **⚙️ Configurable Token**: Dynamic settings drawer to configure the target developer profile and optional Personal Access Token (PAT) securely in the browser.

## 🛠️ Tech Stack

- **Core**: React 18 (TypeScript)
- **Bundler**: Vite
- **Styling**: Modern, responsive CSS with CSS custom properties (variables)
- **Icons**: Lucide React
- **Linter**: Oxlint

## 🚀 Quick Start

Follow these steps to set up and run the project locally.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. **Fork & Clone** the repository:
   ```bash
   git clone https://github.com/Dasmat13/oss-portfolio.git
   cd oss-portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

Open your browser and navigate to the local URL (usually `http://localhost:5173`).

## 🤝 Contributing

Contributions are welcome! Please feel free to open issues, submit pull requests, or start discussions.

1. Fork this repository.
2. Create your feature branch (`git checkout -b feat/my-new-feature`).
3. Commit your changes (`git commit -m 'feat: add some feature'`).
4. Push to the branch (`git push origin feat/my-new-feature`).
5. Open a Pull Request.

Please make sure to review our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
