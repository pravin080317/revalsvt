# Pen Test Security Assessment Form — Welsh Revaluation SVT
**Date:** 2026-04-08
**System:** Sales Verification Tool (SVT) — Welsh Reform Programme
**Owner:** Valuation Office Agency (VOA) — SVT Delivery Team

---

## Section 3 — Scope and System Understanding

### 3.1 Where will this solution be hosted?

| SaaS | **PaaS** | IaaS | Supplier | On-premise |
|------|----------|------|----------|------------|
|      | ✓        |      |          |            |

**Detail:**
The entire SVT stack runs on Microsoft Platform-as-a-Service offerings. No component is self-hosted or on-premise.

| Component | Hosting type |
|-----------|-------------|
| Model-driven app (CT shell) | Microsoft Power Platform (Dataverse) — PaaS |
| Canvas custom pages (SVT screens) | Microsoft Power Platform (Dataverse) — PaaS |
| PCF control (`DetailsListVOA`) | Runs inside Power Apps browser shell — PaaS |
| Dataverse plugins (`VOA.SVT.Plugins`) | Dataverse sandboxed plugin execution environment — PaaS |
| Custom APIs (unbound functions/actions) | Dataverse API layer — PaaS |
| APIM (Azure API Management) | Azure APIM — PaaS |
| Backend REST API | Azure-hosted service behind APIM — PaaS |
| SQL database | Azure SQL Database — PaaS |

---

### 3.2 If cloud, please specify cloud provider:

| GCP | AWS | **Azure** | Private | Other |
|-----|-----|-----------|---------|-------|
|     |     | ✓         |         |       |

**Detail:** Microsoft Azure, including Microsoft Power Platform (which is Azure-hosted). Tenant is the VOA/HMRC M365 tenant.

---

### 3.3 What types of interfaces/integrations are in-scope?

| Network | Infrastructure | **Application** | Server | Other |
|---------|---------------|----------------|--------|-------|
|         |               | ✓               |        |       |

**Detail — Integration chain (all application-layer):**

```
Browser (Power Apps)
  → PCF control (TypeScript, Fluent UI)
    → Dataverse Custom API (unbound function/action over OData REST)
      → C# Plugin (VOA.SVT.Plugins)
        → Azure APIM (policy-enforced gateway)
          → Backend REST API
            → Azure SQL Database
```

All integrations are application-layer only. No network-layer IP routing changes, no infrastructure provisioning, and no server OS configuration is within scope for this solution. Network boundary ownership sits with Azure / HMRC enterprise infrastructure.

---

### 3.4 Which of the following are in-scope for this solution?

| Network | Infrastructure | **Application** | Server | Workstation |
|---------|---------------|----------------|--------|-------------|
|         |               | ✓               |        |             |

**Detail:** The pen test scope covers the application layer from browser to SQL:
- Authentication and authorisation control (Entra ID, Dataverse security roles, custom persona resolution)
- Dataverse Custom API inputs and plugin logic
- APIM policy enforcement (rate limiting, auth, input validation)
- Backend API endpoints
- SQL access patterns (parameterisation, least-privilege DB account)

Physical infrastructure, networking, and server OS hardening are Microsoft Azure responsibilities (outside VOA scope).

---

### 3.5 Who are the users of the solution?

| **HMRC End Users** | **HMRC Admins** | Customers | Third Party |
|--------------------|-----------------|-----------|-------------|
| ✓                  | ✓               |           |             |

**Detail — User roles and personas:**

| Role | HMRC category | Description |
|------|--------------|-------------|
| SVT Caseworker | HMRC End User | Reviews and submits sales verification tasks (`VOA - SVT User` role / `SVT User Team`) |
| SVT QA Reviewer | HMRC End User | Reviews caseworker submissions, submits QC remarks (`VOA - SVT QA` role / `SVT QA Team`) |
| SVT Manager | HMRC End User | Assigns tasks to caseworkers and QA; full operational view (`VOA - SVT Manager` role / `SVT Manager Team`) |
| SVT Admin / Deployment team | HMRC Admin | Manages Dataverse solution deployment, APIM configuration, pipeline releases |

No public/citizen-facing access. No third-party integrations in scope for pen test.

---

### 3.6 How will users access data processed by the solution?

| Bastion | Client | Mobile | VDI | **Web Browser** |
|---------|--------|--------|-----|----------------|
|         |        |        |     | ✓              |

