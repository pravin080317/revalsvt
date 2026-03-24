# PCF Deployment - Minimal Working Steps

This document contains the validated steps for packaging the PCF control using **PAC CLI 1.47.1** in this repository.

Only the commands confirmed to work in this setup are included.

---

# 1. Build the PCF Control

Run inside the **SVTList** folder:

```powershell
npm run build
```

or

```powershell
msbuild /t:build /restore
```

This generates:

```
out\controls\DetailsListVOA
```

---

# 2. Create a Dataverse Solution

⚠️ Must be run **inside an empty `solution` folder**.

```powershell
mkdir solution
cd solution
pac solution init --publisher-name "VOAWelshReform" --publisher-prefix "svt"
```

PAC creates:

```
solution/
   solution.cdsproj
   Other/
      Customizations.xml
      Relationships.xml
      Solution.xml
```

---

# 3. Add the PCF project to the solution

From inside the `solution` folder:

```powershell
pac solution add-reference --path "..\DetailsListVOA.pcfproj"
```

This is the validated project reference path for this repository.

You should see:

```
Project reference successfully added to Dataverse solution project.
```

---

# 4. Pack the Solution

Run this from the **SVTList root folder**:             

```powershell
pac solution pack --zipFile SVTListControls.zip --folder solution
```

This creates:

```
SVTListControls.zip
```

This ZIP is uploaded into Dataverse.

---

# 5. Import into Dataverse

```powershell
pac solution import --path SVTListControls.zip --environment <env-id>
```

Or via **Power Apps → Solutions → Import**.

---

# 6. Clean / Rebuild (Optional)

If needed:

```powershell
npm ci
npm run build
```

---

# Final Notes

* These commands are the validated flow for this repository.
* Do **not** use `pack --folder .` or `create-package` — they are not valid for your PAC version.
* Always reference the PCF project using:

  ```
  ..\DetailsListVOA.pcfproj
  ```
* Always run `pac solution pack` from the root of **SVTList**.
