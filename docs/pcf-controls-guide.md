# 🚀 Creating and Using PCF Controls

A practical, GitHub-ready guide for building **Power Apps Component Framework (PCF)** controls.

---

## 📚 What is PCF?

**PCF (Power Apps Component Framework)** lets you build custom UI components using TypeScript/JavaScript and use them in:

- Model-driven apps
- Canvas apps
- Power Pages (for selected scenarios)

PCF controls run in the Power Platform client and can interact with Dataverse field values and context.

---

## 🧩 Types of PCF Controls

### 1) 📝 Field Controls
Used to replace or enhance how a single Dataverse column is rendered.

**Examples:** custom rating picker, color selector, masked input.

### 2) 🗂️ Dataset Controls
Used for tabular/list data from Dataverse datasets.

**Examples:** custom grid, kanban board, timeline view.

### 3) 🌐 Virtual Controls (React / platform library scenarios)
Used when leveraging platform libraries and advanced rendering patterns.

**Examples:** React-based rich UI with shared platform-provided libraries.

> ✅ For most implementations, start with **field** or **dataset** controls.

---

## 🛠️ Prerequisites

Before creating a PCF control, install:

- **Node.js** (LTS recommended)
- **Power Platform CLI** (`pac`)
- (Optional) **Visual Studio Code**
- A Dataverse environment for deployment/testing

### Install / update CLI

```bash
pac install latest
pac auth create --url https://yourorg.crm.dynamics.com
```

---

## 🏗️ Create a New PCF Control

## 1) Initialize project

```bash
pac pcf init \
  --namespace Contoso.Controls \
  --name SampleControl \
  --template field
```

> Use `--template dataset` for dataset controls.

## 2) Install dependencies

```bash
npm install
```

## 3) Build

```bash
npm run build
```

## 4) Run local test harness

```bash
npm start
```

The harness helps validate UI behavior before deploying.

---

## 📄 Control Manifest (ControlManifest.Input.xml)

The manifest defines metadata and contract for your component.

### Key areas in manifest

- **Control identity**: namespace, constructor, version
- **`<property>` definitions**: input/output properties
- **`<resources>`**: code, CSS, localization files
- **`<feature-usage>`**: capabilities your control needs
- **`<data-set>`**: dataset definition (for dataset controls)

### Typical property example

```xml
<property name="value"
          display-name-key="Value_Display"
          description-key="Value_Desc"
          of-type="SingleLine.Text"
          usage="bound"
          required="true" />
```

---

## 🔁 Input and Output Properties

In PCF, properties define data flow between app and control.

### ⬇️ Input patterns

- **bound**: linked to a Dataverse field (read/write)
- **input**: configuration input (read-only from app perspective)

### ⬆️ Output pattern

- Returned from `getOutputs()` and mapped back to bound field(s)

### Common flow

1. Read values from `context.parameters.*` in `init`/`updateView`
2. Store user edits internally
3. Call `notifyOutputChanged()` when value changes
4. Return value(s) in `getOutputs()`

---

## 🧠 Important PCF Lifecycle Methods

These are the core methods every control should implement correctly:

### `init(context, notifyOutputChanged, state, container)`
- Runs once when control loads
- Initialize state, services, and initial DOM rendering

### `updateView(context)`
- Runs whenever data/context changes
- Re-render UI based on latest values

### `getOutputs()`
- Returns output values for bound properties
- Called after `notifyOutputChanged()`

### `destroy()`
- Cleanup method when control is removed
- Unsubscribe events, timers, observers, etc.

> 💡 Keep `updateView` idempotent and performant to avoid UI issues.

---

## 📦 Build and Packaging Commands

### Build only

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Rebuild clean

```bash
npm run clean
npm run rebuild
```

### Push directly to environment (dev scenarios)

```bash
pac pcf push --publisher-prefix dev
```

---

## 🚢 Deployment Options

## Option A: Quick Dev Deployment

Use `pac pcf push` for rapid iteration in development.

✅ Fastest feedback loop.

⚠️ Not ideal for controlled release pipelines.

## Option B: Solution-Based Deployment (Recommended)

1. Add PCF to a Dataverse solution
2. Export solution (managed/unmanaged)
3. Import into target environments (Test/UAT/Prod)
4. Use Azure DevOps/GitHub Actions for ALM automation

### Useful solution commands

```bash
pac solution init --publisher-name Contoso --publisher-prefix cts
pac solution add-reference --path .
pac solution version --buildversion 1.0.0.0
```

---

## 🧪 Testing Checklist

- ✅ Control renders correctly in test harness
- ✅ `updateView` responds to context changes
- ✅ Output updates trigger correctly via `notifyOutputChanged`
- ✅ No memory leaks after `destroy`
- ✅ Works in target host (model-driven/canvas)
- ✅ Accessibility basics: keyboard nav, labels, contrast

---

## 🧯 Common Pitfalls

- ❌ Forgetting to call `notifyOutputChanged()` on user edits
- ❌ Heavy logic inside `updateView()` causing lag
- ❌ Mismatch between manifest property names and `getOutputs()` keys
- ❌ Not cleaning event handlers in `destroy()`
- ❌ Overusing direct DOM updates instead of structured render pattern

---

## 📁 Suggested Folder Structure

```text
MyPcfControl/
├─ ControlManifest.Input.xml
├─ index.ts
├─ css/
│  └─ styles.css
├─ strings/
│  └─ ControlStrings.1033.resx
├─ package.json
└─ tsconfig.json
```

---

## 🔐 ALM and Best Practices

- Use semantic versioning for control updates
- Keep manifest, code, and solution versions aligned
- Store source in Git with PR review checks
- Prefer solution-based deployment for higher environments
- Add linting and build validation in CI

---

## 📌 Quick Command Reference

```bash
# Initialize control
pac pcf init --namespace Contoso.Controls --name SampleControl --template field

# Install deps
npm install

# Build
npm run build

# Run test harness
npm start

# Push to Dataverse (dev)
pac pcf push --publisher-prefix dev

# Initialize solution
pac solution init --publisher-name Contoso --publisher-prefix cts
pac solution add-reference --path .
```

---

## ✅ Summary

PCF controls let you create rich, reusable custom components for Power Apps. Start with a field/dataset template, define a clear manifest contract, implement lifecycle methods correctly, and deploy through Dataverse solutions for production-ready ALM.