**Detail:** Users access the SVT via the CT model-driven Power App in a standard web browser (Chrome/Edge). The application is accessed over HTTPS. VDI access is not excluded — VOA staff may use a VDI environment — but the application itself is browser-delivered.  Access does not require a Bastion host or thick client.

---

### 3.7 Will information be presented to (any) users or system over the Internet (with or without access control and IP restrictions)?

**Yes — with access control enforced.**

Detail:
- The Power Apps model-driven app is accessed via `https://*.powerapps.com` (or tenant-branded URL) over the public internet.
- Authentication is enforced by **Microsoft Entra ID** (formerly Azure AD). All users must authenticate with their VOA/HMRC Entra identity before any data is accessible.
- The backend API is exposed via **Azure API Management**. APIM enforces authorisation before forwarding requests to the backend. Requests arrive at APIM via plugin outbound calls (not directly from the browser).
- No unauthenticated public endpoints exist. There are no IP allowlist restrictions at the Power Apps layer — reliance is placed entirely on Entra authentication and Dataverse security.
- Sales property data (address, price, transaction data) is presented to authenticated internal users only.

---

### 3.8 Who manages or will be managing the new solution (planned to be provisioned)?

The SVT solution is owned and managed by the **VOA Welsh Reform SVT Delivery Team**.

Responsibilities:
- **PCF control and Plugin code**: SVT development team (this repository / pipeline)
- **Dataverse configuration** (security roles, teams, Custom API registrations, plugin steps): SVT release pipeline via solution import
- **APIM configuration**: SVT/infrastructure team — APIM policies govern auth and routing from plugin outbound calls
- **Backend REST API**: Welsh Reform backend API team
- **Azure SQL Database**: Welsh Reform data team / DBA
- **Power Platform tenant / Dataverse environment provisioning**: VOA/HMRC platform team (separate from SVT delivery)

The CT model-driven app shell and sitemap remain owned by the **CT solution team**; SVT is deployed as a separate solution within the same environment.

---

### 3.9 Which business units within HMRC will need access to this solution and at what level (admins and users)?

| Business Unit | Access level | Roles |
|---------------|-------------|-------|
| VOA — Welsh Reform Caseworkers | End User | `VOA - SVT User` / `SVT User Team` |
| VOA — Welsh Reform QA team | End User | `VOA - SVT QA` / `SVT QA Team` |
| VOA — Welsh Reform Managers | End User | `VOA - SVT Manager` / `SVT Manager Team` |
| VOA — SVT Delivery / DevOps | Admin | Dataverse system admin, pipeline service principal |
| HMRC / VOA Platform team | Admin | Power Platform environment administration |

No other HMRC business units require access. Access is restricted via Dataverse security roles and Microsoft Entra ID group membership. A user without an assigned SVT role will see no SVT screens in the sitemap and will be blocked by plugin-level persona checks (`SvtGetUserContext` returning `hasSvtAccess=false`).

---

## Section 4 — NIST SP800-53 Control Family Filters

### 4.1 Which of the following control families are NOT in-scope for this activity?

The following control families are **NOT in-scope** for this pen test engagement:

| Control Family | Reason out of scope |
|---------------|-------------------|
| AT — Awareness & Training | Organisational training process; not a technical system control testable by pen test |
| CP — Contingency Planning | DR/BCP process managed at VOA/HMRC enterprise level; not within this system boundary |
| IR — Incident Response | Incident response procedures are enterprise-level; no system-level IR endpoint to test |
| MA — Maintenance | System maintenance processes are operational/procedural; no testable surface |
| MP — Media Protection | No physical removable media; fully cloud-hosted PaaS — Microsoft Azure responsibility |
| PE — Physical & Environmental Protection | Cloud-hosted Azure PaaS; physical security is Microsoft's responsibility under shared responsibility model |
| PL — Planning | Organisational security planning; not a system-level technical control |
| PM — Program Management | Enterprise programme governance; not a system-level technical control |
| PS — Personnel Security | HR vetting and clearance; out of scope for technical pen test |
| SA — System & Services Acquisition | Procurement and supplier controls; not in scope for this engagement |
| SR — Supply Chain Risk Management | Vendor and supply chain management; not a technical pen test target |

**In-scope control families (retained):**

