# Papliba Azure Deployment Plan

Status: Validated

## Objective

Host the Papliba product site on Azure and move the Sunny Bharne portfolio site to GitHub Pages.

## Current State

- `sunnybharne/papliba` is a public React + Vite static site.
- The Papliba product site currently builds to `dist/`.
- The existing GitHub Pages preview uses the `/papliba/` base path.
- `papliba.com` and `www.papliba.com` currently resolve to GoDaddy Website Builder.
- The Azure tenant is `Papliba`.
- The Azure subscription intended for web production is `Prod` (`7a98d55d-42a1-41f0-93da-3855d550a94d`).
- The existing production web resource group is `rg-prod-web-swc`.
- The existing Sunny portfolio Static Web App is `swa-sunnybharne-portfolio-001`, connected to `sunnybharne/sunnybharne`.
- `www.sunnybharne.com` DNS has been changed to GitHub Pages (`sunnybharne.github.io`), and GitHub certificate issuance is still pending.
- The `sunnybharne/sunnybharne` repository now deploys to GitHub Pages with a GitHub Actions workflow.
- `swa-papliba-prod-001` does not exist yet in Azure.

## Proposed Target State

- Sunny portfolio:
  - Source repository: `sunnybharne/sunnybharne`.
  - Hosting: GitHub Pages using a GitHub Actions deployment workflow.
  - Custom domain: `www.sunnybharne.com`.
  - DNS: `www.sunnybharne.com` CNAME points to `sunnybharne.github.io`.
  - Apex `sunnybharne.com` points to GitHub Pages A records and redirects to `www.sunnybharne.com`.
- Papliba product site:
  - Source repository: `sunnybharne/papliba`.
  - Hosting: Azure Static Web Apps.
  - Proposed resource name: `swa-papliba-prod-001`.
  - Proposed resource group: `rg-prod-web-swc`.
  - Proposed subscription: `Prod` (`7a98d55d-42a1-41f0-93da-3855d550a94d`).
  - Proposed location: `Central US` to match the existing Static Web App.
  - Proposed SKU: `Free` initially.
  - Build command: `VITE_BASE_PATH=/ npm run build`.
  - App location: `/`.
  - Output location: `dist`.
  - Custom domain: prefer `www.papliba.com` on the Azure Static Web App, with `papliba.com` forwarding to `www.papliba.com` unless DNS is moved to Azure DNS.

## Execution Plan

1. Commit and push the Sunny portfolio changes:
   - Replace the incorrect Papliba tenant/cloud copy with the actual Papliba product copy.
   - Add a GitHub Pages deployment workflow for the static Next.js export.
   - Set the GitHub Pages custom domain to `www.sunnybharne.com`.
2. Commit and push the Papliba changes:
   - Allow Vite base path to be controlled with `VITE_BASE_PATH`.
   - Update the product URL references to `https://papliba.com/`.
3. Create a new Azure Static Web App:
   - `swa-papliba-prod-001` in `rg-prod-web-swc` under the `Prod` subscription.
   - Connect deployment from `sunnybharne/papliba` using a GitHub Actions secret.
4. Add or verify GitHub Actions deployment for Papliba:
   - Build with `VITE_BASE_PATH=/`.
   - Deploy `dist` to the Azure Static Web App.
5. Cut over DNS:
   - Change `www.sunnybharne.com` from Azure Static Web Apps to GitHub Pages.
   - Change `www.papliba.com` from GoDaddy Website Builder to the new Azure Static Web App default hostname.
   - For `papliba.com`, either forward apex to `www.papliba.com`, move DNS hosting to Azure DNS for ALIAS support, or use Azure Static Web Apps `stableInboundIP` with the known A-record tradeoff.
6. After DNS propagation:
   - Disable or remove the old Sunny portfolio Azure Static Web App deployment path.
   - Keep the old Azure resource until the GitHub Pages domain is verified and serving correctly.

## Validation Plan

- Sunny portfolio:
  - `npm run lint`
  - `npm run build`
  - GitHub Pages workflow succeeds.
  - `https://www.sunnybharne.com/` serves the GitHub Pages deployment after DNS cutover.
- Papliba:
  - `npm run lint`
  - `npm run build`
  - `VITE_BASE_PATH=/ npm run build`
  - Azure Static Web Apps deployment succeeds.
  - `https://www.papliba.com/` serves the Azure deployment after DNS cutover.
  - `https://papliba.com/` redirects to `https://www.papliba.com/` or serves through the selected apex-domain option.

## Approval

- Approved by user on 26 August 2026 after confirming Papliba production must be hosted on Azure, not GitHub Pages.
- Making `pi-agent.nvim` public is separate and requires explicit approval because it changes repository visibility.

## Validation Proof

- 26 August 2026: `npm run format:check` passed.
- 26 August 2026: `npm run lint` passed.
- 26 August 2026: `npm run test` passed with 1 test file and 5 tests passing.
- 26 August 2026: `VITE_BASE_PATH=/ npm run build` passed and generated `dist/`.
- 26 August 2026: `az provider show --namespace Microsoft.Web --query "resourceTypes[?resourceType=='staticSites'].locations[]" -o tsv` confirmed `Central US` is available for Static Web Apps.
