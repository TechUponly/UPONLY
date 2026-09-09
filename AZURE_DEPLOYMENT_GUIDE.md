# ☁️ Deploying UPONLY AI OS to Microsoft Azure

This guide provides step-by-step instructions to deploy the UPONLY AI OS platform to Microsoft Azure for enterprise production use.

---

## 📋 Prerequisites

1. **Azure Subscription**: Active Azure account.
2. **Azure CLI**: Installed locally (`brew install azure-cli` on macOS or download installer).
3. **Docker**: Docker Desktop installed and running locally.
4. **Git Repository**: Synced with `https://github.com/TechUponly/UPONLY.git`.

---

## 🚀 Option 1: Automated Script Deployment (Recommended)

Run the automated deployment script from the project root:

```bash
cd /Users/shamrai/Desktop/UPONLY
./deploy_to_azure.sh
```

This script automatically:
1. Creates Azure Resource Group `rg-uponly-production`.
2. Provisions Azure Container Registry `acruponlyai`.
3. Builds and pushes the multi-service Docker container.
4. Deploys Azure Web App for Containers (`https://uponly-ai-os.azurewebsites.net`).

---

## 🛠️ Option 2: Manual Azure CLI Steps

### 1. Login to Azure
```bash
az login
```

### 2. Create Resource Group & ACR
```bash
az group create --name rg-uponly-production --location eastus
az acr create --resource-group rg-uponly-production --name acruponlyai --sku Basic --admin-enabled true
```

### 3. Build Container Image on Azure
```bash
az acr build --registry acruponlyai --image uponly-ai-os:latest .
```

### 4. Create App Service Plan & Web App
```bash
az appservice plan create --name asp-uponly-plan --resource-group rg-uponly-production --is-linux --sku B1

az webapp create \
  --resource-group rg-uponly-production \
  --plan asp-uponly-plan \
  --name uponly-ai-os \
  --deployment-container-image-name acruponlyai.azurecr.io/uponly-ai-os:latest
```

### 5. Configure Web App Ports & Environment Variables
```bash
az webapp config appsettings set \
  --resource-group rg-uponly-production \
  --name uponly-ai-os \
  --settings WEBSITES_PORT=8090 ANTHROPIC_API_KEY="sk-ant-api03-..."
```

Your UPONLY AI OS instance will be accessible live at:
**`https://uponly-ai-os.azurewebsites.net`**

---

## 🔄 Option 3: Continuous Deployment via Azure DevOps

1. Push code to GitHub: `https://github.com/TechUponly/UPONLY.git`.
2. Connect repository in Azure DevOps -> Pipelines -> New Pipeline.
3. Select `azure-pipelines.yml`.
4. Configure service connection `Azure-Production-Service-Connection` and click **Run**.