| Control Family | Relevance to SVT stack |
|---------------|----------------------|
| AC — Access Control | Dataverse security roles, team/persona resolver, screen-level access guards |
| AU — Auditing & Accountability | Dataverse audit log, plugin execution traceability, APIM access logs |
| CA — Assessment, Authorization & Monitoring | This pen test; APIM monitoring; ongoing compliance posture |
| CM — Configuration Management | Solution version control, APIM policy configuration, Dataverse environment config |
| IA — Identification & Authentication | Entra ID SSO, Dataverse auth (`InitiatingUserId`-only identity, no caller-supplied identity) |
| PT — PII Processing & Transparency | Sales transaction data, property addresses, assigned caseworker identity |
| RA — Risk Assessment | This document and associated risk register |
| SC — System & Comms Protection | TLS enforcement end-to-end, APIM policy boundary, plugin sandbox isolation |
| SI — System & Information Integrity | Input validation, URL sanitisation (`sanitizeExternalUrl`), injection prevention in SQL queries |

---

### 4.2 Please ensure a justification for changes to the applied filters above is provided:

The excluded control families (AT, CP, IR, MA, MP, PE, PL, PM, PS, SA, SR) do not represent testable technical attack surfaces within the SVT application boundary. Specific justifications:

**Physical / infrastructure controls (PE, MP):**
The SVT stack is entirely hosted on Microsoft Azure PaaS. Physical data centre security, media handling, and environmental controls are Microsoft's responsibility under the Azure shared responsibility model. VOA has no physical infrastructure to test.

**Personnel and organisational controls (PS, AT, PM, PL):**
Personnel vetting, security awareness training, programme governance, and security planning are managed through HMRC/VOA enterprise HR and governance processes. These are assessed through separate organisational audits, not technical pen testing.

**Operational process controls (CP, IR, MA):**
Contingency planning (DR/BCP), incident response, and maintenance procedures are enterprise-level processes managed outside the SVT system boundary. They are not testable via application-layer pen test techniques and are reviewed separately under HMRC's operational security assurance programme.

**Procurement and supply-chain controls (SA, SR):**
Supplier and supply-chain risk is governed at the enterprise procurement and vendor management level. The SVT application does not introduce new third-party software supply chain components beyond the Microsoft Power Platform and Azure services already under enterprise assurance.

**Retained control families rationale:**
AC, AU, CA, CM, IA, PT, RA, SC, and SI are all directly exercised by the SVT application layer. The pen test should validate: authentication bypass resistance (IA/AC), privilege escalation within persona model (AC), injection attacks at APIM/API/SQL boundary (SI), data exposure risks for sales/property data (PT), and correctness of audit trail for all user actions (AU).

---

## Appendix: System Architecture Summary (for pen test scope reference)

```
┌─────────────────────────────────────────────────────────┐
│  User (VOA Staff) — Web Browser / Entra ID SSO           │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS (authenticated Power Apps session)
┌───────────────────▼─────────────────────────────────────┐
│  CT Model-Driven App (Power Platform / Dataverse)        │
│  └── Canvas Custom Pages (5 SVT screens):                │
│      Manager Assignment | Caseworker View                │
│      QA Assignment | QA View | Sales Record Search       │
│      └── PCF Control: DetailsListVOA                     │
│          (TypeScript + React + Fluent UI)                 │
└───────────────────┬─────────────────────────────────────┘
                    │ OData REST (Dataverse Custom API - GET/POST)
┌───────────────────▼─────────────────────────────────────┐
│  Dataverse Custom APIs (unbound functions/actions):      │
│  voa_GetAllSalesRecord | voa_SvtGetSalesMetadata         │
│  voa_GetViewSaleRecordById | voa_SvtTaskAssignment       │
│  voa_SvtSubmitQcRemarks | voa_SvtGetAssignableUsers      │
│  voa_SvtGetUserContext                                   │
│                                                          │
│  C# Plugins (VOA.SVT.Plugins — sandboxed):               │
│  - Identity: InitiatingUserId only (anti-spoofing)       │
│  - Persona: Manager → QA → User (allowlisted teams/roles)│
└───────────────────┬─────────────────────────────────────┘
                    │ Outbound HTTPS (plugin → APIM)
┌───────────────────▼─────────────────────────────────────┐
│  Azure API Management (APIM)                             │
│  - Authentication / subscription key enforcement         │
│  - Rate limiting                                         │
│  - Input validation policies                             │
│  - Routes: SVTGetSalesRecord | SVTGetSalesMetadata       │
│            SVTTaskAssignment                             │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS (APIM → backend API)
┌───────────────────▼─────────────────────────────────────┐
│  Backend REST API (Welsh Reform API service)             │
│  - Parameterised queries (no raw SQL                     │
│    concatenation)                                        │
│  - Least-privilege SQL account                           │
└───────────────────┬─────────────────────────────────────┘
                    │ TDS/TCP (Azure SQL)
┌───────────────────▼─────────────────────────────────────┐
│  Azure SQL Database                                      │
│  - Sales transaction and property data                   │
│  - Encrypted at rest (Azure TDE)                         │
│  - Private endpoint / VNet integration                   │
└─────────────────────────────────────────────────────────┘
```

**Key security controls in place (for pen test validation):**
1. **Anti-identity spoofing** — `SvtGetUserContext` reads only `context.InitiatingUserId`; no identity from input parameters accepted
2. **Allowlisted persona resolution** — Only `SVT Manager Team`, `SVT QA Team`, `SVT User Team` / matching named roles are accepted; no wildcard team/role matching
3. **Screen-source enforcement** — `source` parameter (`MA`, `CWV`, `QCA`, `QCV`, `SRS`) gates which operations the plugin permits
4. **URL sanitisation** — `sanitizeExternalUrl` blocks `javascript:`, `data:`, `ftp:`, and protocol-relative URLs on all external links
5. **APIM gateway boundary** — Plugins cannot be bypassed; no direct API calls from browser to backend
6. **TLS end-to-end** — All hops encrypted in transit

---

## Appendix: Application Team Position on AU Controls

The following comments reflect the **application team position** based on repository evidence, current design documentation, and known ownership boundaries between the SVT application, platform services, and operational support teams.

| Control | Application team position | Comment |
|---------|---------------------------|---------|
| **AU-5 — Response to Audit Logging Failures** | **Partially met** | The application records logging and integration failures in Dataverse plugin trace logs, including failed APIM calls and exception paths. This provides evidence that audit/logging failures can be detected at the application layer. However, automated alerting to named support personnel, storage-capacity monitoring, and formal incident-response timers are operational controls and are not evidenced in this repository. |
| **AU-6 — Audit Record Review, Analysis, and Reporting** | **Partially met** | The application generates and exposes audit-relevant records through plugin trace logs, APIM logs, and SQL-backed business audit/action history, which supports review and investigation of unusual activity. Cross-layer reconstruction is feasible for key user journeys such as assignment, QC actions, and audit-history retrieval. Formal review cadence, analyst reporting workflow, and risk-based escalation rules are not defined in application code and require operational evidence outside this repository. |
| **AU-9 — Protection of Audit Information** | **Partially met** | Access to audit-related functions and supporting data is protected through Dataverse role-based access, controlled Custom API execution, and managed platform boundaries across Dataverse, APIM, and SQL. This supports protection of audit information from general user access at the application layer. Explicit alerting on unauthorised access, modification, or deletion of audit records is not evidenced in the repo and is expected to sit with platform monitoring and operational controls. |
| **AU-11 — Audit Record Retention** | **Operational evidence required** | The application depends on platform and service retention settings for Dataverse trace logging, APIM logging, and backend SQL audit/action history. No retention-period configuration or retention-policy evidence is stored in this repository. Compliance for this control should therefore be confirmed through environment configuration and records-management evidence from the relevant platform/operations teams. |
| **AU-12 — Audit Record Generation** | **Met at application layer** | The application generates audit and trace records for key in-scope actions, including access-context resolution, task assignment, QC actions, audit-log retrieval, and plugin-to-APIM interactions. Audit history includes key event metadata and field-level old/new value changes for business events, while plugin trace logs capture execution paths, errors, and integration outcomes. This provides sufficient application-layer evidence that auditable events are generated for the major SVT workflows. |

### Notes for Assessors

- These comments are intentionally scoped to what the **application team can evidence** from code, repository documentation, and known integration design.
- Controls relating to alert routing, SIEM integration, retention periods, and operational monitoring should be validated with the **platform, infrastructure, or support teams** rather than inferred from application code.
- Where a control is marked **Partially met**, the application provides supporting data or enforcement points, but end-to-end control compliance depends on operational implementation outside this repository.
